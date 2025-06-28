import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameTimersStore = defineStore('gameTimers', () => {
  const timerId = ref<ReturnType<typeof setInterval> | null>(null)
  const dayTimeRemaining = ref<number | null>(null)

  /**
   * Stops the day timer.
   */
  function stopDayTimer() {
    if (timerId.value) {
      clearInterval(timerId.value)
      timerId.value = null
      dayTimeRemaining.value = null
    }
  }

  /**
   * Starts the day timer for discussion.
   * @param duration The duration of the timer in seconds.
   * @param onTimeUp Callback function when timer reaches zero.
   */
  function startDayTimer(
    duration: number, 
    onTimeUp: () => void
  ) {
    stopDayTimer()
    dayTimeRemaining.value = duration

    timerId.value = setInterval(() => {
      if (dayTimeRemaining.value !== null) {
        dayTimeRemaining.value--
        
        if (dayTimeRemaining.value <= 0) {
          stopDayTimer()
          onTimeUp()
        }
      }
    }, 1000)
  }

  /**
   * Gets the remaining time in a formatted string.
   * @returns Formatted time string (MM:SS) or null if no timer active.
   */
  function getFormattedTimeRemaining(): string | null {
    if (dayTimeRemaining.value === null) return null
    
    const minutes = Math.floor(dayTimeRemaining.value / 60)
    const seconds = dayTimeRemaining.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  /**
   * Checks if the timer is currently running.
   * @returns True if timer is active, false otherwise.
   */
  function isTimerActive(): boolean {
    return timerId.value !== null
  }

  /**
   * Gets the percentage of time remaining.
   * @param totalDuration The total duration the timer was set for.
   * @returns Percentage (0-100) of time remaining, or null if no timer active.
   */
  function getTimeRemainingPercentage(totalDuration: number): number | null {
    if (dayTimeRemaining.value === null) return null
    return Math.max(0, Math.min(100, (dayTimeRemaining.value / totalDuration) * 100))
  }

  return {
    dayTimeRemaining,
    startDayTimer,
    stopDayTimer,
    getFormattedTimeRemaining,
    isTimerActive,
    getTimeRemainingPercentage
  }
}) 