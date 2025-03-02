export interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sentiment?: string;
}

export interface CustomData {
  recentTopics: string[];
  interactionCount: number;
  aiAnalysis: {
    userConcerns: string[];
    recommendedTopics: string[];
  };
}

export interface Context {
  lastMessage: string;
  timestamp: Date;
  alcoholLevel: number;
  mood: string;
  topic: string;
  messages: Message[];
  customData: CustomData;
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  context: Context;
  expiresAt: Date;
}

export interface SessionMetadata {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  context: Context;
} 