'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ContextPanel } from './ContextPanel';
import { saveSession, getSession } from '../lib/kv';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [context, setContext] = useState({
    mood: '',
    location: '',
    time: new Date().toLocaleTimeString(),
    alcoholLevel: '0',
  });

  // セッションの読み込み
  useEffect(() => {
    const loadSession = async () => {
      // URLからセッションIDを取得、なければ新規作成
      const urlParams = new URLSearchParams(window.location.search);
      let sid = urlParams.get('session');
      if (!sid) {
        sid = Date.now().toString();
        urlParams.set('session', sid);
        window.history.replaceState({}, '', `?${urlParams.toString()}`);
      }
      setSessionId(sid);

      try {
        const session = await getSession(sid);
        if (session) {
          setMessages(session.messages);
          setContext(session.context);
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        setError('セッションの読み込みに失敗しました');
      }
    };

    loadSession();
  }, []);

  // 自動保存
  useEffect(() => {
    if (!sessionId || messages.length === 0) return;

    const saveTimer = setTimeout(async () => {
      try {
        await saveSession(sessionId, {
          id: sessionId,
          messages,
          context,
          createdAt: parseInt(sessionId),
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    }, 5000); // 5秒後に保存

    return () => clearTimeout(saveTimer);
  }, [messages, context, sessionId]);

  const handleContextChange = useCallback((newContext: typeof context) => {
    setContext(newContext);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setError(null);
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('APIリクエストに失敗しました');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-12rem)]">
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">エラー: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
      <ContextPanel context={context} onContextChange={handleContextChange} />
    </div>
  );
} 