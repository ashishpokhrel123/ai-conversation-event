'use client';

import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addMessage, setTyping, setConversationId, setMessages } from '@/store/slices/chatSlice';
import { updateCurrentEvent, setCurrentEvent } from '@/store/slices/eventSlice';
import api from '@/lib/api';
import { MessageBubble } from './MessageBubble';
import { Sparkles, ChevronLeft, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const ChatBox = ({ initialEventId }: { initialEventId?: string }) => {
  const [input, setInput] = useState('');
  const { messages, conversationId, isTyping } = useSelector((state: RootState) => state.chat);
  const { currentEvent } = useSelector((state: RootState) => state.event);
  const dispatch = useDispatch();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const { data } = await api.post('/chat/conversation', { eventId: initialEventId });
        dispatch(setConversationId(data.id));
        if (data.messages && data.messages.length > 0) {
          dispatch(setMessages(data.messages));
        } else {
          dispatch(setMessages([]));
        }

        if (data.event) {
          dispatch(setCurrentEvent(data.event));
        } else {
          dispatch(setCurrentEvent(null));
        }
      } catch (err) {
        console.error('Failed to init chat', err);
      }
    };
    initChat();
  }, [initialEventId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || !conversationId) return;

    setInput('');
    dispatch(addMessage({ role: 'user', content: messageText, timestamp: new Date().toISOString() }));
    dispatch(setTyping(true));

    try {
      const { data } = await api.post('/chat/message', {
        conversationId,
        message: messageText,
      });

      dispatch(addMessage({ role: 'ai', content: data.message, timestamp: new Date().toISOString() }));

      if (data.updates && Object.keys(data.updates).length > 0) {
        dispatch(updateCurrentEvent(data.updates));
      }

      if (data.eventId && !initialEventId) {
        const eventRes = await api.get(`/events/${data.eventId}`);
        dispatch(setCurrentEvent(eventRes.data));
        // Update the URL without reloading the page so refreshes don't lose the chat
        window.history.replaceState(null, '', `/chat?eventId=${data.eventId}`);
      }
    } catch (err) {
      console.error('Chat error', err);
      dispatch(addMessage({ role: 'ai', content: "Sorry, I encountered an error. Please try again.", timestamp: new Date().toISOString() }));
    } finally {
      dispatch(setTyping(false));
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#09090b]">
      {/* Header */}
      <div className="flex items-center gap-4 p-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff8a65]/20 text-[#ff8a65] ring-1 ring-[#ff8a65]/40">
            <Sparkles size={20} fill="currentColor" className="opacity-80" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100 leading-none">
              {currentEvent?.name || 'New conversation'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Convene assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 space-y-2 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-start pt-20 text-center">
            <div className="max-w-md space-y-4">
              <p className="text-xl font-serif text-zinc-100 leading-relaxed">
                Hi! I can turn a few sentences into a polished event. Want to <span className="font-bold">create an event?</span>
              </p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}
        {isTyping && (
          <div className="flex gap-4 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ff8a65]/10 text-[#ff8a65]">
              <Sparkles size={14} fill="currentColor" className="animate-pulse" />
            </div>
            <div className="flex-1 pt-2">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-1.5 w-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-1.5 w-1.5 bg-zinc-700 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 space-y-4">
        <div className="relative flex items-center rounded-full border border-zinc-800 bg-zinc-900/30 p-1.5 transition-all focus-within:border-[#ff8a65]/40 focus-within:ring-4 focus-within:ring-[#ff8a65]/5">
          <input
            type="text"
            placeholder='Try "I want to create an event"...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-all hover:bg-[#ff8a65] hover:text-zinc-950 disabled:opacity-50"
          >
            <ArrowUp size={20} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleSend("I want to create an event")}
            className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/20 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all whitespace-nowrap"
          >
            I want to create an event
          </button>
          <button
            onClick={() => handleSend("Help me organize an event")}
            className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/20 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all whitespace-nowrap"
          >
            Help me organize an event
          </button>
        </div>
      </div>
    </div>
  );
};
