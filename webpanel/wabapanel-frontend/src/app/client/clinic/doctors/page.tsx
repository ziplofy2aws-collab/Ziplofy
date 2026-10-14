'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Stethoscope, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { clinicApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7]';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  qualifications: string;
  consultationMins: number;
  room: string;
  photo: string;
  bio: string;
  active: boolean;
  userId?: { name: string; email: string } | null;
}

interface Win { start: string; end: string; }

const emptyForm = {
  name: '', specialty: '', qualifications: '', consultationMins: 15, room: '', photo: '', bio: '',
  email: '', password: '', active: true,
};

export default function ClinicDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [weekly, setWeekly] = useState<Win[][]>([[], [], [], [], [], [], []]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    clinicApi.doctors.list().then((r) => setDoctors(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditId(null); setForm(emptyForm); setShow(true); };
  const openEdit = async (d: Doctor) => {
    setEditId(d._id);
    setForm({
      name: d.name, specialty: d.specialty || '', qualifications: d.qualifications || '',
      consultationMins: d.consultationMins || 15, room: d.room || '', photo: d.photo || '',
      bio: d.bio || '', email: '', password: '', active: d.active !== false,
    });
    try {
      const s = await clinicApi.doctors.getSchedule(d._id);
      setWeekly(s.data.data?.weekly || [[], [], [], [], [], [], []]);
    } catch { setWeekly([[], [], [], [], [], [], []]); }
    setShow(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await clinicApi.doctors.update(editId, form);
        await clinicApi.doctors.updateSchedule(editId, { weekly });
        toast.success('Doctor updated');
      } else {
        const created = await clinicApi.doctors.create(form);
        const id = created.data.data?._id;
        if (id) await clinicApi.doctors.updateSchedule(id, { weekly });
        toast.success('Doctor added');
      }
      setShow(false);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const setWindow = (day: number, idx: number, field: 'start' | 'end', value: string) => {
    setWeekly((prev) => prev.map((wins, d) => d !== day ? wins : wins.map((w, i) => i !== idx ? w : { ...w, [field]: value })));
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold text-admin-text">Doctors</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Roster, specialties, and weekly hours</p>
        </div>
        <button type="button" className={primaryBtn} onClick={openNew}><Plus className="h-4 w-4" /> Add doctor</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {loading && <p className="text-[13px] text-admin-text-secondary">Loading…</p>}
        {!loading && doctors.length === 0 && (
          <div className={dashboardCardShell}><p className="text-[13px] text-admin-text-secondary">No doctors yet. Add the first doctor to start booking per calendar.</p></div>
        )}
        {doctors.map((d) => (
          <button key={d._id} type="button" onClick={() => openEdit(d)} className={`${dashboardCardShell} text-left`}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6f6f7] text-[13px] font-semibold">
                {d.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-admin-text">Dr. {d.name}</p>
                <p className="text-[12px] text-admin-text-secondary">{d.specialty || 'General'}{d.room ? ` · Room ${d.room}` : ''}</p>
                <p className="mt-1 flex items-center gap-1 text-[12px] text-admin-text-subdued"><Clock className="h-3 w-3" /> {d.consultationMins} min slots · {d.active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShow(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-admin-border p-4">
              <h3 className="font-semibold">{editId ? 'Edit doctor' : 'Add doctor'}</h3>
              <button type="button" onClick={() => setShow(false)}>×</button>
            </div>
            <div className="space-y-3 p-4">
              <input className={inputClass} placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClass} placeholder="Specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
                <input className={inputClass} placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
              </div>
              <input className={inputClass} placeholder="Qualifications" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[12px] text-admin-text-secondary">Slot minutes
                  <input type="number" className={inputClass} value={form.consultationMins} onChange={(e) => setForm({ ...form, consultationMins: Number(e.target.value) })} />
                </label>
                <label className="flex items-center gap-2 text-[13px] pt-5">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
                </label>
              </div>
              <textarea className={inputClass} rows={2} placeholder="Bio (shown on website)" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              {!editId && (
                <>
                  <p className="text-[12px] text-admin-text-secondary">Optional login so this doctor can sign in</p>
                  <input className={inputClass} placeholder="Login email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <input className={inputClass} type="password" placeholder="Login password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </>
              )}
              <p className="pt-2 text-[12px] font-medium text-admin-text">Weekly hours</p>
              {DAY_NAMES.map((name, day) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="w-20 text-[12px] text-admin-text-secondary">{name}</span>
                  {(weekly[day] || []).length === 0 ? (
                    <button type="button" className="text-[12px] text-[#005bd3]" onClick={() => setWeekly((w) => w.map((wins, i) => i === day ? [{ start: '10:00', end: '18:00' }] : wins))}>Set hours</button>
                  ) : (
                    <>
                      {(weekly[day] || []).map((win, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <input type="time" className="rounded border px-1 text-[12px]" value={win.start} onChange={(e) => setWindow(day, idx, 'start', e.target.value)} />
                          <span className="text-[11px]">–</span>
                          <input type="time" className="rounded border px-1 text-[12px]" value={win.end} onChange={(e) => setWindow(day, idx, 'end', e.target.value)} />
                        </span>
                      ))}
                      <button type="button" className="text-admin-text-subdued" onClick={() => setWeekly((w) => w.map((wins, i) => i === day ? [] : wins))}><Trash2 className="h-3.5 w-3.5" /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t p-4">
              {editId && (
                <button type="button" className="mr-auto text-[13px] text-red-600" onClick={async () => {
                  if (!confirm('Remove this doctor?')) return;
                  await clinicApi.doctors.delete(editId);
                  toast.success('Removed');
                  setShow(false);
                  load();
                }}>Delete</button>
              )}
              <button type="button" className={secondaryBtn} onClick={() => setShow(false)}>Cancel</button>
              <button type="button" className={primaryBtn} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
