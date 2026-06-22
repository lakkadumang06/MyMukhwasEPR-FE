'use client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { AlertsBell } from './AlertsBell';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout as logoutAction, selectUser } from '@/lib/store/authSlice';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function initials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'U'
  );
}

export function Topbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const handleLogout = () => {
    dispatch(logoutAction());
    router.push('/login');
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
        </p>
        <p className="text-xs text-slate-400">{today}</p>
      </div>

      <div className="flex items-center gap-2">
        <AlertsBell />
        <div className="mx-1 h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {initials(user?.name)}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-slate-700">{user?.name}</p>
            <p className="text-[11px] capitalize text-slate-400">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="ml-1 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
