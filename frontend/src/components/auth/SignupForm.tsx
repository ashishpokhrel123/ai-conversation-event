'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Link from 'next/link';

export const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/signup', { name, email, password });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-12">
      <div className="text-left space-y-2">
        <h1 className="text-5xl font-serif text-zinc-100">Create account</h1>
        <p className="text-zinc-500 text-lg">Join the future of event management.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl">{error}</div>}
        
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-14 rounded-2xl bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 focus:ring-0 px-6 text-lg"
          />
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

        <div className="flex items-start gap-3 py-2">
          <input
            type="checkbox"
            id="consent"
            required
            className="mt-1 h-4 w-4 rounded border-zinc-800 bg-zinc-900/50 text-[#ff8a65] focus:ring-[#ff8a65] focus:ring-offset-zinc-950"
          />
          <label htmlFor="consent" className="text-sm text-zinc-500 leading-tight">
            I agree to the <Link href="#" className="text-zinc-300 hover:text-white underline decoration-zinc-700 underline-offset-2">Terms of Service</Link> and acknowledge the <Link href="#" className="text-zinc-300 hover:text-white underline decoration-zinc-700 underline-offset-2">Privacy Policy</Link>, including the collection and use of my data as outlined.
          </label>
        </div>

        <Button 
          variant="coral" 
          className="w-full h-14 rounded-full text-lg shadow-none" 
          isLoading={isLoading}
        >
          Create account
        </Button>

        <p className="text-center text-sm text-zinc-500 pt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-zinc-300 hover:text-white font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};
