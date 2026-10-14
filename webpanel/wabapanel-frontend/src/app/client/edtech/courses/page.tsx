'use client';
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { edtechApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn = 'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]';

interface Course { _id: string; name: string; subject: string; grade: string; description: string; feeAmount: number; active: boolean; }

export default function EdtechCoursesPage() {
  const [rows, setRows] = useState<Course[]>([]);
  const [form, setForm] = useState({ name: '', subject: '', grade: '', description: '', feeAmount: 0 });
  const [show, setShow] = useState(false);

  const load = () => edtechApi.courses.list().then((r) => setRows(r.data.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      await edtechApi.courses.create(form);
      toast.success('Course added');
      setShow(false);
      setForm({ name: '', subject: '', grade: '', description: '', feeAmount: 0 });
      load();
    } catch { toast.error('Could not save'); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-admin-text">Courses</h1>
        <button type="button" className={primaryBtn} onClick={() => setShow(true)}><Plus className="h-4 w-4" /> Add course</button>
      </div>
      <div className={dashboardCardShell + ' p-0 overflow-x-auto'}>
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#f6f6f7] text-admin-text-secondary"><tr>
            <th className="px-4 py-2">Name</th><th className="px-4 py-2">Subject</th><th className="px-4 py-2">Grade</th><th className="px-4 py-2">Description</th><th className="px-4 py-2">Fee</th>
          </tr></thead>
          <tbody className="divide-y divide-admin-border">
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-admin-text-secondary">No courses yet.</td></tr>}
            {rows.map((c) => (
              <tr key={c._id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.subject || '—'}</td>
                <td className="px-4 py-3">{c.grade || '—'}</td>
                <td className="px-4 py-3 max-w-[240px] truncate">{c.description || '—'}</td>
                <td className="px-4 py-3">{c.feeAmount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShow(false)}>
          <div className="w-full max-w-md space-y-2 rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold">New course</h3>
            <input className={inputClass} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={inputClass} placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <input className={inputClass} placeholder="Grade / class" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
            <textarea className={inputClass + ' min-h-[88px] resize-y'} placeholder="Description" maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className={inputClass} type="number" placeholder="Fee" value={form.feeAmount} onChange={(e) => setForm({ ...form, feeAmount: Number(e.target.value) })} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="rounded-lg border px-3 py-1.5 text-[13px]" onClick={() => setShow(false)}>Cancel</button>
              <button type="button" className={primaryBtn} onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
