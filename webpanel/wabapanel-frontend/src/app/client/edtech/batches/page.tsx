'use client';
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { edtechApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn = 'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]';

interface Course { _id: string; name: string; }
interface Teacher { _id: string; name: string; }
interface Batch { _id: string; name: string; startTime: string; endTime: string; room: string; course?: { name: string }; teacher?: { name: string }; }

export default function EdtechBatchesPage() {
  const [rows, setRows] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [show, setShow] = useState(false);
  const [canManage, setCanManage] = useState(true);
  const [form, setForm] = useState({ name: '', course: '', teacher: '', startTime: '09:00', endTime: '10:00', room: '', capacity: 30 });

  const load = () => {
    edtechApi.batches.list().then((r) => setRows(r.data.data || [])).catch(() => {});
    edtechApi.courses.list().then((r) => setCourses(r.data.data || [])).catch(() => {});
    edtechApi.teachers.list().then((r) => setTeachers(r.data.data || [])).catch(() => {});
    edtechApi.me().then((r) => setCanManage(r.data.data?.staffType !== 'teacher')).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim() || !form.course) { toast.error('Name and course are required'); return; }
    try {
      await edtechApi.batches.create({ ...form, teacher: form.teacher || null });
      toast.success('Batch added');
      setShow(false);
      load();
    } catch { toast.error('Could not save'); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-admin-text">Batches</h1>
        {canManage && <button type="button" className={primaryBtn} onClick={() => setShow(true)}><Plus className="h-4 w-4" /> Add batch</button>}
      </div>
      <div className={dashboardCardShell + ' divide-y divide-admin-border p-0'}>
        {rows.length === 0 && <p className="px-4 py-6 text-[13px] text-admin-text-secondary">No batches yet.</p>}
        {rows.map((b) => (
          <div key={b._id} className="px-4 py-3 text-[13px]">
            <p className="font-medium text-admin-text">{b.name}</p>
            <p className="text-admin-text-secondary">{b.course?.name || 'Course'} · {b.teacher?.name || 'No teacher'} · {b.startTime}–{b.endTime}{b.room ? ` · ${b.room}` : ''}</p>
          </div>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShow(false)}>
          <div className="w-full max-w-md space-y-2 rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold">New batch</h3>
            <input className={inputClass} placeholder="Batch name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className={inputClass} value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
              <option value="">Course</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select className={inputClass} value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}>
              <option value="">Teacher</option>
              {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputClass} type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              <input className={inputClass} type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
            <input className={inputClass} placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            <input className={inputClass} type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
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
