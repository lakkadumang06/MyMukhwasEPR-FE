'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BrandLoader } from '@/components/common/Loader';
import { useAppSelector } from '@/lib/store/hooks';
import { selectToken } from '@/lib/store/authSlice';

export default function AppLayout({ children }) {
  const router = useRouter();
  const token = useAppSelector(selectToken);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) router.replace('/login');
    else setReady(true);
  }, [token, router]);

  if (!ready) return <BrandLoader label="Preparing your workspace…" />;

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
