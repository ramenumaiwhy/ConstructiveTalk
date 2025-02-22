'use client'

import { useState, Suspense } from 'react'
import ContextInput, { Context } from './ContextInput'
import ChatInterface from './ChatInterface'

function MainContent() {
  const [context, setContext] = useState<Context>({
    alcoholLevel: 0,
    mood: '普通',
    location: '',
  })

  const handleContextChange = (newContext: Context) => {
    setContext(newContext)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ConstructiveTalk
          </h1>
          <p className="text-xl text-gray-600">
            創造的な対話を、あなたのペースで
          </p>
        </header>

        {/* コンテキスト入力セクション */}
        <section className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            コンテキストを設定
          </h2>
          <ContextInput onContextChange={handleContextChange} />
        </section>

        {/* チャットセクション */}
        <section className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            AIとの対話
          </h2>
          <ChatInterface context={context} />
        </section>
      </div>
    </main>
  )
}

export default function ClientPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">読み込み中...</div>
          </div>
        </div>
      }
    >
      <MainContent />
    </Suspense>
  )
} 