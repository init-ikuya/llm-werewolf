
import {
  playerHasNightAction,
  getHumanPlayer,
  getAlivePlayers,
  getDeadPlayers,
  getWerewolves,
  getVillagers
} from '../../../stores/game/utils'
import type { Player } from '../../../types'
import { GamePhase, PlayerRole } from '../../../types'

describe('Game Utils', () => {
  const mockPlayers: Player[] = [
    {
      id: 0,
      name: 'Visitor',
      role: PlayerRole.VILLAGER,
      isAlive: true,
      isAI: false,
      isProtected: false
    },
    {
      id: 1,
      name: 'Alex',
      role: PlayerRole.WEREWOLF,
      isAlive: true,
      isAI: true,
      isProtected: false
    },
    {
      id: 2,
      name: 'Billy',
      role: PlayerRole.SEER,
      isAlive: false,
      isAI: true,
      isProtected: false
    },
    {
      id: 3,
      name: 'Chris',
      role: PlayerRole.KNIGHT,
      isAlive: true,
      isAI: true,
      isProtected: false
    },
    {
      id: 4,
      name: 'Danny',
      role: PlayerRole.MEDIUM,
      isAlive: true,
      isAI: true,
      isProtected: false
    }
  ]

  describe('playerHasNightAction', () => {
    it('should return false for dead players', () => {
      const deadPlayer = mockPlayers[2] // Dead Seer
      expect(playerHasNightAction(deadPlayer, GamePhase.NIGHT)).toBe(false)
    })

    it('should return true for Seer on any night', () => {
      const seer = { ...mockPlayers[2], isAlive: true }
      expect(playerHasNightAction(seer, GamePhase.FIRST_NIGHT)).toBe(true)
      expect(playerHasNightAction(seer, GamePhase.NIGHT)).toBe(true)
    })

    it('should return false for Werewolf on first night', () => {
      const werewolf = mockPlayers[1]
      expect(playerHasNightAction(werewolf, GamePhase.FIRST_NIGHT)).toBe(false)
    })

    it('should return true for Werewolf on regular night', () => {
      const werewolf = mockPlayers[1]
      expect(playerHasNightAction(werewolf, GamePhase.NIGHT)).toBe(true)
    })

    it('should return false for Knight on first night', () => {
      const knight = mockPlayers[3]
      expect(playerHasNightAction(knight, GamePhase.FIRST_NIGHT)).toBe(false)
    })

    it('should return true for Knight on regular night', () => {
      const knight = mockPlayers[3]
      expect(playerHasNightAction(knight, GamePhase.NIGHT)).toBe(true)
    })

    it('should return false for Villager and Medium', () => {
      const villager = mockPlayers[0]
      const medium = mockPlayers[4]
      
      expect(playerHasNightAction(villager, GamePhase.NIGHT)).toBe(false)
      expect(playerHasNightAction(medium, GamePhase.NIGHT)).toBe(false)
    })
  })

  describe('getHumanPlayer', () => {
    it('should return the human player', () => {
      const human = getHumanPlayer(mockPlayers)
      expect(human).toBe(mockPlayers[0])
      expect(human?.isAI).toBe(false)
    })

    it('should return null when no human player exists', () => {
      const aiOnlyPlayers = mockPlayers.map(p => ({ ...p, isAI: true }))
      expect(getHumanPlayer(aiOnlyPlayers)).toBe(null)
    })
  })

  describe('getAlivePlayers', () => {
    it('should return only alive players', () => {
      const alivePlayers = getAlivePlayers(mockPlayers)
      expect(alivePlayers).toHaveLength(4)
      expect(alivePlayers.every(p => p.isAlive)).toBe(true)
      expect(alivePlayers.find(p => p.id === 2)).toBeUndefined() // Dead seer
    })
  })

  describe('getDeadPlayers', () => {
    it('should return only dead players', () => {
      const deadPlayers = getDeadPlayers(mockPlayers)
      expect(deadPlayers).toHaveLength(1)
      expect(deadPlayers.every(p => !p.isAlive)).toBe(true)
      expect(deadPlayers[0].id).toBe(2) // Dead seer
    })
  })

  describe('getWerewolves', () => {
    it('should return only alive werewolves', () => {
      const werewolves = getWerewolves(mockPlayers)
      expect(werewolves).toHaveLength(1)
      expect(werewolves[0].role).toBe(PlayerRole.WEREWOLF)
      expect(werewolves[0].isAlive).toBe(true)
    })

    it('should not return dead werewolves', () => {
      const playersWithDeadWerewolf = mockPlayers.map(p => 
        p.id === 1 ? { ...p, isAlive: false } : p
      )
      const werewolves = getWerewolves(playersWithDeadWerewolf)
      expect(werewolves).toHaveLength(0)
    })
  })

  describe('getVillagers', () => {
    it('should return only alive non-werewolf players', () => {
      const villagers = getVillagers(mockPlayers)
      expect(villagers).toHaveLength(3) // Visitor, Chris, Danny (alive non-werewolves)
      expect(villagers.every(p => p.role !== PlayerRole.WEREWOLF)).toBe(true)
      expect(villagers.every(p => p.isAlive)).toBe(true)
    })

    it('should not include dead villagers', () => {
      const villagers = getVillagers(mockPlayers)
      expect(villagers.find(p => p.id === 2)).toBeUndefined() // Dead seer
    })
  })
}) 