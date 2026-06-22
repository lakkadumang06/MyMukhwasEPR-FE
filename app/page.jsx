'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { selectToken } from '@/lib/store/authSlice';

export default function Home() {
  const router = useRouter();
  const token = useAppSelector(selectToken);
  useEffect(() => {
    router.replace(token ? '/dashboard' : '/login');
  }, [token, router]);
  return null;
}
