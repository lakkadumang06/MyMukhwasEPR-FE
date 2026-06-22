'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui';
import { Loading, EmptyState, ErrorState } from '@/components/common/widgets';
import { motion } from 'framer-motion';

/**
 * Lightweight Excel-like table.
 * columns: [{ key, header, render?(row), align?, className? }]
 * data: array of rows
 * Supports a search box (client-side filter over searchKeys) and row actions.
 */
export function DataTable({
  columns,
  data = [],
  isLoading,
  error,
  searchKeys,
  onSearch,
  actions,
  emptyLabel,
}) {
  const [q, setQ] = useState('');

  const filtered =
    searchKeys && q
      ? data.filter((row) =>
          searchKeys.some((k) =>
            String(row[k] ?? '').toLowerCase().includes(q.toLowerCase()),
          ),
        )
      : data;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {(searchKeys || onSearch) && (
        <div className="border-b border-slate-100 p-3">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                onSearch?.(e.target.value);
              }}
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-2.5 font-semibold ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.header}
                </th>
              ))}
              {actions ? <th className="px-4 py-2.5 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <Loading />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <ErrorState message={error.message} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <EmptyState label={emptyLabel} />
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <motion.tr
                  key={row._id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
                  className="border-b border-slate-50 hover:bg-slate-50/70"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-2.5 ${c.align === 'right' ? 'text-right tnum' : ''} ${c.className || ''}`}
                    >
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                  {actions ? <td className="px-4 py-2.5 text-right">{actions(row)}</td> : null}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
