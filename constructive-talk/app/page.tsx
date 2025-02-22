import { ChatContainer } from './components/ChatContainer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">ConstructiveTalk</h1>
        <ChatContainer />
      </div>
    </main>
  );
}
