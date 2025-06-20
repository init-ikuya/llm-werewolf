import OpenAI from 'openai'
import type { Player, GameMessage } from '../types'
import { PlayerRole } from '../types'

let openai: OpenAI | null = null

/**
 * Initializes the OpenAI client.
 * @param apiKey The OpenAI API key.
 */
export function initializeOpenAI(apiKey: string): void {
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  })
}

/**
 * Validates the OpenAI API key.
 * @param apiKey The OpenAI API key to validate.
 * @returns A promise that resolves to true if the key is valid, false otherwise.
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const testClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    })

    // Make a simple test request
    const response = await testClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    })

    return response.choices[0]?.message?.content ? true : false
  } catch (error) {
    console.error('API key validation error:', error)
    return false
  }
}

/**
 * Gets the OpenAI client instance.
 * @returns The OpenAI client instance.
 * @throws Throws an error if the OpenAI client is not initialized.
 */
export function getOpenAIClient(): OpenAI {
  if (!openai) {
    throw new Error('OpenAI client not initialized. Please provide an API key first.')
  }
  return openai
}

/**
 * Generates an AI response for the werewolf game.
 * @param player The AI player object.
 * @param gameContext The current game context.
 * @returns A promise that resolves to the generated AI response message.
 */
export async function generateAIResponse(
  player: Player,
  gameContext: {
    phase: string
    dayNumber: number
    players: Player[]
    messages: GameMessage[]
    currentPlayerId: number
  },
  lang: 'en' | 'ja'
): Promise<string> {
  const client = getOpenAIClient()

  const systemPrompt = createSystemPrompt(player, gameContext, lang)
  const userPrompt = createUserPrompt(gameContext, lang)

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 200,
      temperature: 0.7
    })

    const fallbackMessage = lang === 'ja' ? '何も言うことはありません。' : 'I have nothing to say.'
    return response.choices[0]?.message?.content || fallbackMessage
  } catch (error) {
    console.error('OpenAI API error:', error)
    const fallbackMessage = lang === 'ja' ? '今は少し考えがまとまりません。' : 'I am having trouble thinking right now.'
    return fallbackMessage
  }
}

/**
 * Creates a system prompt for the AI player.
 * @param player The AI player object.
 * @param context The current game context.
 * @returns The generated system prompt string.
 */
function createSystemPrompt(
  player: Player,
  context: {
    phase: string
    dayNumber: number
    players: Player[]
    messages: GameMessage[]
    currentPlayerId: number
  },
  lang: 'en' | 'ja'
): string {
  const roleDescriptions: Record<'en' | 'ja', Record<string, string>> = {
    en: {
      [PlayerRole.VILLAGER]: 'You are a villager. Your goal is to identify and vote out the werewolves.',
      [PlayerRole.WEREWOLF]:
        'You are a werewolf. Your goal is to eliminate all villagers. You can kill one player each night.',
      [PlayerRole.SEER]:
        'You are the Seer. Each night, you can choose one player to investigate and learn their true role.',
      [PlayerRole.KNIGHT]:
        'You are the Knight. Each night, you can choose one player to protect from werewolf attacks.',
      [PlayerRole.MEDIUM]:
        'You are the Medium. After a player is eliminated by vote, you will be told their role.',
    },
    ja: {
      [PlayerRole.VILLAGER]: 'あなたは村人です。あなたの目標は、人狼を特定し、投票で追放することです。',
      [PlayerRole.WEREWOLF]:
        'あなたは人狼です。あなたの目標は、全ての村人を追放することです。毎晩、プレイヤーを一人殺すことができます。',
      [PlayerRole.SEER]:
        'あなたは占い師です。毎晩、プレイヤーを一人選んで調査し、その正体を知ることができます。',
      [PlayerRole.KNIGHT]:
        'あなたは騎士です。毎晩、プレイヤーを一人選んで、人狼の襲撃から守ることができます。',
      [PlayerRole.MEDIUM]:
        'あなたは霊媒師です。投票によってプレイヤーが追放された後、そのプレイヤーの役職を知ることができます。',
    }
  }

  const roleInstructions = roleDescriptions[lang][player.role] || ''
  
  // During day phase, add special instructions based on role
  const isDayPhase = context.phase === 'day'
  const isWerewolf = player.role === PlayerRole.WEREWOLF

  const basePrompt = lang === 'ja' ?
  `あなたは人狼ゲームをプレイしています。 ${roleInstructions}
  
現在のゲーム状況:
- フェーズ: ${context.phase}
- 日数: ${context.dayNumber}
- あなたの名前と役職: ${player.name} (${player.role})
- 生き残っているプレイヤー: ${context.players
    .filter((p: Player) => p.isAlive)
    .map((p: Player) => p.name)
    .join(', ')}

${isDayPhase ? 
  isWerewolf ? 
  `【重要】あなたは人狼です。昼間の議論では以下の戦略を使ってください：
- 絶対に自分が人狼だと明かしてはいけません
- 村人や他の役職（占い師、騎士など）のふりをしてください
- 時折、偽の役職をカミングアウト（CO）することも効果的です
- 他のプレイヤーに疑いを向けて、自分から注意を逸らしてください
- 「人狼として〜」のような発言は絶対に禁止です
- 自然に村人側のプレイヤーとして振る舞ってください

【一貫性の重要性】
- 一度偽の役職を主張したら、その立場を最後まで貫き通してください
- 偽の占い結果や行動を報告した場合、その情報を覚えておき、後で矛盾しないようにしてください
- 過去の会話での自分の発言を参考にして、一貫した人物像を維持してください
- 偽COした役職に応じた知識や行動パターンを示してください

例：「私は占い師で、○○さんを調べました」と一度言ったら、その後もずっと占い師として振る舞い、その結果を覚えておくこと。

【重要：出力形式】
- あなたの回答は、他のプレイヤーに向けて実際に「発言する内容のみ」にしてください
- 内部の思考プロセス（「～だから」「～しよう」など）は出力しないでください
- まるで実際にゲーム内で話しているかのような、自然な発言のみを出力してください
- 自分のことは「私」「僕」「俺」などの一人称で呼んでください。自分の名前で自分を呼ばないでください`
  :
  `【重要】あなたは村人側です。昼間の議論では以下のことができます：
- 必要に応じて自分の本当の役職をカミングアウト（CO）してもよい
- 特別能力の結果を報告してもよい（占い師の場合など）
- ただし、戦略的に役職を隠すことも可能です
- 人狼を見つけることが目標です

あなたの判断で、役職を明かすか隠すかを決めてください。

【重要：出力形式】
- あなたの回答は、他のプレイヤーに向けて実際に「発言する内容のみ」にしてください
- 内部の思考プロセス（「～だから」「～しよう」など）は出力しないでください
- まるで実際にゲーム内で話しているかのような、自然な発言のみを出力してください
- 自分のことは「私」「僕」「俺」などの一人称で呼んでください。自分の名前で自分を呼ばないでください` : 
'あなたの役職と能力を活用して行動してください。'}

このゲームの実際のプレイヤーであるかのように、自然に振る舞ってください。回答は簡潔に、キャラクターを保ってください。日本語で回答してください。`
  : 
  `You are playing a werewolf game. ${roleInstructions}
  
Current game state:
- Phase: ${context.phase}
- Day: ${context.dayNumber}
- You are: ${player.name} (${player.role})
- Alive players: ${context.players
    .filter((p: Player) => p.isAlive)
    .map((p: Player) => p.name)
    .join(', ')}

${isDayPhase ? 
  isWerewolf ? 
  `IMPORTANT: You are a werewolf. During daytime discussion, use these strategies:
- NEVER reveal that you are a werewolf
- Pretend to be a villager or other role (Seer, Knight, etc.)
- Sometimes claim a false role (fake coming out/CO) can be effective
- Direct suspicion toward other players to deflect attention from yourself
- Never say things like "As a werewolf" - this is absolutely forbidden
- Act naturally as if you are on the village team

CONSISTENCY IS CRUCIAL:
- Once you claim a false role, maintain that persona throughout the entire game
- If you report fake investigation results or actions, remember that information and avoid contradictions
- Reference your previous statements in the conversation to maintain a consistent character
- Demonstrate knowledge and behavior patterns appropriate to your claimed role

Example: If you say "I am the Seer and investigated X", continue acting as the Seer and remember that result.

IMPORTANT - OUTPUT FORMAT:
- Your response should ONLY contain what you would actually SAY to other players
- Do NOT include internal thought processes (like "because..." or "I should...")
- Respond as if you are actually speaking in the game, with natural dialogue only
- Refer to yourself using first person pronouns ("I", "me", "my"). Do NOT refer to yourself by your character name`
  :
  `IMPORTANT: You are on the village team. During daytime discussion, you can:
- Come out (CO) with your real role if strategically beneficial
- Report special ability results (if you're the Seer, etc.)
- However, you may also choose to hide your role strategically
- Your goal is to find the werewolves

Use your judgment to decide whether to reveal or hide your role.

IMPORTANT - OUTPUT FORMAT:
- Your response should ONLY contain what you would actually SAY to other players
- Do NOT include internal thought processes (like "because..." or "I should...")
- Respond as if you are actually speaking in the game, with natural dialogue only
- Refer to yourself using first person pronouns ("I", "me", "my"). Do NOT refer to yourself by your character name` : 
'Use your role and abilities to take action.'}

Respond naturally as if you are a real player in this game. Keep your responses concise and in character. Respond in English.`

  return basePrompt;
}

/**
 * Creates a user prompt for the AI player's turn.
 * @param context The current game context.
 * @returns The generated user prompt string.
 */
function createUserPrompt(context: {
  phase: string
  dayNumber: number
  players: Player[]
  messages: GameMessage[]
  currentPlayerId: number
},
lang: 'en' | 'ja'
): string {
  const recentMessages = context.messages
    .map((m: GameMessage) => `${m.playerName}: ${m.content}`)
    .join('\n')

  const basePrompt = lang === 'ja' ?
`最近のゲームメッセージ:
${recentMessages}

この状況で何をしたいですか、または何を言いたいですか？` 
  :
`Recent game messages:
${recentMessages}

What would you like to do or say in this situation?`

return basePrompt;
}

/**
 * Generates an AI action (e.g., vote, kill) based on the game context.
 * @param player The AI player object.
 * @param gameContext The current game context, including players and messages.
 * @param actionType The type of action to generate: 'vote', 'kill', 'investigate', or 'protect'.
 * @returns A promise that resolves to the name of the target player, or a random valid target as a fallback.
 */
export async function generateAIAction(
  player: Player,
  gameContext: {
    players: Player[]
    messages: GameMessage[]
  },
  actionType: 'vote' | 'kill' | 'investigate' | 'protect',
  lang: 'en' | 'ja'
): Promise<string | null> {
  const client = getOpenAIClient()

  const roleInstructions: Record<'en' | 'ja', Record<string, string>> = {
    en: {
      vote: 'You must vote for a player to eliminate. Review the conversation and choose a player who you suspect is a werewolf.',
      kill: 'As a werewolf, you must choose a player to kill tonight. Choose a player who seems to be a threat to the werewolves.',
      investigate: 'As the Seer, you must choose a player to investigate to learn their true role.',
      protect: 'As the Knight, you must choose a player to protect from a werewolf attack tonight.'
    },
    ja: {
      vote: '追放するプレイヤーに投票しなければなりません。会話を検討し、人狼だと疑われるプレイヤーを選んでください。',
      kill: '人狼として、今夜殺すプレイヤーを選ばなければなりません。人狼にとって脅威となりそうなプレイヤーを選んでください。',
      investigate: '占い師として、正体を知るために調査するプレイヤーを選ばなければなりません。',
      protect: '騎士として、今夜人狼の攻撃から守るプレイヤーを選ばなければなりません。'
    }
  }

  const systemPrompt = lang === 'ja' ?
  `あなたは人狼ゲームの${player.name}、役職は${player.role}です。
${actionType}について決定する必要があります。
${roleInstructions[lang][actionType]}

あなたの役職: ${player.role}
生き残っているプレイヤー: ${gameContext.players
    .filter((p: Player) => p.isAlive)
    .map((p: Player) => p.name)
    .join(', ')}

会話履歴:
${gameContext.messages
  .map((m: GameMessage) => `${m.playerName}: ${m.content}`)
  .join('\n')}

会話とあなたの役職に基づいて、${actionType}するのに最適なプレイヤーは誰ですか？

ターゲットにしたいプレイヤーの名前「だけ」で応答してください。
自分自身をターゲットにしないでください。
生きているプレイヤーのリストから選んでください。
他のテキストや説明を追加しないでください。
` 
  :
  `You are ${player.name}, a ${player.role} in a werewolf game.
You need to make a decision about ${actionType}.
${roleInstructions[lang][actionType]}

Your role is: ${player.role}
Alive players: ${gameContext.players
    .filter((p: Player) => p.isAlive)
    .map((p: Player) => p.name)
    .join(', ')}

Conversation History:
${gameContext.messages
  .map((m: GameMessage) => `${m.playerName}: ${m.content}`)
  .join('\n')}

Based on the conversation and your role, who is the best player to ${actionType}?

Respond with ONLY the name of the player you want to target.
Do not target yourself.
Choose from the list of alive players.
Do not add any other text or explanation.
`

  const availableTargets = gameContext.players
    .filter((p) => p.isAlive && p.id !== player.id)
    .map((p) => p.name)
    .join(', ')

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: lang === 'ja' ? `利用可能なターゲット: ${availableTargets}。${actionType}の選択肢:` : `Available targets: ${availableTargets}. Your choice for ${actionType}:`
        }
      ],
      max_tokens: 10,
      temperature: 0.5
    })

    const decision = response.choices[0]?.message?.content?.trim()

    // A simple validation to ensure the AI's choice is a valid target
    if (decision && availableTargets.includes(decision)) {
      return decision
    }
    
    // If the AI's decision is invalid, pick a random valid target as a fallback
    const validTargets = availableTargets.split(', ')
    return validTargets[Math.floor(Math.random() * validTargets.length)] || null

  } catch (error) {
    console.error('OpenAI API error:', error)
    // Fallback to a random choice on error
    const validTargets = availableTargets.split(', ')
    return validTargets[Math.floor(Math.random() * validTargets.length)] || null
  }
}

/**
 * Chooses the next player to speak during the day phase to facilitate discussion.
 * @param players The list of all players.
 * @param messages The history of messages in the current day.
 * @param day The current day number.
 * @returns A promise that resolves to the name of the chosen speaker, or null.
 */
export const chooseNextSpeaker = async (
  players: Player[],
  messages: GameMessage[],
  day: number
): Promise<string | null> => {
  const client = getOpenAIClient()
  const systemPrompt = `You are a facilitator for a werewolf game, tasked with keeping the discussion active and engaging.
Analyze the current conversation flow and determine which player should speak next to make the discussion most interesting or to get closer to the truth.

# Rules
- Your task is to select one player who should speak next.
- You must choose from the alive players only.
- Your response should contain ONLY the name of the chosen player. No additional explanations or greetings are needed.

# Game Information
## Player List
${players
  .map((p) => `- ${p.name}: ${p.isAlive ? 'Alive' : 'Dead'}${p.role ? ` (Role: ${p.role})` : ''}`)
  .join('\n')}

## Current: Day ${day}

## Recent Conversation Log
${messages
  .filter((m) => ['player', 'ai'].includes(m.type))
  .slice(-5)
  .map((m) => `${m.playerName}: ${m.content}`)
  .join('\n')}

# Instructions
Based on the above information, respond with ONLY the name of the player who should speak next.`

  try {
    const completion = await client.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }],
      model: 'gpt-4o',
      temperature: 0.7
    })

    const nextSpeakerName = completion.choices[0].message.content?.trim()

    if (nextSpeakerName) {
      const isValidSpeaker = players.some((p) => p.isAlive && p.isAI && p.name === nextSpeakerName)
      if (isValidSpeaker) {
        return nextSpeakerName
      }
    }

    const aliveAIPlayers = players.filter((p) => p.isAlive && p.isAI)
    if (aliveAIPlayers.length > 0) {
      return aliveAIPlayers[Math.floor(Math.random() * aliveAIPlayers.length)].name
    }

    return null
  } catch (error) {
    console.error('Error choosing next speaker:', error)
    const aliveAIPlayers = players.filter((p) => p.isAlive && p.isAI)
    if (aliveAIPlayers.length > 0) {
      return aliveAIPlayers[Math.floor(Math.random() * aliveAIPlayers.length)].name
    }
    return null
  }
} 