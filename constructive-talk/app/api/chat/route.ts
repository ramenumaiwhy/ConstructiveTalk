import { NextResponse } from 'next/server';
import { getChatResponse } from '@/app/utils/gemini';

export async function POST(request: Request) {
  try {
    const { messages, context } = await request.json();

    const response = await getChatResponse(messages, context);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
} 