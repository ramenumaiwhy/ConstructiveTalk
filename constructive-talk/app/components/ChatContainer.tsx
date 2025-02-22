'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ContextPanel } from './ContextPanel';
import { SessionList } from './SessionList';
import { saveSession, getSession } from '../lib/kv';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function ChatContainer() {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  const [context, setContext] = useState({
    mood: '',
    location: '',
    time: new Date().toLocaleTimeString(),
    alcoholLevel: '0',
  });
  const [isSessionListOpen, setIsSessionListOpen] = useState(false);

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

  const handleSummarize = async () => {
    if (messages.length === 0) return;
    setIsSummarizing(true);
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('まとめの生成に失敗しました');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Markdownファイルのダウンロード
      const blob = new Blob([data.markdown], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error summarizing chat:', error);
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsSummarizing(false);
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // メッセージが追加されたときに自動スクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSessionSelect = useCallback(async (selectedSessionId: string) => {
    try {
      const session = await getSession(selectedSessionId);
      if (session) {
        // 既存のセッションの場合
        setMessages(session.messages);
        setContext(session.context);
      } else {
        // 新規セッションの場合
        setMessages([]);
        setContext({
          mood: '',
          location: '',
          time: new Date().toLocaleTimeString(),
          alcoholLevel: '0',
        });
      }
      setSessionId(selectedSessionId);
      
      // URLを更新
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('session', selectedSessionId);
      window.history.pushState({}, '', `?${urlParams.toString()}`);
      
      // セッションリストを閉じる（モバイル）
      setIsSessionListOpen(false);
    } catch (error) {
      console.error('Failed to load session:', error);
      setError('セッションの読み込みに失敗しました');
    }
  }, []);

  return (
    <div className="relative flex flex-col h-[calc(100vh-12rem)]">
      {/* モバイル用セッションリストトグルボタン */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-full shadow-lg"
        onClick={() => setIsSessionListOpen(!isSessionListOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* モバイル用コンテキストパネルトグルボタン */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-blue-500 text-white p-2 rounded-full shadow-lg"
        onClick={() => setIsContextPanelOpen(!isContextPanelOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      {/* セッションリスト */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSessionListOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:shadow-none md:mr-4`}
      >
        <SessionList
          onSessionSelect={handleSessionSelect}
          currentSessionId={sessionId}
        />
      </div>

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
        {/* ヘッダー */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">チャット</h2>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${
              messages.length === 0 || isSummarizing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            onClick={handleSummarize}
            disabled={messages.length === 0 || isSummarizing}
          >
            {isSummarizing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                まとめを作成中...
              </span>
            ) : (
              'まとめをダウンロード'
            )}
          </button>
        </div>

        {/* メッセージエリア */}
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
          <div ref={messageEndRef} />
        </div>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* コンテキストパネル */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isContextPanelOpen ? 'translate-x-0' : 'translate-x-full'
        } md:relative md:translate-x-0 md:shadow-none md:ml-4`}
      >
        <ContextPanel
          context={context}
          onContextChange={handleContextChange}
          onClose={() => setIsContextPanelOpen(false)}
        />
      </div>
    </div>
  );
} 