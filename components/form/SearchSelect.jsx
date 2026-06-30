'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

/**
 * A searchable dropdown select component.
 * Props: value, onChange, options: [{value, label}], placeholder, required, name
 */
export function SearchSelect({ value, onChange, options = [], placeholder = '— select —', required, name }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      {/* Hidden input for form validation */}
      <input type="hidden" name={name} value={value || ''} required={required} />

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                className="w-full rounded-md border border-slate-200 py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Type to search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-400">No results found</p>
            )}
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setSearch('');
                }}
                className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                  o.value === value ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-700'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
