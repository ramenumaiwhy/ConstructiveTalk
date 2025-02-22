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

    // ファイル名生成用のプロンプト
    const fileNamePrompt = `
以下の会話内容から、この対話の本質を端的に表すファイル名を生成してください。
ファイル名は日本語で、30文字以内にしてください。
拡張子は含めないでください。

# 対話内容
${messages.map(msg => `${msg.role === 'user' ? '👤' : '🤖'}: ${msg.content}`).join('\n')}
`

    // ファイル名の生成
    const fileNameResult = await model.generateContent(fileNamePrompt)
    const fileNameResponse = await fileNameResult.response
    const fileName = fileNameResponse.text().trim()

    // 要約生成用のプロンプト
    const summaryPrompt = `
あなたは対話記録をまとめるアシスタントです。以下の対話記録を分析し、Markdown形式でまとめてください。

[businessideas]

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

    const result = await model.generateContent(summaryPrompt)
    const response = await result.response
    const summary = response.text()

    // Markdownファイルの生成
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const markdown = `# ${fileName}
作成日時: ${new Date().toLocaleString('ja-JP')}

[businessideas]

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

    return NextResponse.json({ 
      summary, 
      markdown, 
      filename: `${fileName}_${timestamp}.md` 
    })
  } catch (error) {
    console.error('Summarize API Error:', error)
    return NextResponse.json(
      { error: 'Failed to summarize the chat' },
      { status: 500 }
    )
  }
} 