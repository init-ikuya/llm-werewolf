import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import GameOverOverlay from './GameOverOverlay.vue'
import type { Player } from '../../types'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      game: {
        systemMessages: {
          gameOver: 'Game Over! {winner} won!'
        },
        winner: {
          villagers: 'Villagers',
          werewolves: 'Werewolves'
        }
      }
    }
  }
})

const createMockPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 1,
  name: 'Test Player',
  role: 'villager',
  isAlive: true,
  isAI: false,
  isProtected: false,
  ...overrides
})

describe('GameOverOverlay', () => {
  const mockPlayers: Player[] = [
    createMockPlayer({ id: 1, name: 'Alice', role: 'villager', isAlive: true }),
    createMockPlayer({ id: 2, name: 'Bob', role: 'werewolf', isAlive: false }),
    createMockPlayer({ id: 3, name: 'Charlie', role: 'seer', isAlive: true }),
    createMockPlayer({ id: 4, name: 'Diana', role: 'knight', isAlive: false })
  ]

  const defaultProps = {
    winner: null as "villagers" | "werewolves" | null,
    players: mockPlayers
  }

  it('renders game over overlay with basic structure', () => {
    const wrapper = mount(GameOverOverlay, {
      props: defaultProps,
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('.game-over-overlay').exists()).toBe(true)
    expect(wrapper.find('.game-over-content').exists()).toBe(true)
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('.player-roles').exists()).toBe(true)
    expect(wrapper.find('.play-again-button').exists()).toBe(true)
  })

  describe('Winner display', () => {
    it('displays villagers as winner correctly', () => {
      const wrapper = mount(GameOverOverlay, {
        props: {
          ...defaultProps,
          winner: 'villagers'
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('h1').text()).toContain('Villagers')
      expect(wrapper.find('.winner').text()).toBe('Villagers win!')
    })

    it('displays werewolves as winner correctly', () => {
      const wrapper = mount(GameOverOverlay, {
        props: {
          ...defaultProps,
          winner: 'werewolves'
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('h1').text()).toContain('Werewolves')
      expect(wrapper.find('.winner').text()).toBe('Werewolves win!')
    })

    it('handles null winner gracefully', () => {
      const wrapper = mount(GameOverOverlay, {
        props: {
          ...defaultProps,
          winner: null
        },
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('.winner').text()).toBe('win!')
    })
  })

  describe('Players display', () => {
    it('renders all players in the grid', () => {
      const wrapper = mount(GameOverOverlay, {
        props: defaultProps,
        global: {
          plugins: [i18n]
        }
      })

      const playerCards = wrapper.findAll('.player-card')
      expect(playerCards).toHaveLength(4)
    })

    it('displays player information correctly', () => {
      const wrapper = mount(GameOverOverlay, {
        props: defaultProps,
        global: {
          plugins: [i18n]
        }
      })

      const firstPlayerCard = wrapper.find('.player-card')
      expect(firstPlayerCard.find('.player-name').text()).toBe('Alice')
      expect(firstPlayerCard.find('.player-role').text()).toBe('villager')
      expect(firstPlayerCard.find('.player-image').exists()).toBe(true)
    })

    it('applies dead class to deceased players', () => {
      const wrapper = mount(GameOverOverlay, {
        props: defaultProps,
        global: {
          plugins: [i18n]
        }
      })

      const playerCards = wrapper.findAll('.player-card')
      // Alice (index 0) is alive, should not have dead class
      expect(playerCards[0].classes()).not.toContain('dead')
      // Bob (index 1) is dead, should have dead class
      expect(playerCards[1].classes()).toContain('dead')
      // Charlie (index 2) is alive, should not have dead class
      expect(playerCards[2].classes()).not.toContain('dead')
      // Diana (index 3) is dead, should have dead class
      expect(playerCards[3].classes()).toContain('dead')
    })

    it('displays correct role images', () => {
      const wrapper = mount(GameOverOverlay, {
        props: defaultProps,
        global: {
          plugins: [i18n]
        }
      })

      const playerImages = wrapper.findAll('.player-image')
      expect(playerImages[0].attributes('alt')).toBe('villager')
      expect(playerImages[1].attributes('alt')).toBe('werewolf')
      expect(playerImages[2].attributes('alt')).toBe('seer')
      expect(playerImages[3].attributes('alt')).toBe('knight')
    })

    it('uses villager image as fallback for unknown roles', () => {
      const playersWithUnknownRole = [
        createMockPlayer({ id: 1, name: 'Unknown', role: 'unknown_role' as any })
      ]

      const wrapper = mount(GameOverOverlay, {
        props: {
          ...defaultProps,
          players: playersWithUnknownRole
        },
        global: {
          plugins: [i18n]
        }
      })

      const playerImage = wrapper.find('.player-image')
      expect(playerImage.attributes('src')).toContain('villager')
    })
  })

  describe('Play again functionality', () => {
    it('emits play-again event when button is clicked', async () => {
      const wrapper = mount(GameOverOverlay, {
        props: defaultProps,
        global: {
          plugins: [i18n]
        }
      })

      const playAgainButton = wrapper.find('.play-again-button')
      await playAgainButton.trigger('click')

      expect(wrapper.emitted()['play-again']).toBeTruthy()
      expect(wrapper.emitted()['play-again']).toHaveLength(1)
    })

    it('renders play again button with correct text', () => {
      const wrapper = mount(GameOverOverlay, {
        props: defaultProps,
        global: {
          plugins: [i18n]
        }
      })

      const playAgainButton = wrapper.find('.play-again-button')
      expect(playAgainButton.text()).toBe('Play Again')
    })
  })

  describe('Styling', () => {
    it('applies correct CSS classes', () => {
      const wrapper = mount(GameOverOverlay, {
        props: defaultProps,
        global: {
          plugins: [i18n]
        }
      })

      expect(wrapper.find('.game-over-overlay').exists()).toBe(true)
      expect(wrapper.find('.game-over-content').exists()).toBe(true)
      expect(wrapper.find('.players-grid').exists()).toBe(true)
    })

    it('has proper player roles section', () => {
      const wrapper = mount(GameOverOverlay, {
        props: defaultProps,
        global: {
          plugins: [i18n]
        }
      })

      const playerRolesSection = wrapper.find('.player-roles')
      expect(playerRolesSection.exists()).toBe(true)
      expect(playerRolesSection.find('h3').text()).toBe('Player Roles')
    })
  })

  describe('Edge cases', () => {
    it('handles empty players array', () => {
      const wrapper = mount(GameOverOverlay, {
        props: {
          ...defaultProps,
          players: []
        },
        global: {
          plugins: [i18n]
        }
      })

      const playerCards = wrapper.findAll('.player-card')
      expect(playerCards).toHaveLength(0)
    })

    it('handles single player', () => {
      const singlePlayer = [createMockPlayer({ id: 1, name: 'Solo', role: 'villager' })]

      const wrapper = mount(GameOverOverlay, {
        props: {
          ...defaultProps,
          players: singlePlayer
        },
        global: {
          plugins: [i18n]
        }
      })

      const playerCards = wrapper.findAll('.player-card')
      expect(playerCards).toHaveLength(1)
      expect(playerCards[0].find('.player-name').text()).toBe('Solo')
    })

    it('handles all roles correctly', () => {
      const allRolePlayers = [
        createMockPlayer({ id: 1, name: 'V', role: 'villager' }),
        createMockPlayer({ id: 2, name: 'W', role: 'werewolf' }),
        createMockPlayer({ id: 3, name: 'S', role: 'seer' }),
        createMockPlayer({ id: 4, name: 'K', role: 'knight' }),
        createMockPlayer({ id: 5, name: 'M', role: 'medium' })
      ]

      const wrapper = mount(GameOverOverlay, {
        props: {
          ...defaultProps,
          players: allRolePlayers
        },
        global: {
          plugins: [i18n]
        }
      })

      const playerCards = wrapper.findAll('.player-card')
      expect(playerCards).toHaveLength(5)
      
      const roles = playerCards.map(card => card.find('.player-role').text())
      expect(roles).toEqual(['villager', 'werewolf', 'seer', 'knight', 'medium'])
    })
  })
}) 