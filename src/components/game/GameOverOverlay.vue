<template>
  <div class="game-over-overlay">
    <div class="game-over-content">
      <h1>{{ t("game.systemMessages.gameOver", { winner: translatedWinner }) }}</h1>
      <p class="winner">{{ translatedWinner }} win!</p>

      <div class="player-roles">
        <h3>Player Roles</h3>
        <div class="players-grid">
          <div
            class="player-card"
            v-for="player in players"
            :key="player.id"
            :class="{ dead: !player.isAlive }"
          >
            <img
              :src="getRoleImage(player.role)"
              :alt="player.role"
              class="player-image"
            />
            <p class="player-name">{{ player.name }}</p>
            <p class="player-role">{{ player.role }}</p>
          </div>
        </div>
      </div>

      <button @click="$emit('play-again')" class="play-again-button">Play Again</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Player } from "../../types";
// Import images using URL constructor for better compatibility
const knightImage = new URL("../../assets/images/knight.jpeg", import.meta.url).href;
const mediumImage = new URL("../../assets/images/medium.jpeg", import.meta.url).href;
const seerImage = new URL("../../assets/images/seer.jpeg", import.meta.url).href;
const villagerImage = new URL("../../assets/images/villager.png", import.meta.url).href;
const werewolfImage = new URL("../../assets/images/werewolf.jpeg", import.meta.url).href;

const { t, tm } = useI18n();

const props = defineProps<{
  winner: "villagers" | "werewolves" | null;
  players: Player[];
}>();

defineEmits(["play-again"]);

const winnerTexts = computed(
  () => tm("game.winner") as Record<"villagers" | "werewolves", string>
);

const translatedWinner = computed(() => {
  if (!props.winner) return "";
  return winnerTexts.value[props.winner];
});

const roleImages: Record<string, string> = {
  knight: knightImage,
  medium: mediumImage,
  seer: seerImage,
  villager: villagerImage,
  werewolf: werewolfImage,
};

const getRoleImage = (role: string) => {
  return roleImages[role.toLowerCase()] || villagerImage;
};
</script>

<style scoped>
.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.game-over-content {
  background: rgba(40, 40, 40, 0.95);
  padding: 40px;
  border-radius: 15px;
  text-align: center;
  color: white;
  max-width: 600px;
  width: 90%;
  border: 1px solid #444;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #ffc107;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #ddd;
  border-bottom: 1px solid #555;
  padding-bottom: 10px;
}

.player-roles {
  margin-top: 30px;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.player-card {
  background: #333;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  transition: opacity 0.3s ease;
}

.player-card.dead {
  opacity: 0.6;
}

.player-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
  border: 2px solid #555;
}

.unknown-role-image {
  background-color: #4f4f4f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: #888;
}

.player-name {
  font-weight: bold;
  color: #eee;
}

.player-role {
  font-size: 0.9em;
  color: #aaa;
}

.play-again-button {
  margin-top: 30px;
  padding: 12px 30px;
  font-size: 1.2rem;
  cursor: pointer;
  background-color: #ffc107;
  color: #1e1e1e;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.play-again-button:hover {
  background-color: #e0a800;
}
</style>
