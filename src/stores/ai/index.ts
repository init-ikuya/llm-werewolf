import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Player, GameMessage } from '../../types'
import { PlayerRole } from '../../types'
import { generateAIResponse, generateAIAction, chooseNextSpeaker } from '../../utils/openai'
import { getAlivePlayers } from '../game/utils'
import i18n from '../../i18n'

export const useAIStore = defineStore('ai', () => {
  const isGeneratingResponse = ref(false)
  const discussionTimerId = ref<ReturnType<typeof setInterval> | null>(null)

  /**
   * Generates AI votes for all living AI players.
   * @param players All game players.
   * @param messages Game messages.
   * @returns Object mapping AI player IDs to target player IDs.
   */
  async function generateAIVotes(
    players: Player[], 
    messages: GameMessage[]
  ): Promise<Record<number, number>> {
    const votes: Record<number, number> = {}
    const livingAIs = getAlivePlayers(players).filter(p => p.isAI)
    
    for (const ai of livingAIs) {
      const targetName = await generateAIAction(
        ai, 
        { players, messages }, 
        'vote', 
        i18n.global.locale.value
      )
      const targetPlayer = players.find(p => p.name === targetName)
      if (targetPlayer) {
        votes[ai.id] = targetPlayer.id
      }
    }
    
    return votes
  }

  /**
   * Generates AI night actions for all AI players that can act.
   * @param players All game players.
   * @param messages Game messages.
   * @param phase Current game phase.
   * @returns Array of night actions.
   */
  async function generateAINightActions(
    players: Player[], 
    messages: GameMessage[], 
    phase: string
  ): Promise<Array<{ type: string; playerId: number; targetPlayerId?: number }>> {
    const actions: Array<{ type: string; playerId: number; targetPlayerId?: number }> = []
    const livingAIs = getAlivePlayers(players).filter(p => p.isAI)
    
    for (const ai of livingAIs) {
      let targetName: string | null = null
      let actionType: string | null = null

      if (ai.role === PlayerRole.WEREWOLF && phase !== 'first_night') {
        targetName = await generateAIAction(ai, { players, messages }, 'kill', i18n.global.locale.value)
        actionType = 'kill'
      } else if (ai.role === PlayerRole.SEER) {
        targetName = await generateAIAction(ai, { players, messages }, 'investigate', i18n.global.locale.value)
        actionType = 'investigate'
      } else if (ai.role === PlayerRole.KNIGHT && phase !== 'first_night') {
        targetName = await generateAIAction(ai, { players, messages }, 'protect', i18n.global.locale.value)
        actionType = 'protect'
      }

      if (targetName && actionType) {
        const targetPlayer = players.find(p => p.name === targetName)
        if (targetPlayer) {
          actions.push({
            type: actionType,
            playerId: ai.id,
            targetPlayerId: targetPlayer.id
          })
        }
      }
    }
    
    return actions
  }

  /**
   * Generates a daytime discussion message for a specific AI player.
   * @param player The AI player who is speaking.
   * @param gameContext Current game context.
   * @returns The generated AI response.
   */
  async function generateAIDayTalk(
    player: Player,
    gameContext: {
      phase: string
      dayNumber: number
      players: Player[]
      messages: GameMessage[]
      currentPlayerId: number
    }
  ): Promise<string> {
    if (!player.isAI) {
      throw new Error('Player is not an AI')
    }

    isGeneratingResponse.value = true
    try {
      const response = await generateAIResponse(
        player, 
        gameContext, 
        i18n.global.locale.value
      )
      return response
    } finally {
      isGeneratingResponse.value = false
    }
  }

  /**
   * Starts the discussion loop for AI players.
   * @param getGameContext Function that returns current game context.
   * @param onSpeech Callback when an AI speaks.
   */
  function startDiscussionLoop(
    getGameContext: () => {
      phase: string
      dayNumber: number
      players: Player[]
      messages: GameMessage[]
      isGameOver: boolean
    },
    onSpeech: (_playerId: number, _message: string) => void
  ) {
    if (discussionTimerId.value) {
      stopDiscussionLoop()
    }

    discussionTimerId.value = setInterval(async () => {
      // Get fresh game context each time
      const gameContext = getGameContext()
      
      if (gameContext.phase !== 'day' || gameContext.isGameOver) {
        stopDiscussionLoop()
        return
      }

      try {
        const nextSpeakerName = await chooseNextSpeaker(
          gameContext.players,
          gameContext.messages,
          gameContext.dayNumber
        )

        if (nextSpeakerName) {
          const speaker = gameContext.players.find(
            p => p.name === nextSpeakerName && p.isAlive && p.isAI
          )
          
          if (speaker) {
            const response = await generateAIDayTalk(speaker, {
              ...gameContext,
              currentPlayerId: speaker.id
            })
            onSpeech(speaker.id, response)
          }
        }
      } catch (error) {
        console.error('Error in discussion loop:', error)
      }
    }, 15000) // 15 seconds interval
  }

  /**
   * Stops the discussion loop.
   */
  function stopDiscussionLoop() {
    if (discussionTimerId.value) {
      clearInterval(discussionTimerId.value)
      discussionTimerId.value = null
    }
  }

  return {
    isGeneratingResponse,
    generateAIVotes,
    generateAINightActions,
    generateAIDayTalk,
    startDiscussionLoop,
    stopDiscussionLoop
  }
}) 