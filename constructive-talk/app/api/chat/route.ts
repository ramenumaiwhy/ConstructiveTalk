import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import type { Context } from '@/app/components/ContextInput'

// 環境変数からAPIキーを取得
const apiKey = process.env.GOOGLE_AI_API_KEY

// Gemini Proモデルの初期化
const genAI = new GoogleGenerativeAI(apiKey!)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

interface ChatRequest {
  message: string
  context: Context
  history: { role: 'user' | 'assistant'; content: string }[]
}

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json()
    const { message, context, history } = body

    // コンテキスト情報を文字列化
    const contextStr = `
現在の状況:
- アルコールレベル: ${context.alcoholLevel}/5
- 気分: ${context.mood}
- 場所: ${context.location}
`

    // チャット履歴を構築（assistantをmodelに変換）
    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 400,
      },
    })

    // プロンプトの構築
    const prompt = `${contextStr}

ユーザーメッセージ: ${message}

以下の点に注意して返答してください：
1. 簡潔に返答してください（3-4文程度）
2. ユーザーの現在の状況を考慮しつつ、押しつけがましくならないように気をつけてください
3. 評価や批判を避け、建設的で前向きな対話を心がけてください
4. 共感的で親しみやすい口調を維持してください
5. 必要に応じて、1つだけ掘り下げる質問をしてください
6. 不適切な内容や有害な内容は避けてください`

    try {
      // レスポンスの生成
      const result = await chat.sendMessage(prompt)
      const response = result.response.text()
      return NextResponse.json({ response })
    } catch (error: any) {
      console.error('Chat Generation Error:', error)
      if (error.message?.includes('SAFETY')) {
        return NextResponse.json(
          {
            response: '申し訳ありません。安全性の観点から、その内容には回答できません。別の話題で続けましょう。'
          },
          { status: 200 }
        )
      }
      return NextResponse.json(
        { error: 'Chat generation failed', details: error.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 