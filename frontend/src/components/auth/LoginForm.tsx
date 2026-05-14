'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setCredentials } from '@/store/slices/authSlice';
import api from '@/lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Link from 'next/link';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
      dispatch(setCredentials({ user: data.user, token: data.access_token }));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-12">
      <div className="text-left space-y-2">
        <h1 className="text-5xl font-serif text-zinc-100">Welcome back</h1>
        <p className="text-zinc-500 text-lg">Sign in to continue your conversations.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl">{error}</div>}
        
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-14 rounded-2xl bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 focus:ring-0 px-6 text-lg"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-14 rounded-2xl bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 focus:ring-0 px-6 text-lg"
          />
        </div>

        <Button 
          variant="coral" 
          className="w-full h-14 rounded-full text-lg shadow-none" 
          isLoading={isLoading}
        >
          Sign in
        </Button>

        <p className="text-center text-sm text-zinc-500 pt-4">
          New here?{' '}
          <Link href="/signup" className="text-zinc-300 hover:text-white font-medium transition-colors">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};
