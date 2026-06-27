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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) router.replace('/login');
    else setReady(true);
  }, [token, router]);

  if (!ready) return <BrandLoader label="Preparing your workspace…" />;

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
