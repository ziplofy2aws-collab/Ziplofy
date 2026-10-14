'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { edtechApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn = 'inline-flex items-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px]';

interface Batch { _id: string; name: string; }
interface Enrollment {
  _id: string;
  status: string;
  feeDue: number;
  feePaid: number;
  batch?: { name?: string; course?: { name?: string } };
}

export default function EdtechStudentPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || '');
  const isNew = id === 'new';
  const [form, setForm] = useState({ name: '', phone: '', email: '', grade: '', guardianName: '', guardianPhone: '', dob: '', address: '', enrollmentNo: '' });
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState('');
  const [saving, setSaving] = useState(false);
  const [canManage, setCanManage] = useState(true);

  useEffect(() => {
    edtechApi.batches.list().then((r) => setBatches(r.data.data || [])).catch(() => {});
    edtechApi.me().then((r) => setCanManage(r.data.data?.staffType !== 'teacher')).catch(() => {});
    if (isNew) return;
    edtechApi.students.get(id).then((r) => {
      const { contact, profile, enrollments: rows } = r.data.data || {};
      setForm({
        name: contact?.name || '',
        phone: contact?.phone || '',
        email: contact?.email || '',
        grade: profile?.grade || '',
        guardianName: profile?.guardianName || '',
        guardianPhone: profile?.guardianPhone || '',
        dob: profile?.dob ? String(profile.dob).slice(0, 10) : '',
        address: profile?.address || '',
        enrollmentNo: profile?.enrollmentNo || '',
      });
      setEnrollments(rows || []);
    }).catch(() => toast.error('Could not load student'));
  }, [id, isNew]);

  const save = async () => {
    if (!form.phone.trim()) { toast.error('Phone is required'); return; }
    setSaving(true);
    try {
      const r = isNew ? await edtechApi.students.create(form) : await edtechApi.students.update(id, form);
      const contactId = r.data.data?.contact?._id;
      toast.success('Student saved');
      if (isNew && contactId) router.replace(`/client/edtech/students/${contactId}`);
      else if (r.data.data?.profile?.enrollmentNo) setForm((f) => ({ ...f, enrollmentNo: r.data.data.profile.enrollmentNo }));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const enroll = async () => {
    if (!batchId || isNew) return;
    try {
      await edtechApi.batches.enroll(batchId, id);
      toast.success('Enrolled');
      const r = await edtechApi.students.get(id);
      setEnrollments(r.data.data?.enrollments || []);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Enroll failed');
    }
  };

  const setPaid = async (row: Enrollment, feePaid: number) => {
    try {
      await edtechApi.enrollments.update(row._id, { feePaid });
      setEnrollments((list) => list.map((e) => e._id === row._id ? { ...e, feePaid } : e));
    } catch { toast.error('Could not update fee'); }
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <Link href="/client/edtech/students" className="inline-flex items-center gap-1 text-[12px] text-admin-text-secondary"><ArrowLeft className="h-3.5 w-3.5" /> Students</Link>
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold">{isNew ? 'New student' : (form.name || 'Student')}{form.enrollmentNo ? ` · ${form.enrollmentNo}` : ''}</h1>
        {canManage && <button type="button" className={primaryBtn} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>}
      </div>
      <div className={dashboardCardShell + ' grid grid-cols-1 gap-2 sm:grid-cols-2'}>
        <input className={inputClass} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputClass} placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className={inputClass} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className={inputClass} placeholder="Grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
        <input className={inputClass} placeholder="Guardian" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
        <input className={inputClass} placeholder="Guardian phone" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} />
        <input className={inputClass} type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
        <input className={inputClass} placeholder="Enrollment no (auto if blank)" value={form.enrollmentNo} onChange={(e) => setForm({ ...form, enrollmentNo: e.target.value })} />
        <input className={`${inputClass} sm:col-span-2`} placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      {!isNew && (
        <div className={dashboardCardShell + ' space-y-3'}>
          <h2 className="text-[14px] font-semibold">Batches</h2>
          {canManage && (
            <div className="flex gap-2">
              <select className={inputClass} value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                <option value="">Enroll in batch</option>
                {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
              <button type="button" className={primaryBtn} onClick={enroll}>Enroll</button>
            </div>
          )}
          {enrollments.length === 0 && <p className="text-[13px] text-admin-text-secondary">Not enrolled yet.</p>}
          {enrollments.map((row) => (
            <div key={row._id} className="flex flex-wrap items-center justify-between gap-2 border-t border-admin-border pt-2 text-[13px]">
              <span>{row.batch?.course?.name || 'Course'} · {row.batch?.name || 'Batch'} · {row.status}</span>
              {canManage ? (
                <label className="flex items-center gap-2">Fee paid
                  <input className="w-24 rounded border px-2 py-1" type="number" defaultValue={row.feePaid}
                    onBlur={(e) => setPaid(row, Number(e.target.value))} />
                  <span className="text-admin-text-secondary">/ {row.feeDue}</span>
                </label>
              ) : (
                <span className="text-admin-text-secondary">Paid {row.feePaid} / {row.feeDue}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
