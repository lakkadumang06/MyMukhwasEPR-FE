'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.avif';
import { toast } from 'sonner';
import { Button, Card, Input, Label } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('admin@mymukhwas.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password }).then((r) => r);
      setAuth(data);
      toast.success(`Welcome, ${data.user.name}`);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-700 to-brand-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 text-center text-white">
          <Image
            src={logo}
            alt="MyMukhwas"
            width={56}
            height={56}
            className="mx-auto mb-3 h-14 w-14 rounded-2xl object-cover"
            priority
          />
          <h1 className="text-2xl font-semibold">MyMukhwas ERP</h1>
          <p className="text-sm text-brand-100">Sign in to your account</p>
        </div>
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="mb-1 block">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <Label className="mb-1 block">Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-400">
            Default: admin@mymukhwas.com / Admin@123
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
