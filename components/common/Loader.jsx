'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Full-screen branded loader — shown on initial app load and as a
 * Suspense fallback during route transitions.
 */
export function BrandLoader({ label = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-white to-slate-50">
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* spinning gradient ring */}
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" />
        {/* pulsing glow */}
        <span className="absolute inset-2 animate-ping rounded-full bg-brand-500/10" />
        {/* favicon badge */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md"
        >
          <Image src="/favicon.webp" alt="MyMukhwas" width={36} height={36} className="h-9 w-9 object-contain" priority />
        </motion.div>
      </div>

      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-brand-600"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-slate-400">{label}</p>
    </div>
  );
}

/**
 * Slim top progress bar that animates on every route/tab change.
 * Starts on internal link clicks, completes when the pathname settles.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  // start the bar when an internal link is clicked
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        a.target === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey
      )
        return;
      if (href !== pathname) setLoading(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [pathname]);

  // complete the bar shortly after the route changes
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-x-0 top-0 z-[150] h-[3px] overflow-hidden bg-transparent"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="h-full rounded-r-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-400 shadow-[0_0_8px_rgba(24,88,48,0.6)]"
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '40%', '70%', '90%'] }}
            exit={{ width: '100%' }}
            transition={{ duration: 0.6, ease: 'easeOut', times: [0, 0.3, 0.6, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
