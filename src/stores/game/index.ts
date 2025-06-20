import { defineStore } from 'pinia'
import { computed } from 'vue'
import type { GameAction } from '../../types'
import { useGameStateStore } from './gameState'
import { useGameActionsStore } from './gameActions'
import { useGamePhasesStore } from './gamePhases'
import { useGameTimersStore } from './gameTimers'
import { useChatStore } from '../chat'
import { useAIStore } from '../ai'
import i18n from '../../i18n'

/**
 * Main game store that integrates all the separated stores.
 * This maintains the same API as the original monolithic store.
 */
export const useGameStore = defineStore('game', () => {
  // Get all the separated stores
  const gameStateStore = useGameStateStore()
  const gameActionsStore = useGameActionsStore()
  const gamePhasesStore = useGamePhasesStore()
  const gameTimersStore = useGameTimersStore()
  const chatStore = useChatStore()
  const aiStore = useAIStore()

  // Re-export computed properties for backward compatibility
  const gameState = computed(() => ({
    ...gameStateStore.gameState,
    messages: chatStore.messages
  }))

  const alivePlayers = computed(() => gameStateStore.alivePlayers)
  const deadPlayers = computed(() => gameStateStore.deadPlayers)
  const currentPlayer = computed(() => gameStateStore.currentPlayer)
  const werewolves = computed(() => gameStateStore.werewolves)
  const villagers = computed(() => gameStateStore.villagers)
  const isGameOver = computed(() => gameStateStore.isGameOver)
  const isLoading = computed(() => 
    gameStateStore.isLoading || 
    gameActionsStore.isProcessingAction || 
    aiStore.isGeneratingResponse ||
    gamePhasesStore.isTransitioning
  )

  /**
   * Sets the OpenAI API key.
   */
  function setApiKey(key: string) {
    gameStateStore.setApiKey(key)
  }

  /**
   * Initializes the game with players.
   */
  function initializeGame(playerCount: number = 6) {
    gameStateStore.initializeGame(playerCount)
    chatStore.clearMessages()
    chatStore.addSystemMessage(i18n.global.t('game.systemMessages.gameInitialized'))
  }

  /**
   * Starts the game.
   */
  async function startGame() {
    if (gameStateStore.gameState.players.length === 0) {
      chatStore.addSystemMessage('Please initialize the game first.')
      return
    }

    gameStateStore.startGame()
    chatStore.addSystemMessage(i18n.global.t('game.systemMessages.gameStarted'))
    chatStore.addSystemMessage(i18n.global.t('game.systemMessages.nightActions'))

    // Check if we need to auto-resolve night
    const humanPlayer = gameStateStore.humanPlayer
    if (!gameActionsStore.doesHumanPlayerNeedNightAction(humanPlayer, gameStateStore.gameState.phase)) {
      await resolveNight()
    }
  }

  /**
   * Resets the game.
   */
  async function resetGame() {
    const playerCount = gameStateStore.gameState.players.length
    gameTimersStore.stopDayTimer()
    aiStore.stopDiscussionLoop()
    initializeGame(playerCount > 0 ? playerCount : 6)
    await startGame()
  }

  /**
   * Adds a system message.
   */
  function addSystemMessage(content: string) {
    chatStore.addSystemMessage(content)
  }

  /**
   * Adds a player message.
   */
  function addPlayerMessage(playerId: number, content: string) {
    const player = gameStateStore.getPlayerById(playerId)
    if (player) {
      chatStore.addPlayerMessage(player, content)
    }
  }

  /**
   * Selects a player.
   */
  function selectPlayer(playerId: number) {
    gameStateStore.selectPlayer(playerId)
  }

  /**
   * Performs a game action.
   */
  async function performAction(action: GameAction) {
    await gameActionsStore.performAction(
      action,
      async (voteAction) => await handleVote(voteAction),
      async (nightAction) => await handleNightAction(nightAction)
    )
  }

  /**
   * Handles voting actions.
   */
  async function handleVote(action: GameAction) {
    if (gameStateStore.gameState.phase !== 'voting') return
    if (action.playerId === undefined || action.targetPlayerId === undefined) return

    const player = gameStateStore.getPlayerById(action.playerId)
    if (!player || !player.isAlive) return

    // Record the vote
    gameStateStore.addVote(action.playerId, action.targetPlayerId)
    chatStore.addSystemMessage(
      i18n.global.t('game.systemMessages.playerVoted', { playerName: player.name })
    )

    // Generate AI votes and resolve
    await generateAIVotes()
  }

  /**
   * Handles night actions.
   */
  async function handleNightAction(action: GameAction) {
    if (action.type === 'kill' && gameStateStore.gameState.phase === 'first_night') {
      chatStore.addSystemMessage(i18n.global.t('game.systemMessages.werewolfCantKill'))
      return
    }

    gameActionsStore.queueNightAction(action)

    // If this was a human player action, resolve the night
    const player = gameStateStore.getPlayerById(action.playerId)
    if (player && !player.isAI) {
      await resolveNight()
    }
  }

  /**
   * Generates AI votes.
   */
  async function generateAIVotes() {
    const aiVotes = await aiStore.generateAIVotes(
      gameStateStore.gameState.players,
      chatStore.messages
    )
    
    // Add AI votes to game state
    for (const [playerId, targetId] of Object.entries(aiVotes)) {
      gameStateStore.addVote(Number(playerId), targetId)
    }

    // Resolve the votes
    await resolveVotes()
  }

  /**
   * Resolves the voting phase.
   */
  async function resolveVotes() {
    const voteResults = gameActionsStore.processVotes(
      gameStateStore.gameState.votes,
      gameStateStore.gameState.players
    )

    // Generate and add voting results message
    const resultsMessage = gameActionsStore.generateVotingResultsMessage(
      voteResults,
      gameStateStore.gameState.players
    )
    chatStore.addSystemMessage(resultsMessage)

    // Update players based on voting results
    const updatedPlayers = gamePhasesStore.resolveVotingPhase(
      voteResults,
      gameStateStore.gameState.players,
      {
        onAddSystemMessage: chatStore.addSystemMessage,
        onAddPrivateMessage: chatStore.addPrivateMessage
      }
    )

    // Update game state
    gameStateStore.gameState.players = updatedPlayers

    // Check game over and transition
    await checkGameOverAndTransition()
  }

  /**
   * Resolves the night phase.
   */
  async function resolveNight() {
    gameStateStore.isLoading = true

    try {
      // Generate AI night actions
      const aiNightActions = await aiStore.generateAINightActions(
        gameStateStore.gameState.players,
        chatStore.messages,
        gameStateStore.gameState.phase
      )

      // Add AI actions to the queue
      for (const action of aiNightActions) {
        gameActionsStore.queueNightAction(action as any)
      }

      // Process all night actions
      const nightResults = gameActionsStore.processNightActions(gameStateStore.gameState.players)

      // Update players based on night results
      const updatedPlayers = gamePhasesStore.resolveNightPhase(
        nightResults,
        gameStateStore.gameState.players,
        {
          onAddSystemMessage: chatStore.addSystemMessage,
          onAddPrivateMessage: chatStore.addPrivateMessage
        }
      )

      // Update game state
      gameStateStore.gameState.players = updatedPlayers
      gameActionsStore.clearNightActions()

      // Check game over and transition
      await checkGameOverAndTransition()
    } finally {
      gameStateStore.isLoading = false
    }
  }

  /**
   * Checks if game is over and transitions to next phase.
   */
  async function checkGameOverAndTransition() {
    const winner = gamePhasesStore.checkGameOver(gameStateStore.gameState.players)
    
    if (winner) {
      gameStateStore.setWinner(winner)
      const winnerName = i18n.global.t(
        winner === 'villagers' ? 'game.winner.villagers' : 'game.winner.werewolves'
      )
      chatStore.addSystemMessage(
        i18n.global.t('game.systemMessages.gameOver', { winner: winnerName })
      )
      gameTimersStore.stopDayTimer()
      aiStore.stopDiscussionLoop()
    } else {
      await nextPhase()
    }
  }

  /**
   * Transitions to the next game phase.
   */
  async function nextPhase() {
    const phaseTransition = await gamePhasesStore.transitionToNextPhase(
      gameStateStore.gameState.phase,
      gameStateStore.gameState.players,
      gameStateStore.gameState.dayNumber,
      {
        onAddSystemMessage: chatStore.addSystemMessage,
        onStartDayTimer: (duration, onTimeUp) => gameTimersStore.startDayTimer(duration, () => {
          onTimeUp()
          // Transition to voting phase when day timer ends
          gameStateStore.setPhase('voting')
          gameStateStore.clearVotes()
          chatStore.addSystemMessage(i18n.global.t('game.systemMessages.votingBegins'))
          
          // If human player is dead, auto-generate AI votes
          const humanPlayer = gameStateStore.humanPlayer
          if (!humanPlayer || !humanPlayer.isAlive) {
            setTimeout(() => generateAIVotes(), 1000)
          }
        }),
        onStopTimers: () => gameTimersStore.stopDayTimer(),
        onStartDiscussion: () => startDiscussionLoop(),
        onStopDiscussion: () => aiStore.stopDiscussionLoop()
      }
    )

    // Update game state
    gameStateStore.setPhase(phaseTransition.newPhase)
    if (phaseTransition.newDayNumber !== gameStateStore.gameState.dayNumber) {
      gameStateStore.incrementDay()
    }
    gameStateStore.clearVotes()

    // Handle auto-actions
    if (phaseTransition.shouldResolveNight) {
      await resolveNight()
    }
    if (phaseTransition.shouldGenerateAIVotes) {
      await generateAIVotes()
    }
  }

  /**
   * Starts the AI discussion loop.
   */
  function startDiscussionLoop() {
    // Create a function that returns current game context
    const getGameContext = () => ({
      phase: gameStateStore.gameState.phase,
      dayNumber: gameStateStore.gameState.dayNumber,
      players: gameStateStore.gameState.players,
      messages: chatStore.messages,
      isGameOver: !!gameStateStore.gameState.winner
    })
    
    aiStore.startDiscussionLoop(
      getGameContext,
      (playerId, message) => {
        const player = gameStateStore.getPlayerById(playerId)
        if (player) {
          chatStore.addPlayerMessage(player, message)
        }
      }
    )
  }

  /**
   * Generates AI day talk for a specific player.
   */
  async function generateAIDayTalk(speakerId: number) {
    const speaker = gameStateStore.getPlayerById(speakerId)
    if (!speaker) return

    const response = await aiStore.generateAIDayTalk(speaker, {
      phase: gameStateStore.gameState.phase,
      dayNumber: gameStateStore.gameState.dayNumber,
      players: gameStateStore.gameState.players,
      messages: chatStore.messages,
      currentPlayerId: speakerId
    })
    
    chatStore.addPlayerMessage(speaker, response)
  }

  return {
    // State
    gameState,
    alivePlayers,
    deadPlayers,
    currentPlayer,
    werewolves,
    villagers,
    isGameOver,
    isLoading,
    
    // Actions
    setApiKey,
    initializeGame,
    startGame,
    resetGame,
    addSystemMessage,
    addPlayerMessage,
    selectPlayer,
    performAction,
    generateAIVotes,
    generateAIDayTalk,
    resolveNight
  }
}) 