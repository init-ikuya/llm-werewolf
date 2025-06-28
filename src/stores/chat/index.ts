import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GameMessage, Player } from '../../types'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<GameMessage[]>([])

  /**
   * Adds a system message to the chat log.
   * @param content The message content.
   */
  function addSystemMessage(content: string) {
    const message: GameMessage = {
      id: `msg-${Date.now()}`,
      playerId: -1,
      playerName: 'System',
      content,
      timestamp: new Date(),
      type: 'system'
    }
    messages.value.push(message)
  }

  /**
   * Adds a private message for a specific player.
   * @param recipientId The ID of the player receiving the message.
   * @param content The message content.
   */
  function addPrivateMessage(recipientId: number, content: string) {
    const message: GameMessage = {
      id: `msg-${Date.now()}`,
      playerId: -1,
      playerName: 'System',
      content,
      timestamp: new Date(),
      type: 'private',
      recipientId: recipientId
    }
    messages.value.push(message)
  }

  /**
   * Adds a player message to the chat log.
   * @param player The player sending the message.
   * @param content The message content.
   */
  function addPlayerMessage(player: Player, content: string) {
    const message: GameMessage = {
      id: `msg-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      content,
      timestamp: new Date(),
      type: player.isAI ? 'ai' : 'player'
    }
    messages.value.push(message)
  }

  /**
   * Clears all messages.
   */
  function clearMessages() {
    messages.value = []
  }

  /**
   * Gets recent messages (last N messages).
   * @param count Number of recent messages to get.
   * @returns Array of recent messages.
   */
  function getRecentMessages(count: number): GameMessage[] {
    return messages.value.slice(-count)
  }

  return {
    messages,
    addSystemMessage,
    addPrivateMessage,
    addPlayerMessage,
    clearMessages,
    getRecentMessages
  }
}) 