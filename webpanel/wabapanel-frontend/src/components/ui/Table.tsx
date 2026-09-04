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
      <div className="overflow-hidden rounded-xl border border-admin-border bg-white p-10 text-center shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-admin-border border-t-admin-text" />
        <p className="mt-2 text-[13px] text-admin-text-secondary">Loading…</p>
      </div>
    );
  }

  const selectable = !!onBulkDelete;

  return (
    <div className="overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)]">
      {selectable && selected.length > 0 && (
        <div className="flex items-center justify-between border-b border-admin-border bg-[#f6f6f7] px-4 py-2">
          <span className="text-[13px] font-medium text-admin-text">{selected.length} selected</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleAll} className="rounded-lg border border-admin-border bg-white px-2.5 py-1 text-[13px] font-medium text-admin-text hover:bg-[#f1f1f1]">
              {allSelected ? 'Clear all' : 'Select all'}
            </button>
            <button type="button" onClick={handleBulkDelete} disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[13px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
              <Trash2 className="h-3.5 w-3.5" /> {deleting ? 'Deleting…' : 'Delete selected'}
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border bg-[#f7f7f7]">
              {selectable && (
                <th className="w-10 px-3 py-2.5">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer rounded border-admin-border" />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-3 py-2.5 text-left text-[12px] font-medium text-[#616161]">
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-10 text-center text-[13px] text-admin-text-subdued">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr
                  key={item._id || i}
                  className={`border-b border-[#ebebeb] bg-white transition-colors last:border-0 hover:bg-[#f6f6f7] ${onRowClick ? 'cursor-pointer' : ''} ${item._id && selected.includes(item._id) ? 'bg-[#f1f1f1]' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="w-10 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      {item._id && (
                        <input type="checkbox" checked={selected.includes(item._id)} onChange={() => toggle(item._id as string)}
                          className="h-4 w-4 cursor-pointer rounded border-admin-border" />
                      )}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-3 py-2.5 text-[13px] text-admin-text-secondary">
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
        <div className="flex items-center justify-between border-t border-admin-border px-4 py-2.5">
          <p className="text-[13px] text-admin-text-secondary">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-admin-border p-1.5 text-admin-text hover:bg-[#f6f6f7] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border border-admin-border p-1.5 text-admin-text hover:bg-[#f6f6f7] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
