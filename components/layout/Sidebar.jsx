'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { NAV } from '@/lib/nav';
import { useAuthStore } from '@/lib/auth-store';
import { can } from '@/lib/rbac';
import logo from '@/assets/logo.avif';

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-brand-700 text-white">
      <div className="flex items-center gap-2 px-5 py-4">
        <Image src={logo} alt="MyMukhwas" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" priority />
        <div>
          <p className="font-semibold leading-tight">MyMukhwas</p>
          <p className="text-[11px] text-brand-100">ERP System</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {NAV.map((section) => {
          const items = section.items.filter((it) => can(role, it.roles));
          if (items.length === 0) return null;
          return (
            <div key={section.group} className="mb-4">
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-brand-100/70">
                {section.group}
              </p>
              {items.map((it) => {
                const active = pathname === it.href;
                const Icon = it.icon;
                return (
                  <Link key={it.href} href={it.href}>
                    <motion.div
                      whileHover={{ x: 3 }}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                        active ? 'bg-white/15 font-medium' : 'text-brand-50 hover:bg-white/10',
                      )}
                    >
                      <Icon size={16} />
                      {it.label}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
