'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setEvents } from '@/store/slices/eventSlice';
import api from '@/lib/api';
import { EventCard } from './EventCard';
import { Button } from '../ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const EventList = () => {
  const { events } = useSelector((state: RootState) => state.event);
  const { user } = useSelector((state: RootState) => state.auth);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const dispatch = useDispatch();
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      dispatch(setEvents(data.data || data));
    } catch (err) {
      console.error('Failed to fetch events, using mock data', err);
      // Fallback to empty or mock data for testing UI
      dispatch(setEvents([]));
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await api.delete(`/events/${id}`);
      fetchEvents();
    }
  };

  const handleDuplicate = async (id: string) => {
    await api.post(`/events/${id}/duplicate`);
    fetchEvents();
  };

  const filteredEvents = events.filter(event => {
    return statusFilter === 'ALL' || event.status === statusFilter;
  });

  const getCount = (status: string) => {
    if (status === 'ALL') return events.length;
    return events.filter(e => e.status === status).length;
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-zinc-500">Good evening, {user?.name || 'test'}</p>
          <h1 className="text-6xl font-serif text-zinc-100 tracking-tight">
            What are we hosting today?
          </h1>
        </div>
        <Button
          variant="coral"
          size="lg"
          className="rounded-full px-8 gap-2 h-12 text-zinc-950 font-bold"
          onClick={() => router.push('/chat')}
        >
          <Plus size={20} />
          New event
        </Button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['ALL', 'DRAFT', 'SCHEDULED', 'PUBLISHED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${statusFilter === status
              ? 'bg-zinc-800 text-zinc-100'
              : 'bg-transparent text-zinc-500 hover:text-zinc-300'
              }`}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
            <span className={`text-[10px] ${statusFilter === status ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {getCount(status)}
            </span>
          </button>
        ))}
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-zinc-800 bg-zinc-900/10 p-24 text-center">
          <div className="mb-6 rounded-full bg-zinc-900/50 p-6 ring-1 ring-zinc-800">
            <Plus className="text-[#ff8a65] rotate-45" size={32} />
          </div>
          <h2 className="text-3xl font-serif text-white mb-2">No events yet</h2>
          <p className="text-zinc-500 max-w-sm mb-8 leading-relaxed">
            Start a conversation and Convene will turn it into a real event in seconds.
          </p>
          <Button
            variant="coral"
            size="lg"
            className="rounded-full px-8 h-14 font-bold text-zinc-950"
            onClick={() => router.push('/chat')}
          >
            <Plus size={20} className="mr-2" />
            Create your first event
          </Button>
        </div>
      )}
    </div>
  );
};
