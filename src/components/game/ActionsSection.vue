<template>
  <div class="actions-section">
    <h3>Actions</h3>
    <div class="action-buttons">
      <button
        v-if="!gameStarted"
        @click="$emit('start-game')"
        class="action-button"
      >
        {{ actionTexts.startGame }}
      </button>
      <button
        v-if="canVote"
        @click="$emit('vote')"
        :disabled="selectedPlayerId === null"
        class="action-button vote"
      >
        {{ actionTexts.vote }}
      </button>
      <button
        v-if="canKill"
        @click="$emit('kill')"
        :disabled="selectedPlayerId === null"
        class="action-button kill"
      >
        {{ actionTexts.kill }}
      </button>
      <button
        v-if="canInvestigate"
        @click="$emit('investigate')"
        :disabled="selectedPlayerId === null"
        class="action-button investigate"
      >
        {{ actionTexts.investigate }}
      </button>
      <button
        v-if="canProtect"
        @click="$emit('protect')"
        :disabled="selectedPlayerId === null"
        class="action-button protect"
      >
        {{ actionTexts.protect }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { GamePhase, PlayerRole } from '../../types'

const { tm } = useI18n()

const props = defineProps<{
  phase: string
  gameStarted: boolean
  localPlayerRole: string | null
  isLocalPlayerAlive: boolean
  selectedPlayerId: number | null
}>()

const actionTexts = computed(() => tm('game.actions') as Record<string, string>)

const canVote = computed(() => {
  return props.phase === GamePhase.VOTING && props.isLocalPlayerAlive
})

const canKill = computed(() => {
  const isNightPhase = props.phase === GamePhase.NIGHT || props.phase === GamePhase.FIRST_NIGHT
  return isNightPhase && props.localPlayerRole === PlayerRole.WEREWOLF && props.isLocalPlayerAlive
})

const canInvestigate = computed(() => {
  const isNightPhase = props.phase === GamePhase.NIGHT || props.phase === GamePhase.FIRST_NIGHT
  return isNightPhase && props.localPlayerRole === PlayerRole.SEER && props.isLocalPlayerAlive
})

const canProtect = computed(() => {
  const isNightPhase = props.phase === GamePhase.NIGHT || props.phase === GamePhase.FIRST_NIGHT
  return isNightPhase && props.localPlayerRole === PlayerRole.KNIGHT && props.isLocalPlayerAlive
})

defineEmits(['vote', 'kill', 'investigate', 'protect', 'start-game']);
</script>

<style scoped>
.actions-section {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.actions-section h3 {
  margin-top: 0;
  color: #333;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-button.vote {
  background: #e74c3c;
  color: white;
}

.action-button.kill {
  background: #2c3e50;
  color: white;
}

.action-button.investigate {
  background: #9b59b6;
  color: white;
}

.action-button.protect {
  background: #27ae60;
  color: white;
}

.action-button.start {
  background: #f39c12;
  color: white;
}
</style> 