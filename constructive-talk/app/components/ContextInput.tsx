'use client'

import { useState } from 'react'

export interface Context {
  alcoholLevel: number
  mood: string
  location: string
}

interface ContextInputProps {
  onContextChange: (context: Context) => void
}

const MOOD_OPTIONS = [
  '普通',
  'ワクワク',
  'リラックス',
  '集中',
  '疲れ気味',
  'モヤモヤ',
]

export default function ContextInput({ onContextChange }: ContextInputProps) {
  const [context, setContext] = useState<Context>({
    alcoholLevel: 0,
    mood: '普通',
    location: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const newContext = {
      ...context,
      [name]: name === 'alcoholLevel' ? Number(value) : value,
    }
    setContext(newContext)
    onContextChange(newContext)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          アルコールレベル (0-5)
        </label>
        <input
          type="range"
          name="alcoholLevel"
          min="0"
          max="5"
          value={context.alcoholLevel}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-sm text-gray-500 mt-1">
          現在の値: {context.alcoholLevel}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          気分
        </label>
        <select
          name="mood"
          value={context.mood}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {MOOD_OPTIONS.map((mood) => (
            <option key={mood} value={mood}>
              {mood}
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
          name="location"
          value={context.location}
          onChange={handleChange}
          placeholder="例: 自宅、カフェ、オフィスなど"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  )
} 