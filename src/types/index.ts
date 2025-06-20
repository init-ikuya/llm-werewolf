// Player roles
export const PlayerRole = {
  WEREWOLF: 'werewolf',
  VILLAGER: 'villager',
  SEER: 'seer',
  KNIGHT: 'knight',
  MEDIUM: 'medium',
} as const

export type PlayerRoleType = (typeof PlayerRole)[keyof typeof PlayerRole]

// Game phases
export const GamePhase = {
  SETUP: 'setup',
  FIRST_NIGHT: 'first_night',
  NIGHT: 'night',
  DAY: 'day',
  VOTING: 'voting',
  GAME_OVER: 'game_over'
} as const

export type GamePhaseType = typeof GamePhase[keyof typeof GamePhase]

// Player interface
export interface Player {
  id: number
  name: string
  role: PlayerRoleType
  isAlive: boolean
  isAI: boolean
  isProtected: boolean
}

// Game state interface
export interface GameState {
  phase: GamePhaseType
  players: Player[]
  currentPlayerId: number | null
  dayNumber: number
  winner: 'villagers' | 'werewolves' | null
  messages: GameMessage[]
  selectedPlayerId: number | null
  gameStarted: boolean
  votes: Record<number, number> // voterId -> targetId
}

// Game message interface
export interface GameMessage {
  id: string
  playerId: number
  playerName: string
  content: string
  timestamp: Date
  type: 'system' | 'player' | 'ai' | 'private'
  recipientId?: number
}

// OpenAI API response interface
export interface OpenAIResponse {
  role: string
  content: string
}

// Game action interface
export interface GameAction {
  type: 'vote' | 'kill' | 'protect' | 'investigate' | 'use_potion'
  targetPlayerId?: number
  playerId: number
  data?: any
}

// API error interface
export interface APIError {
  message: string
  code?: string
} 