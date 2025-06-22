<template>
  <div class="header">
    <div class="header-left">
      <h1 class="game-title">🐺 LLM Werewolf</h1>
      <div class="game-phase">
        <span class="phase-icon">{{ phaseInfo.icon }}</span>
        <div class="phase-text">
          <span class="phase-name">{{ phaseInfo.name }}</span>
          <span class="phase-description">{{ phaseInfo.description }}</span>
        </div>
      </div>
    </div>
    <div class="header-right">
      <div class="day-counter">{{ headerTexts.day }}: {{ dayNumber }}</div>
      <div v-if="dayTimeRemaining" class="timer">{{ headerTexts.timeRemaining }}: {{ dayTimeRemaining }}s</div>
      <button @click="$emit('reset-game')" class="reset-button">🔄</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { tm } = useI18n()

const headerTexts = computed(() => tm('game.header') as { day: string; timeRemaining: string })

defineProps({
  phaseInfo: {
    type: Object as PropType<{ name: string; icon: string; description: string }>,
    required: true,
  },
  dayNumber: {
    type: Number,
    required: true,
  },
  dayTimeRemaining: {
    type: Number as PropType<number | null>,
    default: null,
  },
});

defineEmits(['reset-game']);
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.game-title {
  margin: 0;
  color: #333;
}

.game-phase {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
}

.phase-icon {
  font-size: 2.5rem;
}

.phase-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.phase-name {
  background: #f8f9fa;
  color: #333;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.phase-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.day-counter {
  background: #f8f9fa;
  color: #333;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.timer {
  background: #fdf2f2;
  color: #c0392b;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.reset-button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }

  .header-right {
    justify-content: center;
  }
}
</style> 