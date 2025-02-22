'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Context {
  mood: string;
  location: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<Context>({
    mood: 'neutral',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">ConstructiveTalk</h1>
        
        {/* Context Section */}
        <div className="mb-4 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Context</h2>
          <div className="flex gap-4">
            <select
              value={context.mood}
              onChange={(e) => setContext({ ...context, mood: e.target.value })}
              className="border rounded p-2"
            >
              <option value="neutral">Neutral</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              value={context.location}
              onChange={(e) => setContext({ ...context, location: e.target.value })}
              className="border rounded p-2 flex-1"
            />
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-white rounded shadow mb-4 p-4 h-[400px] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 p-2 rounded ${
                message.role === 'user' ? 'bg-blue-100 ml-auto max-w-[80%]' : 'bg-gray-100 mr-auto max-w-[80%]'
              }`}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="text-center text-gray-500">
              Thinking...
            </div>
          )}
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded p-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
