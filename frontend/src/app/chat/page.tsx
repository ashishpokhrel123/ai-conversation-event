'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { ChatBox } from '@/components/chat/ChatBox';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') || undefined;
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col bg-zinc-950 overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-6 bg-zinc-900/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ChevronLeft size={18} />
            Back to Dashboard
          </Button>
          <div className="h-4 w-px bg-zinc-800" />
          <h1 className="text-sm font-semibold text-zinc-100">Conversational Event Creation</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 h-full">
          <ChatBox initialEventId={eventId} />
        </main>
      </div>
    </div>
  );
}
