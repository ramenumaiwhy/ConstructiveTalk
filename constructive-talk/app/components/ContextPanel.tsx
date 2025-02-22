'use client';

import { useEffect } from 'react';

interface ContextData {
  mood: string;
  location: string;
  time: string;
  alcoholLevel: string;
}

interface ContextPanelProps {
  context: ContextData;
  onContextChange: (context: ContextData) => void;
  onClose?: () => void;
}

const MOOD_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: '集中', label: '集中' },
  { value: 'リラックス', label: 'リラックス' },
  { value: '疲れ気味', label: '疲れ気味' },
  { value: 'わくわく', label: 'わくわく' },
  { value: '眠い', label: '眠い' },
  { value: 'やる気満々', label: 'やる気満々' },
  { value: '不安', label: '不安' },
  { value: '退屈', label: '退屈' },
];

export function ContextPanel({ context, onContextChange, onClose }: ContextPanelProps) {
  // 1分ごとに時間を更新
  useEffect(() => {
    const timer = setInterval(() => {
      onContextChange({
        ...context,
        time: new Date().toLocaleTimeString(),
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [context, onContextChange]);

  const handleContextChange = (key: keyof ContextData, value: string) => {
    onContextChange({
      ...context,
      [key]: value,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">コンテキスト情報</h2>
        {onClose && (
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
      </div>
    </div>
  );
} 