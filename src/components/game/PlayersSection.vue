<template>
  <div class="players-section">
    <h2>{{ t("game.players") }}</h2>
    <div class="players-grid">
      <div
        v-for="player in players"
        :key="player.id"
        class="player-card"
        :class="{
          'is-dead': !player.isAlive,
          'is-selected': selectedPlayerId === player.id,
          'is-human': !player.isAI,
        }"
        @click="selectPlayer(player)"
      >
        <div class="player-name">{{ player.name }}</div>
        <div class="player-role">
          <img v-if="shouldShowRole(player)" :src="getRoleImage(player.role)" :alt="player.role" class="role-icon-img" />
          <span>{{ getPlayerRoleDisplay(player) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Player, PlayerRoleType } from "../../types";
import { PlayerRole } from "../../types";

const { t } = useI18n();

const props = defineProps<{
  players: Player[];
  selectedPlayerId: number | null;
  isGameOver: boolean;
  isHumanPlayerAlive: boolean;
}>();

const emit = defineEmits(["select-player"]);

  const currentPlayer = computed(() => props.players.find((p) => !p.isAI));

const roleImages: Record<PlayerRoleType, string> = {
  [PlayerRole.WEREWOLF]: new URL("../../assets/images/werewolf.jpeg", import.meta.url)
    .href,
  [PlayerRole.VILLAGER]: new URL("../../assets/images/villager.png", import.meta.url)
    .href,
  [PlayerRole.SEER]: new URL("../../assets/images/seer.jpeg", import.meta.url).href,
  [PlayerRole.KNIGHT]: new URL("../../assets/images/knight.jpeg", import.meta.url).href,
  [PlayerRole.MEDIUM]: new URL("../../assets/images/medium.jpeg", import.meta.url).href,
};

const selectPlayer = (player: Player) => {
  if (player.isAlive) {
    emit("select-player", player.id);
  }
};

/**
 * Determines whether a player's role should be shown based on game rules
 * @param player - The player whose role visibility is being checked
 * @returns true if the role should be shown, false otherwise
 */
const shouldShowRole = (player: Player): boolean => {
  // Show role if it's the current player (human player)
  if (currentPlayer.value?.id === player.id) return true;
  
  // Show all roles if the human player is dead.
  if (!props.isHumanPlayerAlive) return true;
  
  // Show role of dead players if current player is a medium
  if (!player.isAlive && currentPlayer.value?.role === PlayerRole.MEDIUM) return true;
  
  // Show role if both current player and target player are werewolves (werewolves know each other)
  if (
    currentPlayer.value?.role === PlayerRole.WEREWOLF &&
    player.role === PlayerRole.WEREWOLF
  )
    return true;
  
  // Hide role in all other cases
  return false;
};

const getRoleImage = (role: PlayerRoleType): string => {
  return roleImages[role] || "";
};

const getPlayerRoleDisplay = (player: Player): string => {
  if (shouldShowRole(player)) {
    return player.role;
  }
  return "???";
};
</script>

<style scoped>
.players-section {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

h2 {
  margin-top: 0;
  color: #fff;
  text-align: center;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.player-card {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  text-align: center;
  color: #fff;
}

.player-card.is-human {
  box-shadow: 0 0 15px rgba(102, 238, 170, 0.5);
}

.player-card:hover {
  border-color: #66eeaa;
}

.player-card.is-dead {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: rgba(0, 0, 0, 0.2);
  border-color: transparent;
}

.player-card.is-selected {
  border-color: #f5a623;
  box-shadow: 0 0 10px #f5a623;
}

.player-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.player-role {
  font-style: italic;
  font-size: 0.9rem;
  color: #ddd;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.role-icon-img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.is-dead .player-name {
  text-decoration: line-through;
}

.is-dead .player-role {
  color: #ff8a8a;
}
</style>
