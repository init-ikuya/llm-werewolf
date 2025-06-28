
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../../stores/game'
import { useGameStateStore } from '../../../stores/game/gameState'
import { useChatStore } from '../../../stores/chat'
import { useAIStore } from '../../../stores/ai'


// Mock OpenAI utilities
vi.mock('../../../utils/openai', () => ({
  generateAIResponse: vi.fn().mockResolvedValue('AI response'),
  generateAIAction: vi.fn().mockResolvedValue('Alex'),
  chooseNextSpeaker: vi.fn().mockResolvedValue('Billy')
}))

describe('Game Store Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const gameStore = useGameStore()
    gameStore.setApiKey('test-api-key')
  })

  describe('store integration', () => {
    it('should integrate game state and chat stores', () => {
      const gameStore = useGameStore()
      const chatStore = useChatStore()
      
      gameStore.initializeGame(6)
      
      // Game state should have players
      expect(gameStore.gameState.players).toHaveLength(6)
      
      // Chat should have initialization message
      expect(chatStore.messages).toHaveLength(1)
      expect(chatStore.messages[0].content).toContain('Game initialized')
    })

    it('should maintain backward compatibility', () => {
      const gameStore = useGameStore()
      
      // All original API should still work
      expect(gameStore.gameState).toBeDefined()
      expect(gameStore.alivePlayers).toBeDefined()
      expect(gameStore.werewolves).toBeDefined()
      expect(gameStore.villagers).toBeDefined()
      expect(gameStore.isGameOver).toBeDefined()
      expect(gameStore.isLoading).toBeDefined()
      
      // Methods should work
      expect(typeof gameStore.setApiKey).toBe('function')
      expect(typeof gameStore.initializeGame).toBe('function')
      expect(typeof gameStore.startGame).toBe('function')
      expect(typeof gameStore.selectPlayer).toBe('function')
      expect(typeof gameStore.performAction).toBe('function')
    })

    it('should coordinate between multiple stores', () => {
      const gameStore = useGameStore()
      const gameStateStore = useGameStateStore()
      
      // Initialize game
      gameStore.initializeGame(6)
      
      // Game state should be updated
      expect(gameStateStore.gameState.players).toHaveLength(6)
      
      // Game store should reflect combined state
      expect(gameStore.gameState.players).toHaveLength(6)
      expect(gameStore.gameState.messages).toHaveLength(1)
    })

    it('should handle game start correctly', async () => {
      const gameStore = useGameStore()
      
      gameStore.initializeGame(6)
      await gameStore.startGame()
      
      expect(gameStore.gameState.gameStarted).toBe(true)
      // Phase might be DAY after night resolution
      expect(['first_night', 'day'].includes(gameStore.gameState.phase)).toBe(true)
      expect(gameStore.gameState.messages.length).toBeGreaterThanOrEqual(3) // init + started + possibly more
    })

    it('should handle player selection', () => {
      const gameStore = useGameStore()
      
      gameStore.initializeGame(6)
      gameStore.selectPlayer(2)
      
      expect(gameStore.gameState.selectedPlayerId).toBe(2)
    })

    it('should handle message adding', () => {
      const gameStore = useGameStore()
      
      gameStore.initializeGame(6)
      gameStore.addSystemMessage('Test message')
      gameStore.addPlayerMessage(0, 'Player message')
      
      expect(gameStore.gameState.messages).toHaveLength(3) // init + system + player
    })

    it('should handle game reset', async () => {
      const gameStore = useGameStore()
      const gameStateStore = useGameStateStore()
      
      // Start a game
      gameStore.initializeGame(6)
      await gameStore.startGame()
      gameStore.selectPlayer(2)
      
      const originalPlayerCount = gameStateStore.gameState.players.length
      
      // Reset game
      await gameStore.resetGame()
      
      // Should maintain player count but reset state
      expect(gameStateStore.gameState.players).toHaveLength(originalPlayerCount)
      // Phase may be DAY after night resolution
      expect(['first_night', 'day'].includes(gameStateStore.gameState.phase)).toBe(true)
      expect(gameStateStore.gameState.gameStarted).toBe(true)
      expect(gameStateStore.gameState.selectedPlayerId).toBe(null)
    })

    it('should compute loading state from multiple stores', () => {
      const gameStore = useGameStore()
      const gameStateStore = useGameStateStore()
      const aiStore = useAIStore()
      
      // Initially not loading
      expect(gameStore.isLoading).toBe(false)
      
      // Set loading in game state
      gameStateStore.isLoading = true
      expect(gameStore.isLoading).toBe(true)
      
      // Reset and set AI generating
      gameStateStore.isLoading = false
      aiStore.isGeneratingResponse = true
      expect(gameStore.isLoading).toBe(true)
    })
  })

  describe('computed properties integration', () => {
    beforeEach(() => {
      const gameStore = useGameStore()
      gameStore.initializeGame(6)
    })

    it('should compute alive/dead players correctly', () => {
      const gameStore = useGameStore()
      const gameStateStore = useGameStateStore()
      
      // Kill a player
      gameStateStore.setPlayerAlive(1, false)
      
      expect(gameStore.alivePlayers).toHaveLength(5)
      expect(gameStore.deadPlayers).toHaveLength(1)
    })

    it('should compute game over state correctly', () => {
      const gameStore = useGameStore()
      
      // Kill all werewolves
      gameStore.gameState.players
        .filter(p => p.role === 'werewolf')
        .forEach(p => p.isAlive = false)
      
      expect(gameStore.isGameOver).toBe('villagers')
    })

    it('should maintain game state consistency', () => {
      const gameStore = useGameStore()
      const chatStore = useChatStore()
      
      // Add messages through both interfaces
      gameStore.addSystemMessage('Game message')
      chatStore.addSystemMessage('Chat message')
      
      // Should be reflected in combined state
      expect(gameStore.gameState.messages).toHaveLength(3) // init + game + chat
      expect(chatStore.messages).toHaveLength(3)
    })
  })
})
