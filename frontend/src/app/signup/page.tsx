import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
      <SignupForm />
    </main>
  );
}
