import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GameAction, Player } from '../../types'
import { playerHasNightAction } from './utils'

export const useGameActionsStore = defineStore('gameActions', () => {
  const nightActions = ref<GameAction[]>([])
  const isProcessingAction = ref(false)

  /**
   * Performs a player action (e.g., vote, kill).
   * @param action The game action to perform.
   * @param onVote Callback for vote actions.
   * @param onNightAction Callback for night actions.
   */
  async function performAction(
    action: GameAction,
    onVote?: (_action: GameAction) => Promise<void>,
    onNightAction?: (_action: GameAction) => Promise<void>
  ) {
    isProcessingAction.value = true

    try {
      switch (action.type) {
        case 'vote':
          if (onVote) await onVote(action)
          break
        case 'kill':
        case 'investigate':
        case 'protect':
          if (onNightAction) await onNightAction(action)
          break
      }
    } catch (error) {
      console.error('Action error:', error)
      throw error
    } finally {
      isProcessingAction.value = false
    }
  }

  /**
   * Queues a night action.
   * @param action The night action to queue.
   */
  function queueNightAction(action: GameAction) {
    nightActions.value.push(action)
  }

  /**
   * Processes all queued night actions and returns the results.
   * @param players Current game players.
   * @returns Object containing action results.
   */
  function processNightActions(players: Player[]): {
    killedPlayerId: number | null
    investigations: Array<{ seerId: number; targetId: number; targetRole: string }>
    protections: Array<{ knightId: number; targetId: number }>
    wasTargetProtected: boolean
  } {
    const results = {
      killedPlayerId: null as number | null,
      investigations: [] as Array<{ seerId: number; targetId: number; targetRole: string }>,
      protections: [] as Array<{ knightId: number; targetId: number }>,
      wasTargetProtected: false
    }

    // Process protections first
    const protections = nightActions.value.filter(a => a.type === 'protect')
    const protectedPlayerIds = new Set<number>()
    
    for (const protection of protections) {
      if (protection.targetPlayerId !== undefined) {
        protectedPlayerIds.add(protection.targetPlayerId)
        results.protections.push({
          knightId: protection.playerId,
          targetId: protection.targetPlayerId
        })
      }
    }

    // Process kills
    const kills = nightActions.value.filter(a => a.type === 'kill')
    const killVotes: { [key: number]: number } = {}
    
    kills.forEach(k => {
      if (k.targetPlayerId !== undefined) {
        killVotes[k.targetPlayerId] = (killVotes[k.targetPlayerId] || 0) + 1
      }
    })
    
    if (Object.keys(killVotes).length > 0) {
      const targetId = Number(Object.keys(killVotes).sort((a, b) => 
        killVotes[Number(b)] - killVotes[Number(a)]
      )[0])
      
      if (protectedPlayerIds.has(targetId)) {
        results.wasTargetProtected = true
      } else {
        results.killedPlayerId = targetId
      }
    }

    // Process investigations
    const investigations = nightActions.value.filter(a => a.type === 'investigate')
    for (const investigation of investigations) {
      if (investigation.targetPlayerId !== undefined) {
        const target = players.find(p => p.id === investigation.targetPlayerId)
        if (target) {
          results.investigations.push({
            seerId: investigation.playerId,
            targetId: investigation.targetPlayerId,
            targetRole: target.role
          })
        }
      }
    }

    return results
  }

  /**
   * Clears all night actions.
   */
  function clearNightActions() {
    nightActions.value = []
  }

  /**
   * Processes voting results and returns the eliminated player.
   * @param votes Object mapping voter IDs to target IDs.
   * @param players Current game players.
   * @returns Object with voting results.
   */
  function processVotes(
    votes: Record<number, number>, 
    players: Player[]
  ): {
    eliminatedPlayerId: number | null
    voteCounts: Record<number, number>
    voteDetails: Record<number, string[]>
    isTied: boolean
    maxVotes: number
  } {
    const voteCounts: Record<number, number> = {}
    const voteDetails: Record<number, string[]> = {}

    // Count votes
    for (const [voterId, targetId] of Object.entries(votes)) {
      const voter = players.find(p => p.id === Number(voterId))
      if (voter && voter.isAlive) {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
        if (!voteDetails[targetId]) {
          voteDetails[targetId] = []
        }
        voteDetails[targetId].push(voter.name)
      }
    }

    // Find player(s) with most votes
    let maxVotes = 0
    let playersToEliminate: number[] = []
    
    for (const [playerId, voteCount] of Object.entries(voteCounts)) {
      if (voteCount > maxVotes) {
        maxVotes = voteCount
        playersToEliminate = [Number(playerId)]
      } else if (voteCount === maxVotes && maxVotes > 0) {
        playersToEliminate.push(Number(playerId))
      }
    }

    const isTied = playersToEliminate.length > 1
    const eliminatedPlayerId = !isTied && playersToEliminate.length === 1 
      ? playersToEliminate[0] 
      : null

    return {
      eliminatedPlayerId,
      voteCounts,
      voteDetails,
      isTied,
      maxVotes
    }
  }

  /**
   * Generates a formatted voting results message.
   * @param voteResults Results from processVotes.
   * @param players Current game players.
   * @returns HTML formatted voting results message.
   */
  function generateVotingResultsMessage(
    voteResults: {
      eliminatedPlayerId: number | null
      voteCounts: Record<number, number>
      voteDetails: Record<number, string[]>
      isTied: boolean
      maxVotes: number
    },
    players: Player[]
  ): string {
    let resultMessage = '<div class="vote-result-message">'
    resultMessage += '<h4>Voting Results</h4>'

    if (Object.keys(voteResults.voteDetails).length === 0) {
      resultMessage += '<p>No votes were cast.</p>'
    } else {
      resultMessage += '<ul>'
      for (const [targetId, voters] of Object.entries(voteResults.voteDetails)) {
        const target = players.find(p => p.id === Number(targetId))
        if (target) {
          resultMessage += `<li><strong>${target.name}</strong> received votes from: ${voters.join(', ')}.</li>`
        }
      }
      resultMessage += '</ul>'
    }

    if (voteResults.eliminatedPlayerId) {
      const eliminatedPlayer = players.find(p => p.id === voteResults.eliminatedPlayerId)
      if (eliminatedPlayer) {
        resultMessage += `<p class="elimination-result">${eliminatedPlayer.name} has been voted out with ${voteResults.maxVotes} votes.</p>`
      }
    } else if (Object.keys(voteResults.voteCounts).length > 0) {
      resultMessage += '<p class="no-elimination-result">The vote was tied. No one is eliminated.</p>'
    }

    resultMessage += '</div>'
    return resultMessage
  }

  /**
   * Checks if a human player needs to perform a night action.
   * @param humanPlayer The human player.
   * @param phase Current game phase.
   * @returns True if the human player has a night action to perform.
   */
  function doesHumanPlayerNeedNightAction(humanPlayer: Player | null, phase: string): boolean {
    if (!humanPlayer || !humanPlayer.isAlive) return false
    return playerHasNightAction(humanPlayer, phase as any)
  }

  return {
    nightActions,
    isProcessingAction,
    performAction,
    queueNightAction,
    processNightActions,
    clearNightActions,
    processVotes,
    generateVotingResultsMessage,
    doesHumanPlayerNeedNightAction
  }
}) 