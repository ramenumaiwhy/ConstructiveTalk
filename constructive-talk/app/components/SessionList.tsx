import { useState, useEffect } from 'react';
import { ChatSession, listSessions } from '../lib/kv';

interface SessionListProps {
  onSessionSelect: (sessionId: string) => void;
  currentSessionId: string;
}

export function SessionList({ onSessionSelect, currentSessionId }: SessionListProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const sessionList = await listSessions();
        // 日付の新しい順にソート
        sessionList.sort((a, b) => b.updatedAt - a.updatedAt);
        setSessions(sessionList);
      } catch (error) {
        console.error('Failed to load sessions:', error);
        setError('セッション一覧の読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        <p>セッションがありません</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">セッション履歴</h3>
        <button
          onClick={() => onSessionSelect(Date.now().toString())}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          新規セッション
        </button>
      </div>
      <div className="divide-y overflow-y-auto flex-1">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSessionSelect(session.id)}
            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
              session.id === currentSessionId ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium">
                  {new Date(session.createdAt).toLocaleString('ja-JP', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  メッセージ数: {session.messages.length}
                </p>
                {session.context.mood && (
                  <p className="text-sm text-gray-500">
                    気分: {session.context.mood}
                  </p>
                )}
              </div>
              {session.id === currentSessionId && (
                <span className="text-blue-500 text-sm">現在のセッション</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 