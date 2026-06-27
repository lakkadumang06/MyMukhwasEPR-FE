'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { NAV } from '@/lib/nav';
import { useAppSelector } from '@/lib/store/hooks';
import { selectRole } from '@/lib/store/authSlice';
import { can } from '@/lib/rbac';

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const role = useAppSelector(selectRole);

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center justify-center rounded-xl bg-white px-3 py-2.5 shadow-sm">
          <Image src="/assets/logo.avif" alt="MyMukhwas" width={300} height={68} className="h-8 w-auto object-contain" priority />
        </div>
        <button 
          onClick={onClose}
          className="rounded-lg p-1 text-white hover:bg-white/20 md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-6">
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
                  <Link key={it.href} href={it.href} onClick={onClose}>
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
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-brand-700 text-white transition-transform duration-300 ease-in-out md:static md:w-60 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
