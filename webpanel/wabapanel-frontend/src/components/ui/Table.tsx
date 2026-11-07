'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export interface Column<T> {
  key: string;
  title: string | React.ReactNode;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: { page: number; totalPages: number; total: number; onPageChange: (page: number) => void };
  onRowClick?: (item: T) => void;
  emptyText?: string;
  onBulkDelete?: (ids: string[]) => void | Promise<void>;
}

const shell =
  'overflow-hidden rounded-2xl border border-white/50 bg-white/55 shadow-[0_8px_28px_rgba(15,61,46,0.06),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl';

export default function Table<T extends { _id?: string }>({
  columns, data, loading, pagination, onRowClick, emptyText = 'No data found', onBulkDelete,
}: TableProps<T>) {
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const ids = data.map((d) => d._id).filter(Boolean) as string[];

  useEffect(() => {
    setSelected((prev) => prev.filter((id) => ids.includes(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const allSelected = ids.length > 0 && selected.length === ids.length;
  const toggleAll = () => setSelected(allSelected ? [] : ids);

  const handleBulkDelete = async () => {
    if (!onBulkDelete || !selected.length || deleting) return;
    if (!confirm(`Delete ${selected.length} selected item(s)?`)) return;
    setDeleting(true);
    const n = selected.length;
    try { await onBulkDelete(selected); setSelected([]); toast.success(`${n} item(s) deleted`); }
    catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  if (loading) {
    return (
      <div className={`${shell} p-10 text-center`}>
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#e8efe9] border-t-[#00896F]" />
        <p className="mt-2 text-[13px] text-[#6b7a74]">Loading…</p>
      </div>
    );
  }

  const selectable = !!onBulkDelete;

  return (
    <div className={shell}>
      {selectable && selected.length > 0 && (
        <div className="flex items-center justify-between border-b border-white/50 bg-[#eef8f0]/80 px-4 py-2">
          <span className="text-[13px] font-medium text-[#101828]">{selected.length} selected</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleAll} className="rounded-xl border border-white/70 bg-white/60 px-2.5 py-1 text-[13px] font-medium text-[#303030] hover:bg-white/85">
              {allSelected ? 'Clear all' : 'Select all'}
            </button>
            <button type="button" onClick={handleBulkDelete} disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200/80 bg-white/70 px-2.5 py-1 text-[13px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
              <Trash2 className="h-3.5 w-3.5" /> {deleting ? 'Deleting…' : 'Delete selected'}
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/50 bg-[#f7fbf8]/90">
              {selectable && (
                <th className="w-10 px-3 py-2.5">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer rounded border-[#e8efe9] text-[#00896F] focus:ring-[#00896F]/30" />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-[#8a9a93]">
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-10 text-center text-[13px] text-[#8a9a93]">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr
                  key={item._id || i}
                  className={`border-b border-[#e8efe9]/70 bg-white/25 transition-colors last:border-0 hover:bg-[#eef8f0]/70 ${onRowClick ? 'cursor-pointer' : ''} ${item._id && selected.includes(item._id) ? 'bg-[#eef8f0]/90' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="w-10 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      {item._id && (
                        <input type="checkbox" checked={selected.includes(item._id)} onChange={() => toggle(item._id as string)}
                          className="h-4 w-4 cursor-pointer rounded border-[#e8efe9] text-[#00896F] focus:ring-[#00896F]/30" />
                      )}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-3 py-2.5 text-[13px] text-[#6b7a74]">
                      {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/50 px-4 py-2.5">
          <p className="text-[13px] text-[#6b7a74]">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-xl border border-white/70 bg-white/50 p-1.5 text-[#303030] hover:bg-white/80 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-xl border border-white/70 bg-white/50 p-1.5 text-[#303030] hover:bg-white/80 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
