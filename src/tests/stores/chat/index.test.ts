
import { setActivePinia, createPinia } from 'pinia'
import { useChatStore } from '../../../stores/chat'
import type { Player } from '../../../types'
import { PlayerRole } from '../../../types'

describe('Chat Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockPlayer: Player = {
    id: 1,
    name: 'TestPlayer',
    role: PlayerRole.VILLAGER,
    isAlive: true,
    isAI: false,
    isProtected: false
  }

  const mockAIPlayer: Player = {
    id: 2,
    name: 'AIPlayer',
    role: PlayerRole.WEREWOLF,
    isAlive: true,
    isAI: true,
    isProtected: false
  }

  describe('initial state', () => {
    it('should start with empty messages', () => {
      const store = useChatStore()
      expect(store.messages).toHaveLength(0)
    })
  })

  describe('addSystemMessage', () => {
    it('should add a system message', () => {
      const store = useChatStore()
      const content = 'Game started!'
      
      store.addSystemMessage(content)
      
      expect(store.messages).toHaveLength(1)
      const message = store.messages[0]
      expect(message.content).toBe(content)
      expect(message.type).toBe('system')
      expect(message.playerId).toBe(-1)
      expect(message.playerName).toBe('System')
      expect(message.timestamp).toBeInstanceOf(Date)
      expect(message.id).toMatch(/^msg-\d+$/)
    })

    it('should add multiple system messages in order', () => {
      const store = useChatStore()
      
      store.addSystemMessage('First message')
      store.addSystemMessage('Second message')
      
      expect(store.messages).toHaveLength(2)
      expect(store.messages[0].content).toBe('First message')
      expect(store.messages[1].content).toBe('Second message')
    })
  })

  describe('addPrivateMessage', () => {
    it('should add a private message with recipient', () => {
      const store = useChatStore()
      const content = 'You see a werewolf!'
      const recipientId = 5
      
      store.addPrivateMessage(recipientId, content)
      
      expect(store.messages).toHaveLength(1)
      const message = store.messages[0]
      expect(message.content).toBe(content)
      expect(message.type).toBe('private')
      expect(message.recipientId).toBe(recipientId)
      expect(message.playerId).toBe(-1)
      expect(message.playerName).toBe('System')
    })
  })

  describe('addPlayerMessage', () => {
    it('should add a human player message', () => {
      const store = useChatStore()
      const content = 'Hello everyone!'
      
      store.addPlayerMessage(mockPlayer, content)
      
      expect(store.messages).toHaveLength(1)
      const message = store.messages[0]
      expect(message.content).toBe(content)
      expect(message.type).toBe('player')
      expect(message.playerId).toBe(mockPlayer.id)
      expect(message.playerName).toBe(mockPlayer.name)
    })

    it('should add an AI player message', () => {
      const store = useChatStore()
      const content = 'I think Alex is suspicious...'
      
      store.addPlayerMessage(mockAIPlayer, content)
      
      expect(store.messages).toHaveLength(1)
      const message = store.messages[0]
      expect(message.content).toBe(content)
      expect(message.type).toBe('ai')
      expect(message.playerId).toBe(mockAIPlayer.id)
      expect(message.playerName).toBe(mockAIPlayer.name)
    })
  })

  describe('clearMessages', () => {
    it('should clear all messages', () => {
      const store = useChatStore()
      
      store.addSystemMessage('Test message 1')
      store.addPlayerMessage(mockPlayer, 'Test message 2')
      expect(store.messages).toHaveLength(2)
      
      store.clearMessages()
      expect(store.messages).toHaveLength(0)
    })
  })

  describe('getRecentMessages', () => {
    it('should return recent messages up to specified count', () => {
      const store = useChatStore()
      
      // Add 5 messages
      for (let i = 1; i <= 5; i++) {
        store.addSystemMessage(`Message ${i}`)
      }
      
      const recent3 = store.getRecentMessages(3)
      expect(recent3).toHaveLength(3)
      expect(recent3[0].content).toBe('Message 3')
      expect(recent3[1].content).toBe('Message 4')
      expect(recent3[2].content).toBe('Message 5')
    })

    it('should return all messages if count exceeds total', () => {
      const store = useChatStore()
      
      store.addSystemMessage('Only message')
      
      const recent10 = store.getRecentMessages(10)
      expect(recent10).toHaveLength(1)
      expect(recent10[0].content).toBe('Only message')
    })

    it('should return empty array for empty messages', () => {
      const store = useChatStore()
      
      const recent = store.getRecentMessages(5)
      expect(recent).toHaveLength(0)
    })
  })

  describe('message IDs and timestamps', () => {
    it('should generate message IDs based on timestamp', () => {
      const store = useChatStore()
      
      store.addSystemMessage('Message 1')
      
      const message = store.messages[0]
      expect(message.id).toMatch(/^msg-\d+$/)
      expect(message.id.startsWith('msg-')).toBe(true)
    })

    it('should set timestamps in chronological order', () => {
      const store = useChatStore()
      
      store.addSystemMessage('First')
      // Small delay to ensure different timestamps
      setTimeout(() => {
        store.addSystemMessage('Second')
        
        const timestamps = store.messages.map(m => m.timestamp.getTime())
        expect(timestamps[1]).toBeGreaterThanOrEqual(timestamps[0])
      }, 1)
    })
  })
}) 