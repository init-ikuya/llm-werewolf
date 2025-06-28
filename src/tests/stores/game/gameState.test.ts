
import { setActivePinia, createPinia } from 'pinia'
import { useGameStateStore } from '../../../stores/game/gameState'
import { GamePhase, PlayerRole } from '../../../types'

describe('Game State Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const store = useGameStateStore()
      
      expect(store.gameState.phase).toBe(GamePhase.SETUP)
      expect(store.gameState.players).toEqual([])
      expect(store.gameState.currentPlayerId).toBe(null)
      expect(store.gameState.dayNumber).toBe(1)
      expect(store.gameState.winner).toBe(null)
      expect(store.gameState.messages).toEqual([])
      expect(store.gameState.selectedPlayerId).toBe(null)
      expect(store.gameState.gameStarted).toBe(false)
      expect(store.gameState.votes).toEqual({})
      expect(store.apiKey).toBe('')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('setApiKey', () => {
    it('should set the API key', () => {
      const store = useGameStateStore()
      const testKey = 'sk-test123'
      
      store.setApiKey(testKey)
      
      expect(store.apiKey).toBe(testKey)
    })
  })

  describe('initializeGame', () => {
    it('should create 6 players by default', () => {
      const store = useGameStateStore()
      
      store.initializeGame()
      
      expect(store.gameState.players).toHaveLength(6)
    })

    it('should create specified number of players', () => {
      const store = useGameStateStore()
      
      store.initializeGame(4)
      
      expect(store.gameState.players).toHaveLength(4)
    })

    it('should assign correct roles', () => {
      const store = useGameStateStore()
      
      store.initializeGame(6)
      
      const roles = store.gameState.players.map(p => p.role)
      expect(roles).toContain(PlayerRole.WEREWOLF)
      expect(roles).toContain(PlayerRole.VILLAGER)
      expect(roles).toContain(PlayerRole.SEER)
      expect(roles).toContain(PlayerRole.KNIGHT)
      expect(roles).toContain(PlayerRole.MEDIUM)
      
      // Should have exactly 2 werewolves
      expect(roles.filter(r => r === PlayerRole.WEREWOLF)).toHaveLength(2)
    })

    it('should set first player as human (Visitor)', () => {
      const store = useGameStateStore()
      
      store.initializeGame(6)
      
      const humanPlayer = store.gameState.players[0]
      expect(humanPlayer.name).toBe('Visitor')
      expect(humanPlayer.isAI).toBe(false)
      expect(humanPlayer.id).toBe(0)
    })

    it('should set remaining players as AI', () => {
      const store = useGameStateStore()
      
      store.initializeGame(6)
      
      const aiPlayers = store.gameState.players.slice(1)
      expect(aiPlayers.every(p => p.isAI)).toBe(true)
      expect(aiPlayers.every(p => p.name !== 'Visitor')).toBe(true)
    })

    it('should reset game state to setup', () => {
      const store = useGameStateStore()
      
      // Set some values first
      store.gameState.phase = GamePhase.DAY
      store.gameState.dayNumber = 5
      store.gameState.winner = 'villagers'
      
      store.initializeGame(6)
      
      expect(store.gameState.phase).toBe(GamePhase.SETUP)
      expect(store.gameState.dayNumber).toBe(1)
      expect(store.gameState.winner).toBe(null)
      expect(store.gameState.gameStarted).toBe(false)
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      const store = useGameStateStore()
      store.initializeGame(6)
    })

    it('should compute alive players correctly', () => {
      const store = useGameStateStore()
      
      // Kill one player
      store.gameState.players[1].isAlive = false
      
      expect(store.alivePlayers).toHaveLength(5)
      expect(store.alivePlayers.every(p => p.isAlive)).toBe(true)
    })

    it('should compute dead players correctly', () => {
      const store = useGameStateStore()
      
      // Kill two players
      store.gameState.players[1].isAlive = false
      store.gameState.players[3].isAlive = false
      
      expect(store.deadPlayers).toHaveLength(2)
      expect(store.deadPlayers.every(p => !p.isAlive)).toBe(true)
    })

    it('should find human player correctly', () => {
      const store = useGameStateStore()
      
      const human = store.humanPlayer
      expect(human).not.toBe(null)
      expect(human?.isAI).toBe(false)
      expect(human?.name).toBe('Visitor')
    })

    it('should compute werewolves correctly', () => {
      const store = useGameStateStore()
      
      expect(store.werewolves).toHaveLength(2)
      expect(store.werewolves.every(p => p.role === PlayerRole.WEREWOLF)).toBe(true)
      expect(store.werewolves.every(p => p.isAlive)).toBe(true)
    })

    it('should compute villagers correctly', () => {
      const store = useGameStateStore()
      
      expect(store.villagers).toHaveLength(4) // 6 total - 2 werewolves
      expect(store.villagers.every(p => p.role !== PlayerRole.WEREWOLF)).toBe(true)
      expect(store.villagers.every(p => p.isAlive)).toBe(true)
    })
  })

  describe('isGameOver', () => {
    it('should return villagers when no werewolves alive', () => {
      const store = useGameStateStore()
      store.initializeGame(6)
      
      // Kill all werewolves
      store.gameState.players
        .filter(p => p.role === PlayerRole.WEREWOLF)
        .forEach(p => p.isAlive = false)
      
      expect(store.isGameOver).toBe('villagers')
    })

    it('should return werewolves when werewolves >= villagers', () => {
      const store = useGameStateStore()
      store.initializeGame(6)
      
      // Kill enough villagers so werewolves >= villagers
      const villagers = store.gameState.players.filter(p => p.role !== PlayerRole.WEREWOLF)
      villagers.slice(0, 3).forEach(p => p.isAlive = false) // Kill 3 villagers, leaving 1
      
      expect(store.isGameOver).toBe('werewolves')
    })

    it('should return null when game continues', () => {
      const store = useGameStateStore()
      store.initializeGame(6)
      
      expect(store.isGameOver).toBe(null)
    })
  })

  describe('selectPlayer', () => {
    it('should set selected player ID', () => {
      const store = useGameStateStore()
      
      store.selectPlayer(3)
      
      expect(store.gameState.selectedPlayerId).toBe(3)
    })
  })

  describe('phase management', () => {
    it('should set phase correctly', () => {
      const store = useGameStateStore()
      
      store.setPhase(GamePhase.DAY)
      
      expect(store.gameState.phase).toBe(GamePhase.DAY)
    })

    it('should increment day number', () => {
      const store = useGameStateStore()
      
      expect(store.gameState.dayNumber).toBe(1)
      store.incrementDay()
      expect(store.gameState.dayNumber).toBe(2)
    })

    it('should set winner and phase', () => {
      const store = useGameStateStore()
      
      store.setWinner('villagers')
      
      expect(store.gameState.winner).toBe('villagers')
      expect(store.gameState.phase).toBe(GamePhase.GAME_OVER)
    })
  })

  describe('startGame', () => {
    it('should mark game as started and set phase', () => {
      const store = useGameStateStore()
      store.initializeGame(6)
      
      store.startGame()
      
      expect(store.gameState.gameStarted).toBe(true)
      expect(store.gameState.phase).toBe(GamePhase.FIRST_NIGHT)
      // currentPlayerId may be set to 0 initially
      expect(store.gameState.currentPlayerId).toBeDefined()
    })
  })

  describe('player management', () => {
    beforeEach(() => {
      const store = useGameStateStore()
      store.initializeGame(6)
    })

    it('should set player alive status', () => {
      const store = useGameStateStore()
      
      store.setPlayerAlive(1, false)
      
      expect(store.gameState.players[1].isAlive).toBe(false)
    })

    it('should set player protection status', () => {
      const store = useGameStateStore()
      
      store.setPlayerProtected(2, true)
      
      expect(store.gameState.players[2].isProtected).toBe(true)
    })

    it('should get player by ID', () => {
      const store = useGameStateStore()
      
      const player = store.getPlayerById(3)
      
      expect(player).toBeDefined()
      expect(player?.id).toBe(3)
    })

    it('should return undefined for non-existent player ID', () => {
      const store = useGameStateStore()
      
      const player = store.getPlayerById(999)
      
      expect(player).toBeUndefined()
    })

    it('should clear all protections', () => {
      const store = useGameStateStore()
      
      // Set some protections
      store.setPlayerProtected(1, true)
      store.setPlayerProtected(2, true)
      
      store.clearProtections()
      
      expect(store.gameState.players.every(p => !p.isProtected)).toBe(true)
    })
  })

  describe('voting management', () => {
    it('should set votes object', () => {
      const store = useGameStateStore()
      const votes = { 1: 2, 3: 4 }
      
      store.setVotes(votes)
      
      expect(store.gameState.votes).toEqual(votes)
    })

    it('should add individual vote', () => {
      const store = useGameStateStore()
      
      store.addVote(1, 3)
      store.addVote(2, 3)
      
      expect(store.gameState.votes).toEqual({ 1: 3, 2: 3 })
    })

    it('should clear votes', () => {
      const store = useGameStateStore()
      
      store.addVote(1, 2)
      store.clearVotes()
      
      expect(store.gameState.votes).toEqual({})
    })
  })
}) 