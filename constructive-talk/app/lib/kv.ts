import { Message } from '../components/ChatContainer';

export interface ChatSession {
  id: string;
  messages: Message[];
  context: {
    mood: string;
    location: string;
    time: string;
    alcoholLevel: string;
    backLinks: string[];
  };
  createdAt: number;
  updatedAt: number;
}

// ローカルストレージのキープレフィックス
const STORAGE_PREFIX = 'chat:';

export async function saveSession(sessionId: string, session: ChatSession) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${sessionId}`, JSON.stringify(session));
    localStorage.setItem(`${STORAGE_PREFIX}${sessionId}:lastSaved`, Date.now().toString());
  } catch (error) {
    console.error('Failed to save session to localStorage:', error);
  }
}

export async function getSession(sessionId: string): Promise<ChatSession | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem(`${STORAGE_PREFIX}${sessionId}`);
    if (!sessionData) return null;
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Failed to get session from localStorage:', error);
    return null;
  }
}

export async function listSessions(limit = 10): Promise<ChatSession[]> {
  if (typeof window === 'undefined') return [];
  
  try {
    const sessions: ChatSession[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX) && !key.endsWith(':lastSaved')) {
        const sessionData = localStorage.getItem(key);
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData);
            sessions.push(session);
          } catch (e) {
            console.error('Failed to parse session data:', e);
          }
        }
      }
    }
    return sessions.slice(0, limit);
  } catch (error) {
    console.error('Failed to list sessions from localStorage:', error);
    return [];
  }
}

export async function deleteSession(sessionId: string) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${sessionId}`);
    localStorage.removeItem(`${STORAGE_PREFIX}${sessionId}:lastSaved`);
    return true;
  } catch (error) {
    console.error('Failed to delete session from localStorage:', error);
    return false;
  }
} 