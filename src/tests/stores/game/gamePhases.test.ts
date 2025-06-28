
import { setActivePinia, createPinia } from 'pinia'
import { useGamePhasesStore } from '../../../stores/game/gamePhases'
import type { Player } from '../../../types'
import { PlayerRole, GamePhase } from '../../../types'

describe('Game Phases Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockPlayers: Player[] = [
    {
      id: 0,
      name: 'Visitor',
      role: PlayerRole.VILLAGER,
      isAlive: true,
      isAI: false,
      isProtected: false
    },
    {
      id: 1,
      name: 'Alex',
      role: PlayerRole.WEREWOLF,
      isAlive: true,
      isAI: true,
      isProtected: false
    },
    {
      id: 2,
      name: 'Billy',
      role: PlayerRole.VILLAGER,
      isAlive: true,
      isAI: true,
      isProtected: false
    },
    {
      id: 3,
      name: 'Chris',
      role: PlayerRole.VILLAGER,
      isAlive: true,
      isAI: true,
      isProtected: false
    }
  ]

  describe('initial state', () => {
    it('should not be transitioning initially', () => {
      const store = useGamePhasesStore()
      
      expect(store.isTransitioning).toBe(false)
    })
  })

  describe('checkGameOver', () => {
    it('should return villagers when no werewolves alive', () => {
      const store = useGamePhasesStore()
      const players = mockPlayers.map(p => 
        p.role === PlayerRole.WEREWOLF ? { ...p, isAlive: false } : p
      )
      
      const result = store.checkGameOver(players)
      
      expect(result).toBe('villagers')
    })

    it('should return werewolves when werewolves >= villagers', () => {
      const store = useGamePhasesStore()
      const players = mockPlayers.map(p => 
        p.role === PlayerRole.VILLAGER ? { ...p, isAlive: false } : p
      )
      
      const result = store.checkGameOver(players)
      
      expect(result).toBe('werewolves')
    })

    it('should return null when game continues', () => {
      const store = useGamePhasesStore()
      
      const result = store.checkGameOver(mockPlayers)
      
      expect(result).toBe(null)
    })
  })

  describe('canAutoTransition', () => {
    it('should return true when human player is dead', () => {
      const store = useGamePhasesStore()
      const players = mockPlayers.map(p => 
        !p.isAI ? { ...p, isAlive: false } : p
      )
      
      const result = store.canAutoTransition(GamePhase.NIGHT, players)
      
      expect(result).toBe(true)
    })

    it('should return false for voting phase with alive human', () => {
      const store = useGamePhasesStore()
      
      const result = store.canAutoTransition(GamePhase.VOTING, mockPlayers)
      
      expect(result).toBe(false)
    })
  })

  describe('getPhaseDuration', () => {
    it('should return correct duration for day phase', () => {
      const store = useGamePhasesStore()
      
      const duration = store.getPhaseDuration(GamePhase.DAY)
      
      expect(duration).toBe(180)
    })

    it('should return 0 for other phases', () => {
      const store = useGamePhasesStore()
      
      expect(store.getPhaseDuration(GamePhase.NIGHT)).toBe(0)
      expect(store.getPhaseDuration(GamePhase.VOTING)).toBe(0)
    })
  })
})
