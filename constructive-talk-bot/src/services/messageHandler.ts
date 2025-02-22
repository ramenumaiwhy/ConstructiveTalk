import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { Client } from '@line/bot-sdk';
import { lineConfig } from '../config/line';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const lineClient = new Client(lineConfig);

export async function handleMessage(message: string, replyToken: string): Promise<void> {
  try {
    // まとめコマンドの検出
    if (message.includes('まとめて') || message.includes('md出力')) {
      await handleSummaryRequest(message, replyToken);
      return;
    }

    // 通常の対話処理
    const response = await generateResponse(message);
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: response
    });
  } catch (error) {
    console.error('Message Handler Error:', error);
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: 'すみません、エラーが発生しました。'
    });
  }
}

async function generateResponse(message: string): Promise<string> {
  const prompt = `
あなたは建設的な対話を促進するAIアシスタントです。
以下の点に注意して返答してください：
1. 簡潔に返答してください（3-4文程度）
2. 評価や批判を避け、建設的で前向きな対話を心がけてください
3. 共感的で親しみやすい口調を維持してください
4. 必要に応じて、1つだけ掘り下げる質問をしてください
5. 不適切な内容や有害な内容は避けてください

ユーザーメッセージ: ${message}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function handleSummaryRequest(message: string, replyToken: string): Promise<void> {
  try {
    // Markdownファイルの生成
    const markdown = await generateMarkdown(message);
    
    // ファイルをLINEに送信
    await lineClient.replyMessage(replyToken, [
      {
        type: 'text',
        text: 'まとめのMarkdownファイルを生成しました。'
      },
      {
        type: 'flex',
        altText: 'まとめのダウンロード',
        contents: {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'まとめをダウンロード',
                weight: 'bold',
                size: 'lg'
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                style: 'primary',
                action: {
                  type: 'uri',
                  label: 'ダウンロード',
                  uri: `data:text/markdown;base64,${Buffer.from(markdown).toString('base64')}`
                }
              }
            ]
          }
        }
      }
    ]);
  } catch (error) {
    console.error('Summary Generation Error:', error);
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: 'まとめの生成中にエラーが発生しました。'
    });
  }
}

async function generateMarkdown(message: string): Promise<string> {
  const prompt = `
以下の会話内容をMarkdown形式でまとめてください：
1. 重要なポイントを箇条書きで整理
2. 結論や次のアクションを明確に
3. 必要に応じて見出しを使用して構造化
4. コードブロックやリンクなどのMarkdown記法を適切に使用

会話内容: ${message}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
} 