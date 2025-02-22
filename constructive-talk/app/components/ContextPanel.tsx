'use client';

import { useEffect, useState } from 'react';

interface ContextData {
  mood: string;
  location: string;
  time: string;
  alcoholLevel: string;
  backLinks: string[];
}

interface ContextPanelProps {
  context: ContextData;
  onContextChange: (context: ContextData) => void;
  onClose?: () => void;
  isNewSession?: boolean;
}

const MOOD_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: '普通', label: '普通' },
  { value: '集中', label: '集中' },
  { value: 'リラックス', label: 'リラックス' },
  { value: '疲れ気味', label: '疲れ気味' },
  { value: 'わくわく', label: 'わくわく' },
  { value: '眠い', label: '眠い' },
  { value: 'やる気満々', label: 'やる気満々' },
  { value: '不安', label: '不安' },
  { value: '退屈', label: '退屈' },
];

export function ContextPanel({ context, onContextChange, onClose, isNewSession }: ContextPanelProps) {
  // クライアントサイドでのみ時間を更新
  useEffect(() => {
    // 初回マウント時に時間を設定（現在の時間と異なる場合のみ）
    if (context.time !== new Date().toLocaleTimeString()) {
      onContextChange({
        ...context,
        time: new Date().toLocaleTimeString(),
      });
    }

    const timer = setInterval(() => {
      const newTime = new Date().toLocaleTimeString();
      if (context.time !== newTime) {
        onContextChange({
          ...context,
          time: newTime,
        });
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [context, onContextChange]);

  const [newBackLink, setNewBackLink] = useState('');

  const handleContextChange = (key: keyof ContextData, value: string | string[]) => {
    onContextChange({
      ...context,
      [key]: value,
    });
  };

  const handleAddBackLink = () => {
    if (newBackLink.trim() && !context.backLinks.includes(newBackLink.trim())) {
      handleContextChange('backLinks', [...context.backLinks, newBackLink.trim()]);
      setNewBackLink('');
    }
  };

  const handleRemoveBackLink = (linkToRemove: string) => {
    handleContextChange('backLinks', context.backLinks.filter(link => link !== linkToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddBackLink();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {isNewSession ? '状況を設定' : 'コンテキスト情報'}
        </h2>
        {onClose && !isNewSession && (
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto">
        {isNewSession && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-700 text-sm">
              現在の状況を設定できます。
              設定は後からでも自由に変更可能です。
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            気分
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={context.mood}
            onChange={(e) => handleContextChange('mood', e.target.value)}
          >
            {MOOD_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            場所
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={context.location}
            onChange={(e) => handleContextChange('location', e.target.value)}
            placeholder="例：自宅、カフェ、オフィス..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            時間
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={context.time}
            onChange={(e) => handleContextChange('time', e.target.value)}
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            アルコールレベル
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={context.alcoholLevel}
            onChange={(e) => handleContextChange('alcoholLevel', e.target.value)}
          >
            <option value="0">0 - なし</option>
            <option value="1">1 - 軽い</option>
            <option value="2">2 - 程よい</option>
            <option value="3">3 - かなり</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Back Links
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newBackLink}
                onChange={(e) => setNewBackLink(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="新しいBack Link..."
              />
              <button
                onClick={handleAddBackLink}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(context.backLinks) && context.backLinks.map((link) => (
                <div
                  key={link}
                  className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg"
                >
                  <span className="text-sm">[{link}]</span>
                  <button
                    onClick={() => handleRemoveBackLink(link)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 