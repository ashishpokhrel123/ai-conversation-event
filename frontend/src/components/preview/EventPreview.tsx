'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Globe, AlignLeft, Image as ImageIcon, Tag } from 'lucide-react';
import { clsx } from 'clsx';

export const EventPreview = () => {
  const { currentEvent } = useSelector((state: RootState) => state.event);

  if (!currentEvent) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-zinc-500">
        <div className="max-w-xs space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-zinc-700">
            <Tag size={24} className="text-zinc-700" />
          </div>
          <p>Start a conversation to see your event preview here.</p>
        </div>
      </div>
    );
  }

  const completionPercentage = [
    currentEvent.name !== 'Untitled Event',
    !!currentEvent.description,
    !!currentEvent.startDateTime,
    !!currentEvent.endDateTime,
    !!currentEvent.timezone
  ].filter(Boolean).length * 20;

  return (
    <div className="h-full overflow-y-auto bg-zinc-900/20 p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Live Preview</span>
            <span className="text-xs text-zinc-500">{completionPercentage}% complete</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              className="h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl"
        >
          {/* Banner Placeholder */}
          <div className="aspect-[21/9] w-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            {currentEvent.bannerImageUrl ? (
              <img src={currentEvent.bannerImageUrl} alt="Banner" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="text-zinc-700" size={48} />
            )}
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                {currentEvent.name || 'Untitled Event'}
              </h1>
              {currentEvent.subheading && (
                <p className="text-lg text-zinc-400 font-medium">{currentEvent.subheading}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-900">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-zinc-900 p-2 text-zinc-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Date & Time</p>
                    <p className="text-sm text-zinc-200">
                      {currentEvent.startDateTime ? new Date(currentEvent.startDateTime).toLocaleString() : 'Not set'}
                    </p>
                    {currentEvent.endDateTime && (
                      <p className="text-xs text-zinc-400 mt-1">Ends: {new Date(currentEvent.endDateTime).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-zinc-900 p-2 text-zinc-400">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Timezone</p>
                    <p className="text-sm text-zinc-200">{currentEvent.timezone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-zinc-900 p-2 text-zinc-400">
                    <AlignLeft size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Description</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {currentEvent.description || 'No description yet. Add one via chat.'}
                    </p>
                  </div>
                </div>

                {currentEvent.roles && currentEvent.roles.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-lg bg-zinc-900 p-2 text-zinc-400">
                      <Tag size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Roles</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {currentEvent.roles.map((role: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {currentEvent.vanishDate && (
                  <p className="text-[10px] text-zinc-500 italic mt-2">
                    Vanish Date: {new Date(currentEvent.vanishDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-zinc-900">
               <div className="flex items-center gap-2">
                 <div className={clsx(
                   'h-2 w-2 rounded-full',
                   currentEvent.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-zinc-600'
                 )} />
                 <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{currentEvent.status}</span>
               </div>
               <p className="text-[10px] text-zinc-600 italic">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
