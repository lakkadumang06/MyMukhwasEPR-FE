'use client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { AlertsBell } from './AlertsBell';
import { useAuthStore } from '@/lib/auth-store';

export function Topbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="text-sm text-slate-400">Welcome back 👋</div>
      <div className="flex items-center gap-3">
        <AlertsBell />
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">{user?.name}</p>
          <p className="text-[11px] capitalize text-slate-400">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
