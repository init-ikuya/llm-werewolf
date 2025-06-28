
import { setActivePinia, createPinia } from 'pinia'
import { useGameTimersStore } from '../../../stores/game/gameTimers'

describe('Game Timers Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should initialize with no active timer', () => {
      const store = useGameTimersStore()
      
      expect(store.dayTimeRemaining).toBe(null)
      expect(store.isTimerActive()).toBe(false)
      expect(store.getFormattedTimeRemaining()).toBe(null)
    })
  })

  describe('startDayTimer', () => {
    it('should start timer with specified duration', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(60, mockCallback)
      
      expect(store.dayTimeRemaining).toBe(60)
      expect(store.isTimerActive()).toBe(true)
    })

    it('should call callback when timer reaches zero', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(3, mockCallback)
      
      // Fast-forward time
      vi.advanceTimersByTime(3000) // 3 seconds
      
      expect(mockCallback).toHaveBeenCalledOnce()
      expect(store.dayTimeRemaining).toBe(null)
      expect(store.isTimerActive()).toBe(false)
    })

    it('should count down correctly', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(5, mockCallback)
      
      expect(store.dayTimeRemaining).toBe(5)
      
      vi.advanceTimersByTime(1000) // 1 second
      expect(store.dayTimeRemaining).toBe(4)
      
      vi.advanceTimersByTime(1000) // Another second
      expect(store.dayTimeRemaining).toBe(3)
      
      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('should stop previous timer when starting new one', () => {
      const store = useGameTimersStore()
      const firstCallback = vi.fn()
      const secondCallback = vi.fn()
      
      store.startDayTimer(10, firstCallback)
      expect(store.dayTimeRemaining).toBe(10)
      
      // Start a new timer before the first one finishes
      store.startDayTimer(5, secondCallback)
      expect(store.dayTimeRemaining).toBe(5)
      
      // Advance time to when first timer would have finished
      vi.advanceTimersByTime(10000)
      
      expect(firstCallback).not.toHaveBeenCalled()
      expect(secondCallback).toHaveBeenCalledOnce()
    })
  })

  describe('stopDayTimer', () => {
    it('should stop active timer', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(10, mockCallback)
      expect(store.isTimerActive()).toBe(true)
      
      store.stopDayTimer()
      
      expect(store.dayTimeRemaining).toBe(null)
      expect(store.isTimerActive()).toBe(false)
      
      // Advance time - callback should not be called
      vi.advanceTimersByTime(10000)
      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('should be safe to call when no timer is active', () => {
      const store = useGameTimersStore()
      
      expect(() => store.stopDayTimer()).not.toThrow()
      expect(store.dayTimeRemaining).toBe(null)
    })
  })

  describe('getFormattedTimeRemaining', () => {
    it('should format time correctly', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      // Test various time formats
      store.startDayTimer(125, mockCallback) // 2:05
      expect(store.getFormattedTimeRemaining()).toBe('02:05')
      
      store.startDayTimer(65, mockCallback) // 1:05
      expect(store.getFormattedTimeRemaining()).toBe('01:05')
      
      store.startDayTimer(59, mockCallback) // 0:59
      expect(store.getFormattedTimeRemaining()).toBe('00:59')
      
      store.startDayTimer(5, mockCallback) // 0:05
      expect(store.getFormattedTimeRemaining()).toBe('00:05')
    })

    it('should return null when no timer is active', () => {
      const store = useGameTimersStore()
      
      expect(store.getFormattedTimeRemaining()).toBe(null)
    })

    it('should update format as time counts down', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(65, mockCallback) // Start at 1:05
      expect(store.getFormattedTimeRemaining()).toBe('01:05')
      
      vi.advanceTimersByTime(5000) // Advance 5 seconds
      expect(store.getFormattedTimeRemaining()).toBe('01:00')
      
      vi.advanceTimersByTime(55000) // Advance 55 seconds
      expect(store.getFormattedTimeRemaining()).toBe('00:05')
    })
  })

  describe('getTimeRemainingPercentage', () => {
    it('should calculate percentage correctly', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(100, mockCallback)
      
      // At start: 100% remaining
      expect(store.getTimeRemainingPercentage(100)).toBe(100)
      
      vi.advanceTimersByTime(25000) // 25 seconds passed
      expect(store.getTimeRemainingPercentage(100)).toBe(75)
      
      vi.advanceTimersByTime(50000) // Total 75 seconds passed
      expect(store.getTimeRemainingPercentage(100)).toBe(25)
    })

    it('should return null when no timer is active', () => {
      const store = useGameTimersStore()
      
      expect(store.getTimeRemainingPercentage(100)).toBe(null)
    })

    it('should handle edge cases', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(10, mockCallback)
      
      // Should not go below 0
      vi.advanceTimersByTime(15000) // More than timer duration
      expect(store.getTimeRemainingPercentage(10)).toBe(null) // Timer stopped
      
      // Test with 1 second remaining
      store.startDayTimer(10, mockCallback)
      vi.advanceTimersByTime(9000) // 9 seconds passed
      expect(store.getTimeRemainingPercentage(10)).toBe(10)
    })

    it('should handle different total durations', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(30, mockCallback) // 30 seconds actual
      vi.advanceTimersByTime(10000) // 10 seconds passed, 20 remaining
      
      // Calculate percentage based on different total durations
      expect(Math.round(store.getTimeRemainingPercentage(30) || 0)).toBe(Math.round((20/30) * 100))
      expect(Math.round(store.getTimeRemainingPercentage(60) || 0)).toBe(Math.round((20/60) * 100))
    })
  })

  describe('isTimerActive', () => {
    it('should return false initially', () => {
      const store = useGameTimersStore()
      
      expect(store.isTimerActive()).toBe(false)
    })

    it('should return true when timer is running', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(60, mockCallback)
      
      expect(store.isTimerActive()).toBe(true)
    })

    it('should return false after timer stops', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(2, mockCallback)
      expect(store.isTimerActive()).toBe(true)
      
      vi.advanceTimersByTime(2000) // Timer finishes
      expect(store.isTimerActive()).toBe(false)
    })

    it('should return false after manual stop', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(60, mockCallback)
      expect(store.isTimerActive()).toBe(true)
      
      store.stopDayTimer()
      expect(store.isTimerActive()).toBe(false)
    })
  })

  describe('timer precision', () => {
    it('should tick exactly every second', () => {
      const store = useGameTimersStore()
      const mockCallback = vi.fn()
      
      store.startDayTimer(5, mockCallback)
      
      // Check each second
      for (let i = 0; i < 5; i++) {
        expect(store.dayTimeRemaining).toBe(5 - i)
        vi.advanceTimersByTime(1000)
      }
      
      expect(mockCallback).toHaveBeenCalledOnce()
    })
  })
}) 