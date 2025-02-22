import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('Missing GOOGLE_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export interface ChatContext {
  mood: string;
  location: string;
}

export async function getChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  context: ChatContext
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const chat = model.startChat({
    history: messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
  });

  const contextPrompt = `Current context - Mood: ${context.mood}, Location: ${context.location}. 
Please consider this context while providing creative and constructive responses.`;

  const result = await chat.sendMessage(contextPrompt);
  const response = await result.response;
  
  return response.text();
} 