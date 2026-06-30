'use client';
import { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { useGet, useList } from '@/lib/useCrud';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data/DataTable';
import { Money, KpiCard } from '@/components/common/widgets';
import { StatusBadge } from '@/components/common/widgets';
import { Select } from '@/components/ui';
import { inr } from '@/lib/format';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'OK', label: 'OK' },
  { value: 'Low', label: 'Low' },
  { value: 'Out', label: 'Out' },
];

export default function RawMaterialStockPage() {
  const { data, isLoading } = useGet('/stock/raw-materials');
  const { data: bomData } = useList('/recipe-bom', { limit: 500 });
  const [statusFilter, setStatusFilter] = useState('');
  const [recipeFilter, setRecipeFilter] = useState('');

  const allRows = Array.isArray(data) ? data : [];
  const bomItems = Array.isArray(bomData) ? bomData : bomData?.items || [];

  // Get unique product families from BOM
  const recipeOptions = useMemo(() => {
    const families = [...new Set(bomItems.map((b) => b.productFamily))];
    return families.sort();
  }, [bomItems]);

  // Get RM codes for the selected recipe
  const recipeRmCodes = useMemo(() => {
    if (!recipeFilter) return null;
    return bomItems
      .filter((b) => b.productFamily === recipeFilter)
      .map((b) => b.rmCode);
  }, [bomItems, recipeFilter]);

  // Apply both filters
  const rows = useMemo(() => {
    let filtered = allRows;
    if (statusFilter) {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (recipeRmCodes) {
      filtered = filtered.filter((r) => recipeRmCodes.includes(r.rmCode));
    }
    return filtered;
  }, [allRows, statusFilter, recipeRmCodes]);

  const totalStockValue = allRows.reduce((s, r) => s + (Number(r.stockValue) || 0), 0);

  const columns = [
    { key: 'rmCode', header: 'RM Code' },
    { key: 'rmName', header: 'RM Name' },
    { key: 'unit', header: 'Unit' },
    { key: 'category', header: 'Category' },
    { key: 'totalPurchased', header: 'Total Purchased', align: 'right' },
    { key: 'rate', header: 'Rate', align: 'right', render: (r) => <Money value={r.rate} /> },
    { key: 'stockValue', header: 'Stock Value', align: 'right', render: (r) => <Money value={r.stockValue} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Raw Material Stock" subtitle="Derived FIFO roll-up per raw material" />
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Stock Value" value={inr(totalStockValue)} icon={Package} accent="brand" />
      </div>

      {/* Filters row */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* Status filter buttons */}
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
              {f.value && (
                <span className="ml-1.5 text-[10px] opacity-75">
                  ({allRows.filter((r) => r.status === f.value).length})
                </span>
              )}
              {!f.value && (
                <span className="ml-1.5 text-[10px] opacity-75">({allRows.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Recipe/BOM dropdown filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Recipe:</span>
          <Select
            value={recipeFilter}
            onChange={(e) => setRecipeFilter(e.target.value)}
            className="w-56 text-sm"
          >
            <option value="">All Materials</option>
            {recipeOptions.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchKeys={['rmCode', 'rmName']}
      />
    </div>
  );
}
