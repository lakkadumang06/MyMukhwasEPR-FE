'use client';
import { FadeIn } from '@/components/common/motion';

export function PageHeader({ title, subtitle, children }) {
  return (
    <FadeIn className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </FadeIn>
  );
}
