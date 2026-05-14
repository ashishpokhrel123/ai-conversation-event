'use client';

import { EventList } from '@/components/dashboard/EventList';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

import api from '@/lib/api';

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you absolutely sure you want to permanently delete your account and all associated events? This action cannot be undone.')) {
      try {
        await api.delete('/users/me');
        handleLogout();
      } catch (error) {
        console.error('Failed to delete account', error);
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">E</div>
              <span className="text-xl font-bold tracking-tight">EventAI</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700">
                <User size={14} className="text-zinc-400" />
                <span className="text-xs font-medium">{user?.name || 'User'}</span>
              </div>
              <Button variant="ghost" size="sm" className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={handleDeleteAccount}>
                <span className="hidden sm:inline">Delete Account</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleLogout}>
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EventList />
      </main>
    </div>
  );
}
