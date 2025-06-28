import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, Player, PlayerRoleType } from '../../types'
import { GamePhase, PlayerRole } from '../../types'
import { 
  getAlivePlayers, 
  getDeadPlayers, 
  getWerewolves, 
  getVillagers,
  getHumanPlayer 
} from './utils'

export const useGameStateStore = defineStore('gameState', () => {
  const gameState = ref<GameState>({
    phase: GamePhase.SETUP,
    players: [],
    currentPlayerId: null,
    dayNumber: 1,
    winner: null,
    messages: [],
    selectedPlayerId: null,
    gameStarted: false,
    votes: {}
  })

  const apiKey = ref<string>('')
  const isLoading = ref<boolean>(false)

  // Computed properties
  const alivePlayers = computed(() => getAlivePlayers(gameState.value.players))
  const deadPlayers = computed(() => getDeadPlayers(gameState.value.players))
  const werewolves = computed(() => getWerewolves(gameState.value.players))
  const villagers = computed(() => getVillagers(gameState.value.players))
  const humanPlayer = computed(() => getHumanPlayer(gameState.value.players))

  const currentPlayer = computed(() => 
    gameState.value.currentPlayerId 
      ? gameState.value.players.find(p => p.id === gameState.value.currentPlayerId)
      : null
  )

  const isGameOver = computed(() => {
    const aliveWerewolves = werewolves.value.length
    const aliveVillagers = villagers.value.length
    
    if (aliveWerewolves === 0) {
      return 'villagers'
    }
    if (aliveWerewolves >= aliveVillagers) {
      return 'werewolves'
    }
    return null
  })

  /**
   * Sets the OpenAI API key.
   * @param key The OpenAI API key.
   */
  function setApiKey(key: string) {
    apiKey.value = key
  }

  /**
   * Initializes the game with a specified number of players, assigning roles randomly.
   * @param playerCount The total number of players.
   */
  function initializeGame(playerCount: number = 6) {
    const players: Player[] = []
    const roles: PlayerRoleType[] = [
      PlayerRole.WEREWOLF,
      PlayerRole.WEREWOLF,
      PlayerRole.VILLAGER,
      PlayerRole.SEER,
      PlayerRole.KNIGHT,
      PlayerRole.MEDIUM
    ]

    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5)
    const aiNames = ['Alex', 'Billy', 'Chris', 'Danny', 'Emerson'].sort(() => Math.random() - 0.5)

    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: i,
        name: i === 0 ? 'Visitor' : aiNames[i - 1],
        role: shuffledRoles[i],
        isAlive: true,
        isAI: i !== 0,
        isProtected: false
      })
    }

    gameState.value = {
      ...gameState.value,
      players,
      phase: GamePhase.SETUP,
      dayNumber: 1,
      winner: null,
      messages: [],
      selectedPlayerId: null,
      gameStarted: false,
      votes: {}
    }
  }

  /**
   * Selects a player as a target for an action.
   * @param playerId The ID of the player to select.
   */
  function selectPlayer(playerId: number) {
    gameState.value.selectedPlayerId = playerId
  }

  /**
   * Updates the game phase.
   * @param newPhase The new game phase.
   */
  function setPhase(newPhase: string) {
    gameState.value.phase = newPhase as any
  }

  /**
   * Increments the day number.
   */
  function incrementDay() {
    gameState.value.dayNumber++
  }

  /**
   * Sets the game winner.
   * @param winner The winning faction.
   */
  function setWinner(winner: 'villagers' | 'werewolves') {
    gameState.value.winner = winner
    gameState.value.phase = GamePhase.GAME_OVER
  }

  /**
   * Marks the game as started.
   */
  function startGame() {
    gameState.value.gameStarted = true
    gameState.value.phase = GamePhase.FIRST_NIGHT
    gameState.value.currentPlayerId = gameState.value.players[0]?.id || null
  }

  /**
   * Updates a player's alive status.
   * @param playerId The player ID.
   * @param isAlive The new alive status.
   */
  function setPlayerAlive(playerId: number, isAlive: boolean) {
    const player = gameState.value.players.find(p => p.id === playerId)
    if (player) {
      player.isAlive = isAlive
    }
  }

  /**
   * Updates a player's protection status.
   * @param playerId The player ID.
   * @param isProtected The new protection status.
   */
  function setPlayerProtected(playerId: number, isProtected: boolean) {
    const player = gameState.value.players.find(p => p.id === playerId)
    if (player) {
      player.isProtected = isProtected
    }
  }

  /**
   * Sets the votes for the current voting phase.
   * @param votes Object mapping voter IDs to target IDs.
   */
  function setVotes(votes: Record<number, number>) {
    gameState.value.votes = votes
  }

  /**
   * Adds a single vote.
   * @param voterId The ID of the voter.
   * @param targetId The ID of the target.
   */
  function addVote(voterId: number, targetId: number) {
    gameState.value.votes[voterId] = targetId
  }

  /**
   * Clears all votes.
   */
  function clearVotes() {
    gameState.value.votes = {}
  }

  /**
   * Resets all players' protection status.
   */
  function clearProtections() {
    gameState.value.players.forEach(p => p.isProtected = false)
  }

  /**
   * Gets a player by ID.
   * @param playerId The player ID.
   * @returns The player or undefined if not found.
   */
  function getPlayerById(playerId: number): Player | undefined {
    return gameState.value.players.find(p => p.id === playerId)
  }

  return {
    gameState,
    apiKey,
    isLoading,
    alivePlayers,
    deadPlayers,
    werewolves,
    villagers,
    humanPlayer,
    currentPlayer,
    isGameOver,
    setApiKey,
    initializeGame,
    selectPlayer,
    setPhase,
    incrementDay,
    setWinner,
    startGame,
    setPlayerAlive,
    setPlayerProtected,
    setVotes,
    addVote,
    clearVotes,
    clearProtections,
    getPlayerById
  }
}) 