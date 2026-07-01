'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GlassCard, GlassButton } from '@/components/ui/glass';
import { Input, Label } from '@/components/ui';
import { useAppDispatch } from '@/lib/store/hooks';
import { setAuth } from '@/lib/store/authSlice';
import { useLoginMutation } from '@/lib/store/apiSlice';

/** Branded per-client login entry — reached via the unique portal link. */
export default function PortalLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await login({ email, password }).unwrap();
      dispatch(setAuth(data));
      toast.success(`Welcome, ${data.user.name}`);
      router.push(data.user?.role === 'wholesaler' ? '/portal' : '/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Login failed');
    }
  };

  return (
    <div className="glass-bg flex min-h-[100dvh] items-center justify-center p-5">
      <GlassCard className="w-full max-w-sm p-7">
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-2xl bg-white/70 px-4 py-2.5 shadow-sm backdrop-blur">
            <Image src="/assets/logo.avif" alt="MyMukhwas" width={300} height={68} className="h-9 w-auto object-contain" priority />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-brand-900">Wholesale Portal</h1>
          <p className="text-xs text-slate-500">Sign in to place your bulk orders</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-1 block">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input" required />
          </div>
          <div>
            <Label className="mb-1 block">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input" required />
          </div>
          <GlassButton type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign In'}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
