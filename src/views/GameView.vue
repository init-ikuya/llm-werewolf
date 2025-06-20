<template>
  <div class="game-container">
    <GameHeader
      :phase-info="phaseInfo"
      :day-number="gameStore.gameState.dayNumber"
      :day-time-remaining="gameTimersStore.dayTimeRemaining"
      @reset-game="resetGame"
    />

    <div class="game-content">
      <PlayersSection
        :players="gameStore.gameState.players"
        :selected-player-id="gameStore.gameState.selectedPlayerId"
        :is-game-over="!!gameStore.gameState.winner"
        :is-human-player-alive="gameStore.gameState.players.find(p => !p.isAI)?.isAlive ?? false"
        :current-player-id="gameStore.gameState.currentPlayerId"
        @select-player="selectPlayer"
      />

      <ChatSection
        :messages="gameStore.gameState.messages"
        :can-chat="canChat"
        @send-message="sendMessage"
      />

      <ActionsSection
        :can-vote="canVote"
        :can-kill="canKill"
        :can-investigate="canInvestigate"
        :can-protect="canProtect"
        :selected-player-id="gameStore.gameState.selectedPlayerId"
        :phase="gameStore.gameState.phase"
        :game-started="gameStore.gameState.gameStarted"
        :local-player-role="humanPlayer?.role ?? null"
        :is-local-player-alive="humanPlayer?.isAlive ?? false"
        @vote="vote"
        @kill="kill"
        @investigate="investigate"
        @protect="protect"
        @start-game="startGame"
      />
    </div>

    <GameOverOverlay
      v-if="gameStore.gameState.winner"
      :winner="gameStore.gameState.winner"
      :players="gameStore.gameState.players"
      @play-again="resetGame"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useGameStore } from "../stores/game/index";
import { useGameTimersStore } from "../stores/game/gameTimers";
import { GamePhase, PlayerRole } from "../types";
import GameHeader from '../components/game/GameHeader.vue';
import PlayersSection from '../components/game/PlayersSection.vue';
import ChatSection from '../components/game/ChatSection.vue';
import ActionsSection from '../components/game/ActionsSection.vue';
import GameOverOverlay from '../components/game/GameOverOverlay.vue';

const router = useRouter();
const gameStore = useGameStore();
const gameTimersStore = useGameTimersStore();
const { tm } = useI18n()

// Helper to get the human player
const humanPlayer = computed(() => gameStore.gameState.players.find(p => !p.isAI) || null);

const phaseInfo = computed(() => {
  const phaseTexts = tm('game.phases') as Record<string, { name: string; description: string }>;

  const phaseIcons: Record<string, string> = {
    [GamePhase.SETUP]: "⚙️",
    [GamePhase.FIRST_NIGHT]: "🌙",
    [GamePhase.NIGHT]: "🌃",
    [GamePhase.DAY]: "☀️",
    [GamePhase.VOTING]: "🗳️",
    [GamePhase.GAME_OVER]: "🏁",
  };

  const currentPhaseKey = gameStore.gameState.phase;
  const currentPhaseTexts = phaseTexts[currentPhaseKey] || { name: 'Unknown Phase', description: 'Hmm? Something seems off.' };
  const currentPhaseIcon = phaseIcons[currentPhaseKey] || "❓";

  return {
    ...currentPhaseTexts,
    icon: currentPhaseIcon
  };
});

// If no players exist in the game state (e.g., page refresh on game screen),
// redirect to the setup page
onMounted(() => {
  if (gameStore.gameState.players.length === 0) {
    router.push("/");
  }
});

function selectPlayer(playerId: number) {
  gameStore.selectPlayer(playerId);
}

const canChat = computed(() => {
  return gameStore.gameState.phase === GamePhase.DAY && (humanPlayer.value?.isAlive ?? false);
});

const canVote = computed(() => {
  return (
    gameStore.gameState.phase === GamePhase.VOTING &&
    (humanPlayer.value?.isAlive ?? false)
  );
});

const canKill = computed(() => {
  return (
    gameStore.gameState.phase === GamePhase.NIGHT &&
    humanPlayer.value?.role === PlayerRole.WEREWOLF &&
    humanPlayer.value?.isAlive
  );
});

const canInvestigate = computed(() => {
  return (
    (gameStore.gameState.phase === GamePhase.NIGHT || gameStore.gameState.phase === GamePhase.FIRST_NIGHT) &&
    humanPlayer.value?.role === PlayerRole.SEER &&
    humanPlayer.value?.isAlive
  );
});

const canProtect = computed(() => {
  return (
    gameStore.gameState.phase === GamePhase.NIGHT &&
    humanPlayer.value?.role === PlayerRole.KNIGHT &&
    humanPlayer.value?.isAlive
  );
});

async function sendMessage(message: string) {
  if (!message.trim() || !canChat.value || !humanPlayer.value) return;
  gameStore.addPlayerMessage(humanPlayer.value.id, message);
}

async function vote() {
  if (gameStore.gameState.phase !== GamePhase.VOTING || !humanPlayer.value) return;
  if (gameStore.gameState.selectedPlayerId === null) return;
  await gameStore.performAction({
    type: "vote",
    playerId: humanPlayer.value.id,
    targetPlayerId: gameStore.gameState.selectedPlayerId,
  });
}

async function kill() {
  if (!gameStore.gameState.selectedPlayerId || !humanPlayer.value) return;
  await gameStore.performAction({
    type: "kill",
    playerId: humanPlayer.value.id,
    targetPlayerId: gameStore.gameState.selectedPlayerId,
  });
}

async function investigate() {
  if (!gameStore.gameState.selectedPlayerId || !humanPlayer.value) return;
  await gameStore.performAction({
    type: "investigate",
    playerId: humanPlayer.value.id,
    targetPlayerId: gameStore.gameState.selectedPlayerId,
  });
}

async function protect() {
  if (!gameStore.gameState.selectedPlayerId || !humanPlayer.value) return;
  await gameStore.performAction({
    type: "protect",
    playerId: humanPlayer.value.id,
    targetPlayerId: gameStore.gameState.selectedPlayerId,
  });
}

function startGame() {
  gameStore.startGame();
}

async function resetGame() {
  await gameStore.resetGame();
  router.push("/");
}
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.game-content {
  display: grid;
  grid-template-columns: 300px 1fr 250px;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

@media (max-width: 1200px) {
  .game-content {
    grid-template-columns: 250px 1fr 200px;
  }
}

@media (max-width: 768px) {
  .game-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }
}
</style>
