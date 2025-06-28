import type { Player, GamePhaseType } from '../../types'
import { GamePhase, PlayerRole } from '../../types'

/**
 * Checks if a player has an action to perform during the current night phase.
 * @param player The player to check.
 * @param phase The current game phase.
 * @returns True if the player has a night action, false otherwise.
 */
export function playerHasNightAction(player: Player, phase: GamePhaseType): boolean {
  if (!player || !player.isAlive) {
    return false;
  }

  const role = player.role;

  switch (role) {
    case PlayerRole.SEER:
      return true; // Seer can act on any night.
    
    case PlayerRole.WEREWOLF:
      return phase === GamePhase.NIGHT; // Werewolves cannot act on the first night.

    case PlayerRole.KNIGHT:
      return phase === GamePhase.NIGHT; // Knights cannot act on the first night.

    case PlayerRole.VILLAGER:
    case PlayerRole.MEDIUM:
      return false; // These roles have no direct night actions.

    default:
      return false;
  }
}

/**
 * Gets the human player from the players array.
 * @param players Array of all players.
 * @returns The human player or null if not found.
 */
export function getHumanPlayer(players: Player[]): Player | null {
  return players.find(p => !p.isAI) || null;
}

/**
 * Gets all alive players.
 * @param players Array of all players.
 * @returns Array of alive players.
 */
export function getAlivePlayers(players: Player[]): Player[] {
  return players.filter(player => player.isAlive);
}

/**
 * Gets all dead players.
 * @param players Array of all players.
 * @returns Array of dead players.
 */
export function getDeadPlayers(players: Player[]): Player[] {
  return players.filter(player => !player.isAlive);
}

/**
 * Gets all living werewolves.
 * @param players Array of all players.
 * @returns Array of living werewolves.
 */
export function getWerewolves(players: Player[]): Player[] {
  return players.filter(player => 
    player.role === PlayerRole.WEREWOLF && player.isAlive
  );
}

/**
 * Gets all living villagers (non-werewolf roles).
 * @param players Array of all players.
 * @returns Array of living villagers.
 */
export function getVillagers(players: Player[]): Player[] {
  return players.filter(player => 
    player.role !== PlayerRole.WEREWOLF && player.isAlive
  );
} 