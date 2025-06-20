<template>
  <div class="setup-container">
    <div class="language-switcher">
      <button @click="setLanguage('en')" :class="{ active: locale === 'en' }">English</button>
      <button @click="setLanguage('ja')" :class="{ active: locale === 'ja' }">日本語</button>
    </div>
    <div class="setup-card">
      <h1 class="title">{{ t('setup.title') }}</h1>
      <p class="subtitle">{{ t('setup.subtitle') }}</p>
      
      <div class="api-key-section">
        <h2>{{ t('setup.apiKeySection.title') }}</h2>
        <p class="description">
          {{ t('setup.apiKeySection.description') }}
        </p>
        
        <div class="input-group">
          <input
            v-model="apiKey"
            type="password"
            :placeholder="t('setup.apiKeySection.placeholder')"
            class="api-input"
            @keyup.enter="startGame"
          />
          <button 
            @click="startGame" 
            :disabled="!apiKey.trim() || isLoading"
            class="start-button"
          >
            {{ isLoading ? t('setup.apiKeySection.loadingButton') : t('setup.apiKeySection.button') }}
          </button>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
      
      <div class="game-info">
        <h3>{{ t('setup.howToPlaySection.title') }}</h3>
        <ul>
          <li v-for="(rule, index) in howToPlayRules" :key="index">{{ rule }}</li>
        </ul>
        
        <h3>{{ t('setup.rolesSection.title') }}</h3>
        <div class="roles-grid">
          <div class="role-card">
            <img src="../assets/images/werewolf.jpeg" alt="Werewolf" class="role-image" />
            <h4>{{ t('setup.rolesSection.werewolf.name') }}</h4>
            <p>{{ t('setup.rolesSection.werewolf.description') }}</p>
          </div>
          <div class="role-card">
            <img src="../assets/images/villager.png" alt="Villager" class="role-image" />
            <h4>{{ t('setup.rolesSection.villager.name') }}</h4>
            <p>{{ t('setup.rolesSection.villager.description') }}</p>
          </div>
          <div class="role-card">
            <img src="../assets/images/seer.jpeg" alt="Seer" class="role-image" />
            <h4>{{ t('setup.rolesSection.seer.name') }}</h4>
            <p>{{ t('setup.rolesSection.seer.description') }}</p>
          </div>
          <div class="role-card">
            <img src="../assets/images/knight.jpeg" alt="Knight" class="role-image" />
            <h4>{{ t('setup.rolesSection.knight.name') }}</h4>
            <p>{{ t('setup.rolesSection.knight.description') }}</p>
          </div>
          <div class="role-card">
            <img src="../assets/images/medium.jpeg" alt="Medium" class="role-image" />
            <h4>{{ t('setup.rolesSection.medium.name') }}</h4>
            <p>{{ t('setup.rolesSection.medium.description') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../stores/game'
import { initializeOpenAI, validateApiKey } from '../utils/openai'

const { t, tm, locale } = useI18n()
const router = useRouter()
const gameStore = useGameStore()

const apiKey = ref('')
const isLoading = ref(false)
const errorKey = ref('')

const error = computed(() => errorKey.value ? t(errorKey.value) : '')
const howToPlayRules = computed(() => tm('setup.howToPlaySection.rules') as string[])

function setLanguage(lang: 'en' | 'ja') {
  locale.value = lang
}

async function startGame() {
  if (!apiKey.value.trim()) {
    errorKey.value = 'setup.apiKeySection.error'
    return
  }

  isLoading.value = true
  errorKey.value = ''

  try {
    const isValid = await validateApiKey(apiKey.value)
    if (!isValid) {
      errorKey.value = 'setup.apiKeySection.invalidKeyError'
      return
    }
    
    initializeOpenAI(apiKey.value)
    gameStore.setApiKey(apiKey.value)
    gameStore.initializeGame(6)
    
    await router.push('/game')
  } catch (err) {
    console.error('Start game error:', err)
    errorKey.value = 'setup.apiKeySection.initError'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.setup-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.language-switcher {
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.2);
  padding: 5px;
  border-radius: 10px;
}

.language-switcher button {
  background: transparent;
  border: none;
  color: white;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.language-switcher button.active {
  background-color: rgba(255, 255, 255, 0.3);
}

.setup-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #333;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
  font-size: 1.1rem;
}

.api-key-section {
  margin-bottom: 40px;
}

.api-key-section h2 {
  color: #333;
  margin-bottom: 10px;
}

.description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.api-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.api-input:focus {
  outline: none;
  border-color: #667eea;
}

.start-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.start-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  background: #fdf2f2;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.game-info {
  border-top: 1px solid #e1e5e9;
  padding-top: 30px;
}

.game-info h3 {
  color: #333;
  margin-bottom: 15px;
}

.game-info ul {
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
  list-style-type: none;
  padding-left: 0;
}

.game-info li {
  margin-bottom: 8px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.role-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e1e5e9;
  text-align: center;
}

.role-image {
  width: 100%;
  height: 120px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 15px;
}

.role-card h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.role-card p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .setup-card {
    padding: 20px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .roles-grid {
    grid-template-columns: 1fr;
  }
}
</style> 