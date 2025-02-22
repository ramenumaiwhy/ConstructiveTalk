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
  const [isNewSession, setIsNewSession] = useState(false);
  const [context, setContext] = useState<{
    mood: string;
    location: string;
    time: string;
    alcoholLevel: string;
    backLinks: string[];
  }>({
    mood: '',
    location: '',
    time: '',
    alcoholLevel: '0',
    backLinks: [],
  });
  const [isSessionListOpen, setIsSessionListOpen] = useState(false);

  // セッションの読み込み
  useEffect(() => {
    const loadSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      let sid = urlParams.get('session');
      if (!sid) {
        sid = Date.now().toString();
        urlParams.set('session', sid);
        window.history.replaceState({}, '', `?${urlParams.toString()}`);
        setIsNewSession(true);
        setIsContextPanelOpen(true);
      }
      setSessionId(sid);

      try {
        const session = await getSession(sid);
        if (session) {
          setMessages(session.messages);
          setContext({
            ...session.context,
            backLinks: session.context.backLinks || [],
          });
          setIsNewSession(false);
        } else {
          // 新規セッションの場合は空の配列で初期化
          setContext(prev => ({
            ...prev,
            backLinks: [],
          }));
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        setError('セッションの読み込みに失敗しました');
      }
    };

    if (typeof window !== 'undefined') {
      loadSession();
    }
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
    setIsNewSession(false);
    // 自動保存
    const session = {
      id: sessionId,
      messages,
      context: newContext,
      createdAt: parseInt(sessionId),
      updatedAt: Date.now(),
    };
    saveSession(sessionId, session).catch(console.error);
  }, [sessionId, messages]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const messageId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, context }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const assistantMessageId = `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
      };

      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        // メッセージとコンテキストを保存
        const session = {
          id: sessionId,
          messages: newMessages,
          context,
          createdAt: parseInt(sessionId),
          updatedAt: Date.now(),
        };
        saveSession(sessionId, session).catch(console.error);
        return newMessages;
      });
    } catch (error) {
      console.error('Chat API Error:', error);
      setError('メッセージの送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, context]);

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
        setIsNewSession(false);
      } else {
        // 新規セッションの場合
        setMessages([]);
        setContext({
          mood: '',
          location: '',
          time: '',
          alcoholLevel: '0',
          backLinks: [],
        });
        setIsNewSession(true);
        setIsContextPanelOpen(true);
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
    <div className="relative flex flex-col md:flex-row h-[calc(100vh-12rem)] gap-6">
      {/* セッションリスト */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSessionListOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:w-80 md:min-w-[20rem] md:shadow-none md:bg-transparent z-50`}
      >
        <div className="h-full bg-white rounded-lg shadow-lg">
          <SessionList
            onSessionSelect={handleSessionSelect}
            currentSessionId={sessionId}
          />
        </div>
      </div>

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden min-w-0">
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
          {isNewSession ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-blue-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-2">新しいセッションを開始</h3>
              <p className="text-gray-600 mb-4">
                右側のパネルで現在の状況を設定できます。
                設定は後からでも変更可能です。
              </p>
              <div className="space-x-4">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={() => setIsContextPanelOpen(true)}
                >
                  状況を設定する
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  onClick={() => setIsNewSession(false)}
                >
                  スキップ
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={`${message.id}-${message.timestamp}`} message={message} />
              ))}
            </>
          )}
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
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
          disabled={false}
          placeholder={isNewSession ? "状況を設定せずにチャットを開始できます" : "メッセージを入力... (Ctrl/Cmd + Enterで送信)"}
        />
      </div>

      {/* コンテキストパネル */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isContextPanelOpen ? 'translate-x-0' : 'translate-x-full'
        } md:relative md:translate-x-0 md:w-80 md:min-w-[20rem] md:shadow-none md:bg-transparent z-50`}
      >
        <div className="h-full bg-white rounded-lg shadow-lg">
          <ContextPanel
            context={context}
            onContextChange={handleContextChange}
            onClose={() => setIsContextPanelOpen(false)}
            isNewSession={isNewSession}
          />
        </div>
      </div>

      {/* モバイル用トグルボタン */}
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
    </div>
  );
} 