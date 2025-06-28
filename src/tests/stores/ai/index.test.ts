
import { setActivePinia, createPinia } from 'pinia'
import { useAIStore } from '../../../stores/ai'
import type { Player, GameMessage } from '../../../types'
import { PlayerRole } from '../../../types'

// Mock OpenAI utilities
vi.mock('../../../utils/openai', () => ({
  generateAIResponse: vi.fn().mockResolvedValue('Mocked AI response'),
  generateAIAction: vi.fn().mockResolvedValue('Alex'),
  chooseNextSpeaker: vi.fn().mockResolvedValue('Billy')
}))

describe('AI Store', () => {
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
      role: PlayerRole.SEER,
      isAlive: true,
      isAI: true,
      isProtected: false
    }
  ]

  const mockMessages: GameMessage[] = [
    {
      id: 'msg-1',
      playerId: 0,
      playerName: 'Visitor',
      content: 'Hello everyone',
      timestamp: new Date(),
      type: 'player'
    }
  ]

  describe('initial state', () => {
    it('should not be generating response initially', () => {
      const store = useAIStore()
      
      expect(store.isGeneratingResponse).toBe(false)
    })
  })

  describe('generateAIVotes', () => {
    it('should generate votes for all living AI players', async () => {
      const store = useAIStore()
      
      const votes = await store.generateAIVotes(mockPlayers, mockMessages)
      
      expect(Object.keys(votes)).toHaveLength(2) // 2 AI players
      expect(votes[1]).toBe(1) // Alex's vote (mocked to return 'Alex' -> ID 1)
      expect(votes[2]).toBe(1) // Billy's vote
    })

    it('should only include alive AI players', async () => {
      const store = useAIStore()
      const players = mockPlayers.map(p => 
        p.id === 1 ? { ...p, isAlive: false } : p
      )
      
      const votes = await store.generateAIVotes(players, mockMessages)
      
      expect(Object.keys(votes)).toHaveLength(1) // Only Billy alive
      expect(votes[2]).toBeDefined()
      expect(votes[1]).toBeUndefined()
    })
  })

  describe('generateAINightActions', () => {
    it('should generate night actions for AI players', async () => {
      const store = useAIStore()
      
      const actions = await store.generateAINightActions(mockPlayers, mockMessages, 'night')
      
      expect(actions).toHaveLength(2) // Werewolf kill + Seer investigate
      expect(actions.some(a => a.type === 'kill')).toBe(true)
      expect(actions.some(a => a.type === 'investigate')).toBe(true)
    })

    it('should not generate werewolf kills on first night', async () => {
      const store = useAIStore()
      
      const actions = await store.generateAINightActions(mockPlayers, mockMessages, 'first_night')
      
      const killActions = actions.filter(a => a.type === 'kill')
      expect(killActions).toHaveLength(0)
    })
  })

  describe('generateAIDayTalk', () => {
    it('should generate response for AI player', async () => {
      const store = useAIStore()
      const aiPlayer = mockPlayers[1]
      const gameContext = {
        phase: 'day',
        dayNumber: 1,
        players: mockPlayers,
        messages: mockMessages,
        currentPlayerId: 1
      }
      
      const response = await store.generateAIDayTalk(aiPlayer, gameContext)
      
      expect(response).toBe('Mocked AI response')
    })

    it('should throw error for non-AI player', async () => {
      const store = useAIStore()
      const humanPlayer = mockPlayers[0]
      const gameContext = {
        phase: 'day',
        dayNumber: 1,
        players: mockPlayers,
        messages: mockMessages,
        currentPlayerId: 0
      }
      
      await expect(store.generateAIDayTalk(humanPlayer, gameContext))
        .rejects.toThrow('Player is not an AI')
    })

    it('should set generating state correctly', async () => {
      const store = useAIStore()
      const aiPlayer = mockPlayers[1]
      const gameContext = {
        phase: 'day',
        dayNumber: 1,
        players: mockPlayers,
        messages: mockMessages,
        currentPlayerId: 1
      }
      
      expect(store.isGeneratingResponse).toBe(false)
      
      const promise = store.generateAIDayTalk(aiPlayer, gameContext)
      expect(store.isGeneratingResponse).toBe(true)
      
      await promise
      expect(store.isGeneratingResponse).toBe(false)
    })
  })

  describe('discussion loop', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should start discussion loop', () => {
      const store = useAIStore()
      const mockCallback = vi.fn()
      const gameContext = {
        phase: 'day',
        dayNumber: 1,
        players: mockPlayers,
        messages: mockMessages,
        isGameOver: false
      }
      
      store.startDiscussionLoop(gameContext, mockCallback)
      
      // Should not immediately call callback
      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('should stop discussion loop', () => {
      const store = useAIStore()
      const mockCallback = vi.fn()
      const gameContext = {
        phase: 'day',
        dayNumber: 1,
        players: mockPlayers,
        messages: mockMessages,
        isGameOver: false
      }
      
      store.startDiscussionLoop(gameContext, mockCallback)
      store.stopDiscussionLoop()
      
      // Fast forward time - callback should not be called
      vi.advanceTimersByTime(15000)
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })
})
