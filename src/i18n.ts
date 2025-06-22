import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    setup: {
      title: '🐺 LLM Werewolf Game',
      subtitle: 'Play werewolf against AI opponents powered by OpenAI',
      apiKeySection: {
        title: 'Enter Your OpenAI API Key',
        description: 'To play against AI opponents, you\'ll need an OpenAI API key. Your key is stored locally and never sent to our servers.',
        placeholder: 'sk-...',
        button: 'Start Game',
        loadingButton: 'Starting...',
        error: 'Please enter your OpenAI API key',
        invalidKeyError: 'Invalid API key. Please check your OpenAI API key and try again.',
        initError: 'Failed to initialize game. Please check your API key.'
      },
      howToPlaySection: {
        title: 'How to Play',
        rules: [
          'Enter your OpenAI API key to start.',
          'Roles are assigned secretly.',
          'Discuss during the day to find the werewolves.',
          'Vote to eliminate a player each day.',
          'At night, werewolves kill, and other roles take actions.',
          'Win by eliminating the opposing faction.'
        ]
      },
      rolesSection: {
        title: 'Roles',
        werewolf: {
          name: '🐺 Werewolf',
          description: 'Kill villagers at night. Win by eliminating all villagers.'
        },
        villager: {
          name: '👥 Villager',
          description: 'Identify and vote out werewolves. Win by eliminating all werewolves.'
        },
        seer: {
          name: '🔮 Seer',
          description: 'Investigate one player each night to learn their true role.'
        },
        knight: {
          name: '🛡️ Knight',
          description: 'Each night, you can protect one player from a werewolf attack.'
        },
        medium: {
          name: '👻 Medium',
          description: 'After a player is eliminated by vote, you learn their role.'
        }
      },
    },
    game: {
        header: {
          day: 'Day',
          phase: 'Phase',
          timeRemaining: 'Time Remaining'
        },
        players: 'Players',
        chat: {
          placeholder: 'Type your message...',
          send: 'Send'
        },
        actions: {
          vote: 'Vote',
          kill: 'Kill',
          investigate: 'Investigate',
          protect: 'Protect',
          startGame: 'Start Game'
        },
        systemMessages: {
          gameInitialized: 'Game initialized! Ready to start.',
          gameStarted: 'The game has begun! The first night falls...',
          nightActions: 'All players close their eyes. Special roles, wake up and perform your actions.',
          dayBegins: 'Day {dayNumber} begins. Discuss and vote for who you think is a werewolf.',
          votingBegins: 'Voting phase begins. Choose who to eliminate.',
          nightFalls: 'Night falls again. Werewolves, choose your next victim.',
          werewolfCantKill: 'Werewolves cannot kill on the first night.',
          playerVoted: '{playerName} has voted.',
          timesUp: "Time's up! Moving to voting phase.",
          playerProtected: '{playerName} was attacked, but was protected and survived!',
          playerKilled: '{playerName} was killed during the night.',
          seerResult: 'You investigated {targetName} and discovered they are {role}.',
          mediumResult: 'You have channeled the spirit of the eliminated player. {targetName} was a {role}.',
          gameOver: 'Game Over! {winner} win!'
        },
        roles: {
          werewolf: 'a Werewolf',
          notWerewolf: 'not a Werewolf'
        },
        winner: {
          villagers: 'Villagers',
          werewolves: 'Werewolves'
        },
        phases: {
          setup: {
            name: 'Setup',
            description: 'Getting ready for the werewolf game to begin!'
          },
          first_night: {
            name: 'First Night',
            description: 'A quiet night... Special roles, use your abilities secretly!'
          },
          night: {
            name: 'Night',
            description: 'Who will the werewolves attack? Other roles, take action!'
          },
          day: {
            name: 'Day',
            description: 'It\'s morning! Who was attacked last night? Time for discussion!'
          },
          voting: {
            name: 'Voting',
            description: 'Let\'s banish someone suspicious! Cast your votes!'
          },
          game_over: {
            name: 'Game Over',
            description: 'The game is over! Thanks for playing!'
          }
        }
    }
  },
  ja: {
    setup: {
      title: '🐺 LLM人狼ゲーム',
      subtitle: 'OpenAIを搭載したAIプレイヤーと人狼をプレイしよう',
      apiKeySection: {
        title: 'OpenAI APIキーを入力してください',
        description: 'AIと対戦するにはOpenAIのAPIキーが必要です。キーはローカルに保存され、私たちのサーバーに送信されることはありません。',
        placeholder: 'sk-...',
        button: 'ゲーム開始',
        loadingButton: '開始中...',
        error: 'OpenAI APIキーを入力してください',
        invalidKeyError: '無効なAPIキーです。OpenAI APIキーを確認して、もう一度お試しください。',
        initError: 'ゲームの初期化に失敗しました。APIキーを確認してください。'
      },
      howToPlaySection: {
        title: '遊び方',
        rules: [
          'OpenAI APIキーを入力してゲームを開始します。',
          '役職は秘密裏に割り当てられます。',
          '昼の間に議論して人狼を見つけ出します。',
          '毎日投票でプレイヤーを一人追放します。',
          '夜になると、人狼は殺害し、他の役職は行動します。',
          '敵対する陣営を全滅させれば勝利です。'
        ]
      },
      rolesSection: {
        title: '役職',
        werewolf: {
          name: '🐺 人狼',
          description: '夜に村人を一人殺します。すべての村人を排除すれば勝利です。'
        },
        villager: {
          name: '👥 村人',
          description: '人狼を特定し、投票で追放します。すべての人狼を排除すれば勝利です。'
        },
        seer: {
          name: '🔮 占い師',
          description: '毎晩、プレイヤーを一人選んでその正体を知ることができます。'
        },
        knight: {
          name: '🛡️ 騎士',
          description: '毎晩、プレイヤーを一人選んで人狼の襲撃から守ることができます。'
        },
        medium: {
          name: '👻 霊媒師',
          description: '投票で追放されたプレイヤーの役職を知ることができます。'
        }
      },
    },
    game: {
      header: {
        day: '日目',
        phase: 'フェーズ',
        timeRemaining: '残り時間'
      },
      players: 'プレイヤー',
      chat: {
        placeholder: 'メッセージを入力...',
        send: '送信'
      },
      actions: {
        vote: '投票',
        kill: '襲撃',
        investigate: '占う',
        protect: '守る',
        startGame: 'ゲーム開始'
      },
      systemMessages: {
        gameInitialized: 'ゲームが初期化されました！開始準備ができました。',
        gameStarted: 'ゲームが始まりました！最初の夜が訪れます...',
        nightActions: '全てのプレイヤーは目を閉じてください。特殊な役職のプレイヤーは目を覚まし、行動してください。',
        dayBegins: '{dayNumber}日目の朝が来ました。誰が人狼だと思うか議論し、投票してください。',
        votingBegins: '投票の時間です。追放する人を選んでください。',
        nightFalls: '再び夜が訪れました。人狼は次の犠牲者を選んでください。役職のあるプレイヤーは行動を起こしてください。',
        werewolfCantKill: '人狼は最初の夜に殺すことはできません。',
        playerVoted: '{playerName}が投票しました。',
        timesUp: '時間切れです！投票フェーズに移ります。',
        playerProtected: '{playerName}は襲撃されましたが、守られて生き残りました！',
        playerKilled: '{playerName}は夜の間に殺されました。',
        seerResult: '{targetName}を占った結果、彼らは{role}でした。',
        mediumResult: '追放されたプレイヤーの魂と交信しました。{targetName}は{role}でした。',
        gameOver: 'ゲームオーバー！{winner}の勝利です！'
      },
      roles: {
        werewolf: '人狼',
        notWerewolf: '人狼ではない'
      },
      winner: {
        villagers: '村人チーム',
        werewolves: '人狼チーム'
      },
      phases: {
        setup: {
          name: '準備',
          description: '人狼ゲームの開始を待っています！'
        },
        first_night: {
          name: '最初の夜',
          description: '静かな夜... 特殊な役職は、秘密裏に能力を使いましょう！'
        },
        night: {
          name: '夜',
          description: '人狼は誰を襲撃するのか？他の役職も行動を起こしましょう！'
        },
        day: {
          name: '昼',
          description: '朝になりました！昨晩襲撃されたのは誰でしょう？議論の時間です！'
        },
        voting: {
          name: '投票',
          description: '怪しい人物を追放しましょう！投票してください！'
        },
        game_over: {
          name: 'ゲームオーバー',
          description: 'ゲーム終了です！プレイしてくれてありがとう！'
        }
      }
    }
  }
}

const i18n = createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: 'en', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages,
})

export default i18n 