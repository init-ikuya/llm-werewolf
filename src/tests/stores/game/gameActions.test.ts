
import { setActivePinia, createPinia } from 'pinia'
import { useGameActionsStore } from '../../../stores/game/gameActions'
import type { GameAction, Player } from '../../../types'
import { PlayerRole } from '../../../types'

describe('Game Actions Store', () => {
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
    }
  ]

  describe('initial state', () => {
    it('should start with empty night actions', () => {
      const store = useGameActionsStore()
      
      expect(store.nightActions).toEqual([])
      expect(store.isProcessingAction).toBe(false)
    })
  })

  describe('queueNightAction', () => {
    it('should add action to night actions queue', () => {
      const store = useGameActionsStore()
      const action: GameAction = {
        type: 'kill',
        playerId: 1,
        targetPlayerId: 0
      }
      
      store.queueNightAction(action)
      
      expect(store.nightActions).toHaveLength(1)
      expect(store.nightActions[0]).toEqual(action)
    })
  })

  describe('processNightActions', () => {
    it('should process kill actions correctly', () => {
      const store = useGameActionsStore()
      
      store.queueNightAction({ type: 'kill', playerId: 1, targetPlayerId: 0 })
      
      const results = store.processNightActions(mockPlayers)
      
      expect(results.killedPlayerId).toBe(0)
      expect(results.wasTargetProtected).toBe(false)
    })
  })
})
