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
}

export function ContextPanel({ context, onContextChange }: ContextPanelProps) {
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
    <div className="w-full md:w-80 bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-semibold mb-4">コンテキスト情報</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            気分
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={context.mood}
            onChange={(e) => handleContextChange('mood', e.target.value)}
            placeholder="例：リラックス、集中、疲れ気味..."
          />
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