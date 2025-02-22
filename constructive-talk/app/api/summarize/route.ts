import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { Message } from '@/app/components/ChatContainer'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

interface SummarizeRequest {
  messages: Message[]
  context: {
    mood: string
    location: string
    time: string
    alcoholLevel: string
  }
}

export async function POST(request: Request) {
  try {
    const { messages, context }: SummarizeRequest = await request.json()

    const prompt = `
あなたは対話記録をまとめるアシスタントです。以下の対話記録を分析し、Markdown形式でまとめてください。

# コンテキスト情報
- 気分: ${context.mood || '未設定'}
- 場所: ${context.location || '未設定'}
- 時間: ${context.time}
- アルコールレベル: ${context.alcoholLevel}/3

# 対話内容
${messages.map(msg => `${msg.role === 'user' ? '👤' : '🤖'}: ${msg.content}`).join('\n')}

以下の形式でまとめてください：

1. 対話の概要（100-150文字）
2. 主要なポイント（箇条書き）
3. 興味深い発見や気づき
4. 今後の展開や提案

注意点：
- 客観的な分析を心がけてください
- 具体的な例を含めてください
- 建設的な視点を維持してください
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text()

    // Markdownファイルの生成
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `chat-summary-${timestamp}.md`
    const markdown = `# チャット記録まとめ
作成日時: ${new Date().toLocaleString('ja-JP')}

${summary}

## 元の対話コンテキスト
- 気分: ${context.mood || '未設定'}
- 場所: ${context.location || '未設定'}
- 時間: ${context.time}
- アルコールレベル: ${context.alcoholLevel}/3

## 完全な対話記録
${messages.map(msg => `### ${msg.role === 'user' ? 'ユーザー' : 'アシスタント'} (${new Date(msg.timestamp).toLocaleTimeString('ja-JP')})
${msg.content}
`).join('\n')}
`

    return NextResponse.json({ summary, markdown, filename })
  } catch (error) {
    console.error('Summarize API Error:', error)
    return NextResponse.json(
      { error: 'Failed to summarize the chat' },
      { status: 500 }
    )
  }
} 