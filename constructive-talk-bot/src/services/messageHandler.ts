import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function handleMessage(message: string): Promise<string> {
  try {
    // プロンプトの構築
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

    // 応答の生成
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Response Error:', error);
    throw new Error('AIの応答生成に失敗しました');
  }
} 