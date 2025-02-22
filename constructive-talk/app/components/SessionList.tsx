import { useState, useEffect } from 'react';
import { ChatSession, listSessions, deleteSession } from '../lib/kv';

interface SessionListProps {
  onSessionSelect: (sessionId: string) => void;
  currentSessionId: string;
}

export function SessionList({ onSessionSelect, currentSessionId }: SessionListProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      const sessionList = await listSessions();
      sessionList.sort((a, b) => b.updatedAt - a.updatedAt);
      setSessions(sessionList);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setError('セッション一覧の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm('このセッションを削除してもよろしいですか？')) {
      return;
    }

    try {
      await deleteSession(sessionId);
      await loadSessions();
      if (sessionId === currentSessionId) {
        onSessionSelect(Date.now().toString());
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      setError('セッションの削除に失敗しました');
    }
  };

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
          <div
            key={session.id}
            className={`w-full px-4 py-3 hover:bg-gray-50 transition-colors ${
              session.id === currentSessionId ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div 
                className="flex-1 cursor-pointer" 
                onClick={() => onSessionSelect(session.id)}
              >
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
              <div className="flex items-center gap-2">
                {session.id === currentSessionId && (
                  <span className="text-blue-500 text-sm">現在のセッション</span>
                )}
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="text-gray-400 hover:text-red-500 p-1"
                  title="セッションを削除"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 