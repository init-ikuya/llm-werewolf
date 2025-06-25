import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import PlayersSection from './PlayersSection.vue'
import { PlayerRole, type Player } from '../../types'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      game: {
        players: 'Players'
      }
    }
  }
})

const createMockPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 1,
  name: 'Test Player',
  role: PlayerRole.VILLAGER,
  isAlive: true,
  isAI: true,
  isProtected: false,
  ...overrides
})

describe('PlayersSection', () => {
  const defaultProps = {
    players: [],
    selectedPlayerId: null,
    isGameOver: false,
    isHumanPlayerAlive: true
  }

  it('renders players section with title', () => {
    const wrapper = mount(PlayersSection, {
      props: defaultProps,
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('h2').text()).toBe('Players')
    expect(wrapper.find('.players-section').exists()).toBe(true)
  })

  it('renders players grid with player cards', () => {
    const players = [
      createMockPlayer({ id: 0, name: 'Human Player', isAI: false }),
      createMockPlayer({ id: 1, name: 'AI Player 1' }),
      createMockPlayer({ id: 2, name: 'AI Player 2' })
    ]

    const wrapper = mount(PlayersSection, {
      props: {
        ...defaultProps,
        players
      },
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.findAll('.player-card')).toHaveLength(3)
    expect(wrapper.find('.player-card').text()).toContain('Human Player')
  })

  describe('Player selection', () => {
    it('emits select-player event when alive player is clicked', async () => {
      const players = [
        createMockPlayer({ id: 1, name: 'Player 1', isAlive: true }),
        createMockPlayer({ id: 2, name: 'Player 2', isAlive: false })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players
        },
        global: {
          plugins: [i18n]
        }
      })

      const alivePlayerCard = wrapper.findAll('.player-card')[0]
      await alivePlayerCard.trigger('click')

      expect(wrapper.emitted()['select-player']).toBeTruthy()
      expect(wrapper.emitted()['select-player'][0]).toEqual([1])
    })

    it('does not emit select-player event when dead player is clicked', async () => {
      const players = [
        createMockPlayer({ id: 1, name: 'Dead Player', isAlive: false })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players
        },
        global: {
          plugins: [i18n]
        }
      })

      const deadPlayerCard = wrapper.find('.player-card')
      await deadPlayerCard.trigger('click')

      expect(wrapper.emitted()['select-player']).toBeFalsy()
    })

    it('applies selected class to selected player', () => {
      const players = [
        createMockPlayer({ id: 1, name: 'Player 1' }),
        createMockPlayer({ id: 2, name: 'Player 2' })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players,
          selectedPlayerId: 1
        },
        global: {
          plugins: [i18n]
        }
      })

      const selectedCard = wrapper.findAll('.player-card')[0]
      const unselectedCard = wrapper.findAll('.player-card')[1]

      expect(selectedCard.classes()).toContain('is-selected')
      expect(unselectedCard.classes()).not.toContain('is-selected')
    })
  })

  describe('Player status classes', () => {
    it('applies is-dead class to dead players', () => {
      const players = [
        createMockPlayer({ id: 1, name: 'Alive Player', isAlive: true }),
        createMockPlayer({ id: 2, name: 'Dead Player', isAlive: false })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players
        },
        global: {
          plugins: [i18n]
        }
      })

      const aliveCard = wrapper.findAll('.player-card')[0]
      const deadCard = wrapper.findAll('.player-card')[1]

      expect(aliveCard.classes()).not.toContain('is-dead')
      expect(deadCard.classes()).toContain('is-dead')
    })

    it('applies is-human class to human player', () => {
      const players = [
        createMockPlayer({ id: 0, name: 'Human Player', isAI: false }),
        createMockPlayer({ id: 1, name: 'AI Player', isAI: true })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players
        },
        global: {
          plugins: [i18n]
        }
      })

      const humanCard = wrapper.findAll('.player-card')[0]
      const aiCard = wrapper.findAll('.player-card')[1]

      expect(humanCard.classes()).toContain('is-human')
      expect(aiCard.classes()).not.toContain('is-human')
    })
  })

  describe('Role visibility logic', () => {
    it('shows role for human player (current player)', () => {
      const players = [
        createMockPlayer({ id: 0, name: 'Human Player', role: PlayerRole.SEER, isAI: false })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('.player-role span').text()).toBe(PlayerRole.SEER)
    })

    it('shows all roles when human player is dead', () => {
      const players = [
        createMockPlayer({ id: 0, name: 'Human Player', role: PlayerRole.SEER, isAI: false }),
        createMockPlayer({ id: 1, name: 'AI Player', role: PlayerRole.WEREWOLF })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players,
          isHumanPlayerAlive: false
        },
        global: {
          plugins: [i18n]
        }
      })

      const roleElements = wrapper.findAll('.player-role span')
      expect(roleElements[0].text()).toBe(PlayerRole.SEER)
      expect(roleElements[1].text()).toBe(PlayerRole.WEREWOLF)
    })

    it('shows role of dead players when current player is medium', () => {
      const players = [
        createMockPlayer({ id: 0, name: 'Human Medium', role: PlayerRole.MEDIUM, isAI: false }),
        createMockPlayer({ id: 1, name: 'Dead Player', role: PlayerRole.WEREWOLF, isAlive: false }),
        createMockPlayer({ id: 2, name: 'Alive Player', role: PlayerRole.VILLAGER, isAlive: true })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players
        },
        global: {
          plugins: [i18n]
        }
      })

      const roleElements = wrapper.findAll('.player-role span')
      expect(roleElements[0].text()).toBe(PlayerRole.MEDIUM) // human player
      expect(roleElements[1].text()).toBe(PlayerRole.WEREWOLF) // dead player
      expect(roleElements[2].text()).toBe('???') // alive player (role hidden)
    })

    it('shows werewolf roles when current player is werewolf', () => {
      const players = [
        createMockPlayer({ id: 0, name: 'Human Werewolf', role: PlayerRole.WEREWOLF, isAI: false }),
        createMockPlayer({ id: 1, name: 'AI Werewolf', role: PlayerRole.WEREWOLF }),
        createMockPlayer({ id: 2, name: 'Villager', role: PlayerRole.VILLAGER })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players
        },
        global: {
          plugins: [i18n]
        }
      })

      const roleElements = wrapper.findAll('.player-role span')
      expect(roleElements[0].text()).toBe(PlayerRole.WEREWOLF) // human werewolf
      expect(roleElements[1].text()).toBe(PlayerRole.WEREWOLF) // AI werewolf
      expect(roleElements[2].text()).toBe('???') // villager (role hidden)
    })

    it('hides roles in normal cases', () => {
      const players = [
        createMockPlayer({ id: 0, name: 'Human Villager', role: PlayerRole.VILLAGER, isAI: false }),
        createMockPlayer({ id: 1, name: 'AI Player', role: PlayerRole.SEER })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players
        },
        global: {
          plugins: [i18n]
        }
      })

      const roleElements = wrapper.findAll('.player-role span')
      expect(roleElements[0].text()).toBe(PlayerRole.VILLAGER) // human player
      expect(roleElements[1].text()).toBe('???') // AI player (role hidden)
    })
  })

  describe('Role images', () => {
    it('shows role image when role is visible', () => {
      const players = [
        createMockPlayer({ id: 0, name: 'Human Player', role: PlayerRole.SEER, isAI: false })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players
        },
        global: {
          plugins: [i18n]
        }
      })

      const roleImage = wrapper.find('.role-icon-img')
      expect(roleImage.exists()).toBe(true)
      expect(roleImage.attributes('alt')).toBe(PlayerRole.SEER)
    })

    it('does not show role image when role is hidden', () => {
      const players = [
        createMockPlayer({ id: 0, name: 'Human Villager', role: PlayerRole.VILLAGER, isAI: false }),
        createMockPlayer({ id: 1, name: 'AI Player', role: PlayerRole.SEER })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players
        },
        global: {
          plugins: [i18n]
        }
      })

      const roleImages = wrapper.findAll('.role-icon-img')
      expect(roleImages).toHaveLength(1) // Only human player's role image
    })
  })

  describe('Edge cases', () => {
    it('handles empty players array', () => {
      const wrapper = mount(PlayersSection, {
        props: defaultProps,
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.findAll('.player-card')).toHaveLength(0)
      expect(wrapper.find('.players-grid').exists()).toBe(true)
    })

    it('handles missing human player', () => {
      const players = [
        createMockPlayer({ id: 1, name: 'AI Player 1' }),
        createMockPlayer({ id: 2, name: 'AI Player 2' })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players
        },
        global: {
          plugins: [i18n]
        }
      })

      // Should not crash and should render AI players
      expect(wrapper.findAll('.player-card')).toHaveLength(2)
      expect(wrapper.findAll('.is-human')).toHaveLength(0)
    })

    it('handles all players dead scenario', () => {
      const players = [
        createMockPlayer({ id: 0, name: 'Human Player', isAlive: false, isAI: false }),
        createMockPlayer({ id: 1, name: 'AI Player', isAlive: false })
      ]

      const wrapper = mount(PlayersSection, {
        props: {
          ...defaultProps,
          players,
          isHumanPlayerAlive: false
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.findAll('.is-dead')).toHaveLength(2)
      // All roles should be visible when human player is dead
      const roleElements = wrapper.findAll('.player-role span')
      roleElements.forEach(element => {
        expect(element.text()).not.toBe('???')
      })
    })
  })
}) 