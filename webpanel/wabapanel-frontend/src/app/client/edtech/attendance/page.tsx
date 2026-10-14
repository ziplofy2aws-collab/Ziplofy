'use client';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { edtechApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn = 'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white';
const inputClass = 'rounded-lg border border-admin-border px-3 py-2 text-[13px]';

interface Batch { _id: string; name: string; }
interface Student { _id: string; name?: string; phone?: string; status: string; }

export default function EdtechAttendancePage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batch, setBatch] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    edtechApi.batches.list().then((r) => {
      const list = r.data.data || [];
      setBatches(list);
      if (list[0]) setBatch(list[0]._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!batch) return;
    edtechApi.attendance.get({ batch, date }).then((r) => setStudents(r.data.data?.students || [])).catch(() => toast.error('Could not load attendance'));
  }, [batch, date]);

  const setStatus = (id: string, status: string) => {
    setStudents((rows) => rows.map((s) => s._id === id ? { ...s, status } : s));
  };

  const save = async () => {
    setSaving(true);
    try {
      await edtechApi.attendance.save({
        batch,
        date,
        marks: students.filter((s) => s.status).map((s) => ({ contact: s._id, status: s.status })),
      });
      toast.success('Attendance saved');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[20px] font-semibold text-admin-text">Attendance</h1>
        <button type="button" className={primaryBtn} disabled={saving || !batch} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <select className={inputClass} value={batch} onChange={(e) => setBatch(e.target.value)}>
          {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className={dashboardCardShell + ' divide-y divide-admin-border p-0'}>
        {students.length === 0 && <p className="px-4 py-6 text-[13px] text-admin-text-secondary">No active students in this batch.</p>}
        {students.map((s) => (
          <div key={s._id} className="flex items-center justify-between px-4 py-3 text-[13px]">
            <span>{s.name || s.phone}</span>
            <select className={inputClass} value={s.status} onChange={(e) => setStatus(s._id, e.target.value)}>
              <option value="">—</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
