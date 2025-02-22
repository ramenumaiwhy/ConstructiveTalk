'use client';

import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enterで送信
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    // 通常のEnterキーは改行を許可
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      return;
    }
  };

  return (
    <div className="border-t p-4 bg-white">
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col">
          <textarea
            className="flex-1 resize-none rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="メッセージを入力... (Ctrl/Cmd + Enterで送信)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enterキー: 改行 / Ctrl/Cmd + Enter: 送信
          </p>
        </div>
        <button
          className={`px-6 py-2 rounded-lg font-medium h-fit ${
            isLoading || !message.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          onClick={handleSubmit}
          disabled={isLoading || !message.trim()}
        >
          送信
        </button>
      </div>
    </div>
  );
} 