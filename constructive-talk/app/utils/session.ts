export interface Session {
  id: string;
  messages: Message[];
  context: {
    mood: string;
    location: string;
    time: string;
    alcoholLevel: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export async function saveSession(sessionId: string, messages: Message[], context: Session['context']) {
  try {
    const session: Session = {
      id: sessionId,
      messages,
      context,
      createdAt: parseInt(sessionId),
      updatedAt: Date.now(),
    };
    
    const sessions = await getSessions();
    sessions[sessionId] = session;
    localStorage.setItem('sessions', JSON.stringify(sessions));
    return session;
  } catch (error) {
    console.error('Failed to save session:', error);
    throw error;
  }
}

export async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const sessions = await getSessions();
    return sessions[sessionId] || null;
  } catch (error) {
    console.error('Failed to get session:', error);
    throw error;
  }
}

export async function getSessions(): Promise<Record<string, Session>> {
  try {
    const sessionsJson = localStorage.getItem('sessions');
    return sessionsJson ? JSON.parse(sessionsJson) : {};
  } catch (error) {
    console.error('Failed to get sessions:', error);
    throw error;
  }
} 