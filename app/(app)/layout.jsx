'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuthStore } from '@/lib/auth-store';

export default function AppLayout({ children }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) router.replace('/login');
    else setReady(true);
  }, [token, router]);

  if (!ready) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
