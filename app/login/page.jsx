'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button, Input, Label } from '@/components/ui';
import { useAppDispatch } from '@/lib/store/hooks';
import { setAuth } from '@/lib/store/authSlice';
import { useLoginMutation } from '@/lib/store/apiSlice';

const FEATURES = [
  'Inventory, sales & purchase in one place',
  'Real-time dashboards and reports',
  'Role-based access for your whole team',
];

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading: loading }] = useLoginMutation();
  const [email, setEmail] = useState('admin@mymukhwas.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await login({ email, password }).unwrap();
      dispatch(setAuth(data));
      toast.success(`Welcome, ${data.user.name}`);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Login failed');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* decorative glows */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />

        <div className="relative">
          <div className="inline-flex rounded-2xl bg-white px-5 py-3 shadow-lg shadow-black/10">
            <Image
              src="/assets/logo.avif"
              alt="MyMukhwas"
              width={300}
              height={68}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative text-white"
        >
          <h2 className="text-3xl font-semibold leading-snug">
            Run your business,
            <br />
            the modern way.
          </h2>
          <p className="mt-3 max-w-md text-sm text-brand-100">
            Pure, Traditional &amp; Fresh — the MyMukhwas ERP keeps your operations
            organized from purchase to sale.
          </p>
          <ul className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-brand-50">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <CheckIcon className="h-3 w-3 text-white" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-xs text-brand-100/70">
          © {new Date().getFullYear()} MyMukhwas. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Logo for small screens */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Image
              src="/assets/logo.avif"
              alt="MyMukhwas"
              width={300}
              height={68}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to continue to your dashboard.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Password</Label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-sm" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
            Demo: <span className="font-medium text-slate-700">admin@mymukhwas.com</span> /{' '}
            <span className="font-medium text-slate-700">Admin@123</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ---- inline icons ---- */
function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}
function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.12 9.12 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
