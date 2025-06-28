import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Player } from '../../types'
import { GamePhase, PlayerRole } from '../../types'
import { playerHasNightAction, getHumanPlayer } from './utils'
import i18n from '../../i18n'

export const useGamePhasesStore = defineStore('gamePhases', () => {
  const isTransitioning = ref(false)

  /**
   * Checks if the game is over and returns the winner.
   * @param players Current game players.
   * @returns Winner faction or null if game continues.
   */
  function checkGameOver(players: Player[]): 'villagers' | 'werewolves' | null {
    const aliveWerewolves = players.filter(p => 
      p.role === PlayerRole.WEREWOLF && p.isAlive
    ).length
    const aliveVillagers = players.filter(p => 
      p.role !== PlayerRole.WEREWOLF && p.isAlive
    ).length
    
    if (aliveWerewolves === 0) {
      return 'villagers'
    }
    if (aliveWerewolves >= aliveVillagers) {
      return 'werewolves'
    }
    return null
  }

  /**
   * Transitions the game to the next phase.
   * @param currentPhase Current game phase.
   * @param players Current game players.
   * @param dayNumber Current day number.
   * @param callbacks Object containing callback functions for various actions.
   * @returns Object with new phase information.
   */
  async function transitionToNextPhase(
    currentPhase: string,
    players: Player[],
    dayNumber: number,
    callbacks: {
      onAddSystemMessage: (_message: string) => void
      onStartDayTimer: (_duration: number, _onTimeUp: () => void) => void
      onStopTimers: () => void
      onStartDiscussion: () => void
      onStopDiscussion: () => void
      onResolveNight?: () => Promise<void>
      onGenerateAIVotes?: () => Promise<void>
    }
  ): Promise<{
    newPhase: string
    newDayNumber: number
    shouldResolveNight: boolean
    shouldGenerateAIVotes: boolean
  }> {
    isTransitioning.value = true
    
    try {
      const humanPlayer = getHumanPlayer(players)
      let newPhase = currentPhase
      let newDayNumber = dayNumber
      let shouldResolveNight = false
      let shouldGenerateAIVotes = false

      if (currentPhase === GamePhase.FIRST_NIGHT || currentPhase === GamePhase.NIGHT) {
        // Transition from night to day
        if (currentPhase === GamePhase.NIGHT) {
          newDayNumber++
        }
        
        newPhase = GamePhase.DAY
        callbacks.onAddSystemMessage(
          i18n.global.t('game.systemMessages.dayBegins', { dayNumber: newDayNumber })
        )
        
        // Start day timer and discussion
        callbacks.onStartDayTimer(180, () => {
          callbacks.onAddSystemMessage(i18n.global.t('game.systemMessages.timesUp'))
          callbacks.onStopDiscussion()
          // Transition to voting will be handled by the timer callback
        })
        
        callbacks.onStartDiscussion()

      } else if (currentPhase === GamePhase.DAY) {
        // Transition from day to voting
        callbacks.onStopDiscussion()
        callbacks.onStopTimers()
        
        newPhase = GamePhase.VOTING
        callbacks.onAddSystemMessage(i18n.global.t('game.systemMessages.votingBegins'))
        
        // If human player is dead, auto-generate AI votes
        if (!humanPlayer || !humanPlayer.isAlive) {
          shouldGenerateAIVotes = true
        }

      } else if (currentPhase === GamePhase.VOTING) {
        // Transition from voting to night
        newPhase = GamePhase.NIGHT
        callbacks.onAddSystemMessage(i18n.global.t('game.systemMessages.nightFalls'))
        
        // If human player doesn't have night action, auto-resolve night
        if (!humanPlayer || !playerHasNightAction(humanPlayer, newPhase as any)) {
          shouldResolveNight = true
        }
      }

      return {
        newPhase,
        newDayNumber,
        shouldResolveNight,
        shouldGenerateAIVotes
      }
    } finally {
      isTransitioning.value = false
    }
  }

  /**
   * Handles the resolution of night phase.
   * @param nightActionResults Results from processing night actions.
   * @param players Current game players.
   * @param callbacks Callback functions.
   * @returns Updated players array.
   */
  function resolveNightPhase(
    nightActionResults: {
      killedPlayerId: number | null
      investigations: Array<{ seerId: number; targetId: number; targetRole: string }>
      protections: Array<{ knightId: number; targetId: number }>
      wasTargetProtected: boolean
    },
    players: Player[],
    callbacks: {
      onAddSystemMessage: (_message: string) => void
      onAddPrivateMessage: (_recipientId: number, _message: string) => void
    }
  ): Player[] {
    const updatedPlayers = [...players]

    // Handle kills
    if (nightActionResults.killedPlayerId !== null) {
      const killedPlayer = updatedPlayers.find(p => p.id === nightActionResults.killedPlayerId)
      if (killedPlayer) {
        if (nightActionResults.wasTargetProtected) {
          callbacks.onAddSystemMessage(
            i18n.global.t('game.systemMessages.playerProtected', { 
              playerName: killedPlayer.name 
            })
          )
        } else {
          killedPlayer.isAlive = false
          callbacks.onAddSystemMessage(
            i18n.global.t('game.systemMessages.playerKilled', { 
              playerName: killedPlayer.name 
            })
          )
        }
      }
    }

    // Handle investigations
    for (const investigation of nightActionResults.investigations) {
      const seer = updatedPlayers.find(p => p.id === investigation.seerId)
      const target = updatedPlayers.find(p => p.id === investigation.targetId)

      if (seer && target) {
        const roleKey = target.role === PlayerRole.WEREWOLF 
          ? 'game.roles.werewolf' 
          : 'game.roles.notWerewolf'
        const role = i18n.global.t(roleKey)
        const messageContent = i18n.global.t('game.systemMessages.seerResult', { 
          targetName: target.name, 
          role 
        })
        
        if (seer.isAI) {
          callbacks.onAddPrivateMessage(seer.id, messageContent)
        } else {
          callbacks.onAddSystemMessage(messageContent)
        }
      }
    }

    // Clear all protections
    updatedPlayers.forEach(p => p.isProtected = false)

    return updatedPlayers
  }

  /**
   * Handles the resolution of voting phase.
   * @param voteResults Results from processing votes.
   * @param players Current game players.
   * @param callbacks Callback functions.
   * @returns Updated players array.
   */
  function resolveVotingPhase(
    voteResults: {
      eliminatedPlayerId: number | null
      voteCounts: Record<number, number>
      voteDetails: Record<number, string[]>
      isTied: boolean
      maxVotes: number
    },
    players: Player[],
    callbacks: {
      onAddSystemMessage: (_message: string) => void
      onAddPrivateMessage: (_recipientId: number, _message: string) => void
    }
  ): Player[] {
    const updatedPlayers = [...players]

    if (voteResults.eliminatedPlayerId) {
      const eliminatedPlayer = updatedPlayers.find(p => p.id === voteResults.eliminatedPlayerId)
      if (eliminatedPlayer) {
        eliminatedPlayer.isAlive = false

        // Inform the medium
        const medium = updatedPlayers.find(p => 
          p.role === PlayerRole.MEDIUM && p.isAlive
        )
        if (medium) {
          const message = i18n.global.t('game.systemMessages.mediumResult', { 
            targetName: eliminatedPlayer.name, 
            role: eliminatedPlayer.role 
          })
          
          if (medium.isAI) {
            callbacks.onAddPrivateMessage(medium.id, message)
          } else {
            callbacks.onAddSystemMessage(message)
          }
        }
      }
    }

    return updatedPlayers
  }

  /**
   * Determines if the phase can be transitioned automatically.
   * @param currentPhase Current game phase.
   * @param players Current players.
   * @returns True if auto-transition is possible.
   */
  function canAutoTransition(currentPhase: string, players: Player[]): boolean {
    const humanPlayer = getHumanPlayer(players)
    
    if (!humanPlayer || !humanPlayer.isAlive) {
      return true
    }

    switch (currentPhase) {
      case GamePhase.FIRST_NIGHT:
      case GamePhase.NIGHT:
        return !playerHasNightAction(humanPlayer, currentPhase as any)
      case GamePhase.VOTING:
        return false // Human player needs to vote
      case GamePhase.DAY:
        return false // Timer handles this
      default:
        return false
    }
  }

  /**
   * Gets the appropriate duration for a phase timer.
   * @param phase The game phase.
   * @returns Duration in seconds.
   */
  function getPhaseDuration(phase: string): number {
    switch (phase) {
      case GamePhase.DAY:
        return 180 // 3 minutes for discussion
      default:
        return 0
    }
  }

  return {
    isTransitioning,
    checkGameOver,
    transitionToNextPhase,
    resolveNightPhase,
    resolveVotingPhase,
    canAutoTransition,
    getPhaseDuration
  }
}) 