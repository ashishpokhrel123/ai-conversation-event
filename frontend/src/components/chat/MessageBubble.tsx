'use client';

import { motion } from 'framer-motion';
import { Bot, Sparkles, User } from 'lucide-react';
import { clsx } from 'clsx';

interface MessageBubbleProps {
  role: 'user' | 'ai';
  content: string;
}

export const MessageBubble = ({ role, content }: MessageBubbleProps) => {
  const isAI = role === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'flex w-full gap-4 py-6 px-4 rounded-2xl transition-colors',
        isAI ? 'bg-zinc-900/20' : 'bg-transparent'
      )}
    >
      <div className={clsx(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
        isAI ? 'border-[#ff8a65]/30 bg-[#ff8a65]/10 text-[#ff8a65]' : 'border-zinc-800 bg-zinc-900 text-zinc-400'
      )}>
        {isAI ? <Sparkles size={16} fill="currentColor" /> : <User size={16} />}
      </div>

      <div className="flex-1 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
          {isAI ? 'Convene Assistant' : 'You'}
        </p>
        <div className="text-[15px] leading-relaxed text-zinc-200 whitespace-pre-wrap font-serif">
          {content}
        </div>
      </div>
    </motion.div>
  );
};
