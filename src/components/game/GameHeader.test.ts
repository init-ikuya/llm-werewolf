import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import GameHeader from './GameHeader.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      game: {
        header: {
          day: 'Day',
          timeRemaining: 'Time Remaining'
        }
      }
    }
  }
})

describe('GameHeader', () => {
  const defaultProps = {
    phaseInfo: {
      name: 'Day',
      icon: '☀️',
      description: 'Time for discussion'
    },
    dayNumber: 1,
    dayTimeRemaining: null
  }

  it('renders game title correctly', () => {
    const wrapper = mount(GameHeader, {
      props: defaultProps,
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('.game-title').text()).toBe('🐺 LLM Werewolf')
  })

  it('displays phase information correctly', () => {
    const wrapper = mount(GameHeader, {
      props: defaultProps,
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('.phase-icon').text()).toBe('☀️')
    expect(wrapper.find('.phase-name').text()).toBe('Day')
    expect(wrapper.find('.phase-description').text()).toBe('Time for discussion')
  })

  it('displays day number correctly', () => {
    const wrapper = mount(GameHeader, {
      props: {
        ...defaultProps,
        dayNumber: 5
      },
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('.day-counter').text()).toBe('Day: 5')
  })

  it('shows timer when dayTimeRemaining is provided', () => {
    const wrapper = mount(GameHeader, {
      props: {
        ...defaultProps,
        dayTimeRemaining: 30
      },
      global: {
        plugins: [i18n]
      }
    })

    const timer = wrapper.find('.timer')
    expect(timer.exists()).toBe(true)
    expect(timer.text()).toBe('Time Remaining: 30s')
  })

  it('hides timer when dayTimeRemaining is null', () => {
    const wrapper = mount(GameHeader, {
      props: {
        ...defaultProps,
        dayTimeRemaining: null
      },
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('.timer').exists()).toBe(false)
  })

  it('emits reset-game event when reset button is clicked', async () => {
    const wrapper = mount(GameHeader, {
      props: defaultProps,
      global: {
        plugins: [i18n]
      }
    })

    const resetButton = wrapper.find('.reset-button')
    await resetButton.trigger('click')

    expect(wrapper.emitted()['reset-game']).toBeTruthy()
    expect(wrapper.emitted()['reset-game']).toHaveLength(1)
  })

  it('updates phase info when props change', async () => {
    const wrapper = mount(GameHeader, {
      props: defaultProps,
      global: {
        plugins: [i18n]
      }
    })

    await wrapper.setProps({
      phaseInfo: {
        name: 'Night',
        icon: '🌙',
        description: 'Time for actions'
      }
    })

    expect(wrapper.find('.phase-icon').text()).toBe('🌙')
    expect(wrapper.find('.phase-name').text()).toBe('Night')
    expect(wrapper.find('.phase-description').text()).toBe('Time for actions')
  })

  it('renders reset button with correct text', () => {
    const wrapper = mount(GameHeader, {
      props: defaultProps,
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('.reset-button').text()).toBe('🔄')
  })

  it('has correct CSS classes structure', () => {
    const wrapper = mount(GameHeader, {
      props: defaultProps,
      global: {
        plugins: [i18n]
      }
    })

    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.find('.header-left').exists()).toBe(true)
    expect(wrapper.find('.header-right').exists()).toBe(true)
    expect(wrapper.find('.game-phase').exists()).toBe(true)
  })
}) 