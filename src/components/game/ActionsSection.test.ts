import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ActionsSection from './ActionsSection.vue'
import { GamePhase, PlayerRole } from '../../types'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      game: {
        actions: {
          vote: 'Vote',
          kill: 'Kill',
          investigate: 'Investigate',
          protect: 'Protect',
          startGame: 'Start Game'
        }
      }
    }
  }
})

describe('ActionsSection', () => {
  const defaultProps = {
    phase: GamePhase.SETUP,
    gameStarted: false,
    localPlayerRole: null,
    isLocalPlayerAlive: true,
    selectedPlayerId: null
  }

  it('renders actions section with title', () => {
    const wrapper = mount(ActionsSection, {
      props: defaultProps,
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('h3').text()).toBe('Actions')
    expect(wrapper.find('.actions-section').exists()).toBe(true)
  })

  describe('Start game button', () => {
    it('shows start game button when game has not started', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          gameStarted: false
        },
        global: {
          plugins: [i18n]
        }
      })

      const startButton = wrapper.find('.action-button')
      expect(startButton.exists()).toBe(true)
      expect(startButton.text()).toBe('Start Game')
    })

    it('hides start game button when game has started', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          gameStarted: true
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.text()).not.toContain('Start Game')
    })

    it('emits start-game event when start button is clicked', async () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          gameStarted: false
        },
        global: {
          plugins: [i18n]
        }
      })

      const startButton = wrapper.find('.action-button')
      await startButton.trigger('click')

      expect(wrapper.emitted()['start-game']).toBeTruthy()
      expect(wrapper.emitted()['start-game']).toHaveLength(1)
    })
  })

  describe('Vote button', () => {
    it('shows vote button during voting phase when player is alive', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.VOTING,
          isLocalPlayerAlive: true
        },
        global: {
          plugins: [i18n]
        }
      })

      const voteButton = wrapper.find('.action-button.vote')
      expect(voteButton.exists()).toBe(true)
      expect(voteButton.text()).toBe('Vote')
    })

    it('hides vote button when not in voting phase', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.DAY,
          isLocalPlayerAlive: true
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('.action-button.vote').exists()).toBe(false)
    })

    it('hides vote button when player is dead', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.VOTING,
          isLocalPlayerAlive: false
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('.action-button.vote').exists()).toBe(false)
    })

    it('disables vote button when no player is selected', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.VOTING,
          isLocalPlayerAlive: true,
          selectedPlayerId: null
        },
        global: {
          plugins: [i18n]
        }
      })

      const voteButton = wrapper.find('.action-button.vote')
      expect(voteButton.attributes('disabled')).toBeDefined()
    })

    it('enables vote button when a player is selected', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.VOTING,
          isLocalPlayerAlive: true,
          selectedPlayerId: 1
        },
        global: {
          plugins: [i18n]
        }
      })

      const voteButton = wrapper.find('.action-button.vote')
      expect(voteButton.attributes('disabled')).toBeUndefined()
    })

    it('emits vote event when vote button is clicked', async () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.VOTING,
          isLocalPlayerAlive: true,
          selectedPlayerId: 1
        },
        global: {
          plugins: [i18n]
        }
      })

      const voteButton = wrapper.find('.action-button.vote')
      await voteButton.trigger('click')

      expect(wrapper.emitted()['vote']).toBeTruthy()
      expect(wrapper.emitted()['vote']).toHaveLength(1)
    })
  })

  describe('Kill button (Werewolf)', () => {
    it('shows kill button during night phases when player is werewolf and alive', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.NIGHT,
          localPlayerRole: PlayerRole.WEREWOLF,
          isLocalPlayerAlive: true
        },
        global: {
          plugins: [i18n]
        }
      })

      const killButton = wrapper.find('.action-button.kill')
      expect(killButton.exists()).toBe(true)
      expect(killButton.text()).toBe('Kill')
    })

    it('shows kill button during first night when player is werewolf', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.FIRST_NIGHT,
          localPlayerRole: PlayerRole.WEREWOLF,
          isLocalPlayerAlive: true
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('.action-button.kill').exists()).toBe(true)
    })

    it('hides kill button when player is not werewolf', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.NIGHT,
          localPlayerRole: PlayerRole.VILLAGER,
          isLocalPlayerAlive: true
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('.action-button.kill').exists()).toBe(false)
    })

    it('hides kill button during day phases', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.DAY,
          localPlayerRole: PlayerRole.WEREWOLF,
          isLocalPlayerAlive: true
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('.action-button.kill').exists()).toBe(false)
    })

    it('emits kill event when kill button is clicked', async () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.NIGHT,
          localPlayerRole: PlayerRole.WEREWOLF,
          isLocalPlayerAlive: true,
          selectedPlayerId: 1
        },
        global: {
          plugins: [i18n]
        }
      })

      const killButton = wrapper.find('.action-button.kill')
      await killButton.trigger('click')

      expect(wrapper.emitted()['kill']).toBeTruthy()
      expect(wrapper.emitted()['kill']).toHaveLength(1)
    })
  })

  describe('Investigate button (Seer)', () => {
    it('shows investigate button during night phases when player is seer and alive', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.NIGHT,
          localPlayerRole: PlayerRole.SEER,
          isLocalPlayerAlive: true
        },
        global: {
          plugins: [i18n]
        }
      })

      const investigateButton = wrapper.find('.action-button.investigate')
      expect(investigateButton.exists()).toBe(true)
      expect(investigateButton.text()).toBe('Investigate')
    })

    it('hides investigate button when player is not seer', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.NIGHT,
          localPlayerRole: PlayerRole.VILLAGER,
          isLocalPlayerAlive: true
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('.action-button.investigate').exists()).toBe(false)
    })

    it('emits investigate event when investigate button is clicked', async () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.NIGHT,
          localPlayerRole: PlayerRole.SEER,
          isLocalPlayerAlive: true,
          selectedPlayerId: 1
        },
        global: {
          plugins: [i18n]
        }
      })

      const investigateButton = wrapper.find('.action-button.investigate')
      await investigateButton.trigger('click')

      expect(wrapper.emitted()['investigate']).toBeTruthy()
      expect(wrapper.emitted()['investigate']).toHaveLength(1)
    })
  })

  describe('Protect button (Knight)', () => {
    it('shows protect button during night phases when player is knight and alive', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.NIGHT,
          localPlayerRole: PlayerRole.KNIGHT,
          isLocalPlayerAlive: true
        },
        global: {
          plugins: [i18n]
        }
      })

      const protectButton = wrapper.find('.action-button.protect')
      expect(protectButton.exists()).toBe(true)
      expect(protectButton.text()).toBe('Protect')
    })

    it('hides protect button when player is not knight', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.NIGHT,
          localPlayerRole: PlayerRole.VILLAGER,
          isLocalPlayerAlive: true
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('.action-button.protect').exists()).toBe(false)
    })

    it('emits protect event when protect button is clicked', async () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.NIGHT,
          localPlayerRole: PlayerRole.KNIGHT,
          isLocalPlayerAlive: true,
          selectedPlayerId: 1
        },
        global: {
          plugins: [i18n]
        }
      })

      const protectButton = wrapper.find('.action-button.protect')
      await protectButton.trigger('click')

      expect(wrapper.emitted()['protect']).toBeTruthy()
      expect(wrapper.emitted()['protect']).toHaveLength(1)
    })
  })

  describe('Button disabled states', () => {
    it('disables all action buttons when no player is selected', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.NIGHT,
          localPlayerRole: PlayerRole.WEREWOLF,
          isLocalPlayerAlive: true,
          selectedPlayerId: null
        },
        global: {
          plugins: [i18n]
        }
      })

      const killButton = wrapper.find('.action-button.kill')
      expect(killButton.attributes('disabled')).toBeDefined()
    })

    it('enables action buttons when a player is selected', () => {
      const wrapper = mount(ActionsSection, {
        props: {
          ...defaultProps,
          phase: GamePhase.NIGHT,
          localPlayerRole: PlayerRole.WEREWOLF,
          isLocalPlayerAlive: true,
          selectedPlayerId: 1
        },
        global: {
          plugins: [i18n]
        }
      })

      const killButton = wrapper.find('.action-button.kill')
      expect(killButton.attributes('disabled')).toBeUndefined()
    })
  })
}) 