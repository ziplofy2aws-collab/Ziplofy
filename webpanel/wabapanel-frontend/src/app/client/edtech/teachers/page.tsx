'use client';
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { edtechApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn = 'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]';

interface Teacher { _id: string; name: string; subject: string; phone: string; active: boolean; userId?: { email?: string } | null; }

export default function EdtechTeachersPage() {
  const [rows, setRows] = useState<Teacher[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', phone: '', email: '', password: '' });

  const load = () => edtechApi.teachers.list().then((r) => setRows(r.data.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      await edtechApi.teachers.create(form);
      toast.success('Teacher added');
      setShow(false);
      setForm({ name: '', subject: '', phone: '', email: '', password: '' });
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Could not save');
    }
  };

  const deactivate = async (t: Teacher) => {
    try {
      await edtechApi.teachers.update(t._id, { active: false });
      toast.success('Teacher deactivated');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-admin-text">Teachers</h1>
        <button type="button" className={primaryBtn} onClick={() => setShow(true)}><Plus className="h-4 w-4" /> Add teacher</button>
      </div>
      <div className={dashboardCardShell + ' divide-y divide-admin-border p-0'}>
        {rows.length === 0 && <p className="px-4 py-6 text-[13px] text-admin-text-secondary">No teachers yet.</p>}
        {rows.map((t) => (
          <div key={t._id} className="flex items-center justify-between px-4 py-3 text-[13px]">
            <div>
              <p className="font-medium">{t.name}{t.active === false ? ' · Inactive' : ''}</p>
              <p className="text-admin-text-secondary">{t.subject || 'Subject'}{t.userId?.email ? ` · ${t.userId.email}` : ''}</p>
            </div>
            {t.active !== false && <button type="button" className="text-[12px] text-red-600" onClick={() => deactivate(t)}>Deactivate</button>}
          </div>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShow(false)}>
          <div className="w-full max-w-md space-y-2 rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold">New teacher</h3>
            <input className={inputClass} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={inputClass} placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <input className={inputClass} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className={inputClass} placeholder="Login email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className={inputClass} type="password" placeholder="Login password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <p className="text-[12px] text-admin-text-secondary">Email and password create a teacher login limited to their batches.</p>
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
