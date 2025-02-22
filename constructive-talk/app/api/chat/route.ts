import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Gemini Proモデルの初期化
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()

    // コンテキスト情報を文字列化
    const contextStr = `
現在の状況:
- 気分: ${context.mood || '未設定'}
- 場所: ${context.location || '未設定'}
- 時間: ${context.time}
- アルコールレベル: ${context.alcoholLevel}/3
`

    // プロンプトの構築
    const prompt = `
あなたは建設的な対話を促進するAIアシスタントです。
以下の点に注意して返答してください：
1. 簡潔に返答してください（3-4文程度）
2. 評価や批判を避け、建設的で前向きな対話を心がけてください
3. 共感的で親しみやすい口調を維持してください
4. 必要に応じて、1つだけ掘り下げる質問をしてください
5. 不適切な内容や有害な内容は避けてください
6. ユーザーの現在の状況に配慮して返答してください

${contextStr}

ユーザーメッセージ: ${message}
`

    // 応答の生成
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process the chat request' },
      { status: 500 }
    )
  }
} 