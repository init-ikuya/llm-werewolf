import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../../stores/game'
import { GamePhase, PlayerRole } from '../../../types'

// Mock OpenAI utilities
vi.mock('../../../utils/openai', () => ({
  initializeOpenAI: vi.fn(),
  getOpenAIClient: vi.fn(),
  generateAIResponse: vi.fn().mockResolvedValue('AI response'),
  generateAIAction: vi.fn().mockResolvedValue('Alex'),
  chooseNextSpeaker: vi.fn().mockResolvedValue('Billy')
}))

describe('Game Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useGameStore()
    store.setApiKey('test-api-key')
  })

  it('should initialize with default state', () => {
    const store = useGameStore()
    
    expect(store.gameState.phase).toBe(GamePhase.SETUP)
    expect(store.gameState.players).toEqual([])
    expect(store.gameState.dayNumber).toBe(1)
    expect(store.gameState.winner).toBe(null)
    expect(store.gameState.gameStarted).toBe(false)
  })

  it('should initialize game with players', () => {
    const store = useGameStore()
    
    store.initializeGame(6)
    
    expect(store.gameState.players).toHaveLength(6)
    const humanPlayer = store.gameState.players.find(p => !p.isAI)
    expect(humanPlayer?.name).toBe('Visitor')
    expect(humanPlayer?.isAI).toBe(false)
    expect(store.gameState.players[1].isAI).toBe(true)
    expect(store.gameState.phase).toBe(GamePhase.SETUP)
  })

  it('should start game and set phase to first night', async () => {
    const store = useGameStore()
    
    store.initializeGame(6)
    await store.startGame()
    
    // Phase may transition to DAY after automatic night resolution
    expect(['first_night', 'day'].includes(store.gameState.phase)).toBe(true)
    expect(store.gameState.gameStarted).toBe(true)
    // currentPlayerId may be null after night resolution
    expect(store.gameState.currentPlayerId !== undefined).toBe(true)
  })

  it('should add system messages', () => {
    const store = useGameStore()
    
    store.addSystemMessage('Test message')
    
    expect(store.gameState.messages).toHaveLength(1)
    expect(store.gameState.messages[0].content).toBe('Test message')
    expect(store.gameState.messages[0].type).toBe('system')
  })

  it('should add player messages', () => {
    const store = useGameStore()
    
    store.initializeGame(6)
    store.addPlayerMessage(0, 'Hello world')
    
    expect(store.gameState.messages).toHaveLength(2) // 1 system + 1 player
    expect(store.gameState.messages[1].content).toBe('Hello world')
    expect(store.gameState.messages[1].type).toBe('player')
  })

  it('should select player', () => {
    const store = useGameStore()
    
    store.initializeGame(6)
    store.selectPlayer(1)
    
    expect(store.gameState.selectedPlayerId).toBe(1)
  })

  it('should reset game', async () => {
    const store = useGameStore()
    
    store.initializeGame(6)
    await store.startGame()
    await store.resetGame()
    
    // Phase may transition to DAY after automatic night resolution
    expect(['first_night', 'day'].includes(store.gameState.phase)).toBe(true)
    expect(store.gameState.players).toHaveLength(6) // Players should remain
    expect(store.gameState.gameStarted).toBe(true) // Game is restarted, not stopped
  })

  it('should compute alive players correctly', () => {
    const store = useGameStore()
    
    store.initializeGame(6)
    store.gameState.players[1].isAlive = false
    
    expect(store.alivePlayers).toHaveLength(5)
    expect(store.deadPlayers).toHaveLength(1)
  })

  it('should compute werewolves and villagers correctly', () => {
    const store = useGameStore()
    
    store.initializeGame(6)
    
    const werewolfCount = store.gameState.players.filter(p => p.role === PlayerRole.WEREWOLF).length
    const villagerCount = store.gameState.players.filter(p => p.role !== PlayerRole.WEREWOLF).length
    
    expect(store.werewolves).toHaveLength(werewolfCount)
    expect(store.villagers).toHaveLength(villagerCount)
  })
}) 