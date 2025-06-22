<template>
  <div class="chat-section">
    <div class="chat-messages" ref="chatContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', message.type]"
      >
        <template v-if="message.type !== 'private'">
          <div class="message-header">
            <span class="message-author">{{ message.playerName }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div v-if="message.type === 'system'" class="message-content" v-html="message.content"></div>
          <div v-else class="message-content">{{ message.content }}</div>
        </template>
      </div>
    </div>

    <div class="chat-input">
      <textarea
        v-model="chatMessage"
        @keydown.enter.shift.prevent="handleSendMessage"
        :placeholder="chatTexts.placeholder"
        :disabled="!canChat"
        class="message-input"
        rows="1"
      ></textarea>
      <button
        @click="handleSendMessage"
        :disabled="!canChat || !chatMessage.trim()"
        class="send-button"
      >
        {{ chatTexts.send }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { GameMessage } from '../../types';

const { tm } = useI18n();

const props = defineProps({
  messages: {
    type: Array as PropType<GameMessage[]>,
    required: true,
  },
  canChat: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['send-message']);

const chatMessage = ref('');
const chatContainer = ref<HTMLDivElement | null>(null);
const chatTexts = computed(() => tm('game.chat') as { placeholder: string; send: string });

watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    });
  },
  { deep: true }
);

function formatTime(timestamp: Date) {
  return new Date(timestamp).toLocaleTimeString();
}

function handleSendMessage() {
  if (chatMessage.value.trim() && props.canChat) {
    emit('send-message', chatMessage.value);
    chatMessage.value = '';
  }
}
</script>

<style scoped>
.chat-section {
  background: white;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  padding: 15px;
  border-radius: 10px;
  max-width: 80%;
}

.message.system {
  background: #f8f9fa;
  align-self: center;
  text-align: center;
  font-style: italic;
}

.message.player {
  background: #e3f2fd;
  align-self: flex-end;
}

.message.ai {
  background: #f3e5f5;
  align-self: flex-start;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.message-author {
  font-weight: 600;
  color: #333;
}

.message-time {
  color: #999;
}

.message-content {
  color: #333;
  line-height: 1.4;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #e1e5e9;
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
}

.send-button {
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 