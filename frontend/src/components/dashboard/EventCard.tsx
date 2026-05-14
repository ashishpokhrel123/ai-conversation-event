'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Edit2, Trash2, Copy, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

interface EventCardProps {
  event: any;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const EventCard = ({ event, onDelete, onDuplicate }: EventCardProps) => {
  const router = useRouter();

  const statusColors = {
    DRAFT: 'bg-zinc-500/10 text-zinc-400',
    SCHEDULED: 'bg-blue-500/10 text-blue-400',
    PUBLISHED: 'bg-[#ff8a65]/10 text-[#ff8a65]',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col rounded-[24px] border border-zinc-800 bg-zinc-900/20 p-8 transition-all hover:bg-zinc-900/40 hover:border-zinc-700"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${statusColors[event.status as keyof typeof statusColors]}`}>
            {event.status}
          </span>
          <div className="flex items-center gap-1 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={() => onDuplicate(event.id)}>
              <Copy size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400" onClick={() => onDelete(event.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-white leading-tight">
            {event.name}
          </h3>
          <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
            {event.description || 'No description provided yet.'}
          </p>

          {event.roles && typeof event.roles === 'object' && Object.keys(event.roles).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {Object.entries(event.roles).map(([role, name]) => (
                <div key={role} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800/40 border border-zinc-700/30">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#ff8a65]/70">{role}</span>
                  <span className="text-[10px] font-medium text-zinc-300">{name as string}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-zinc-800/50 pt-6">
        <div className="flex items-center gap-4 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          <div className="flex items-center gap-2">
            <Calendar size={12} />
            {event.startDateTime ? new Date(event.startDateTime).toLocaleDateString() : 'TBD'}
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={12} className="shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          className="text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full"
          onClick={() => router.push(`/chat?eventId=${event.id}`)}
        >
          Open Details
        </Button>
      </div>
    </motion.div>
  );
};
