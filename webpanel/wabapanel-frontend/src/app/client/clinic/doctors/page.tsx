'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Search, Stethoscope, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { clinicApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7] disabled:opacity-50';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';
const labelClass = 'block text-[12px] font-medium text-admin-text-secondary mb-1';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Doctor {
  _id: string; name: string; specialty: string; department?: string;
  qualifications: string; registrationNo?: string; experience?: string;
  consultationMins: number; consultationFee?: number; room: string;
  photo: string; bio: string; email?: string; phone?: string; active: boolean;
  userId?: { name: string; email: string } | null;
}
interface Win { start: string; end: string; }
interface Override { date: string; unavailable: boolean; windows: Win[]; }
interface Upcoming { _id: string; date: string; startTime: string; contactName?: string; contact?: { name?: string }; status: string; }
interface RecentVisit { _id: string; date: string; patientName: string; diagnosis?: string; }

const emptyForm = {
  name: '', specialty: '', department: '', qualifications: '', registrationNo: '', experience: '',
  consultationMins: 15, consultationFee: 0, room: '', photo: '', bio: '',
  email: '', phone: '', password: '', active: true,
};

export default function ClinicDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [weekly, setWeekly] = useState<Win[][]>([[], [], [], [], [], [], []]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [upcoming, setUpcoming] = useState<Upcoming[]>([]);
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    clinicApi.doctors.list().then((r) => setDoctors(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditId(null); setForm(emptyForm);
    setWeekly([[], [{ start: '10:00', end: '18:00' }], [{ start: '10:00', end: '18:00' }], [{ start: '10:00', end: '18:00' }], [{ start: '10:00', end: '18:00' }], [{ start: '10:00', end: '18:00' }], []]);
    setOverrides([]); setUpcoming([]); setRecentVisits([]);
    setShow(true);
  };
  const openEdit = async (d: Doctor) => {
    setEditId(d._id);
    setForm({
      name: d.name, specialty: d.specialty || '', department: d.department || '',
      qualifications: d.qualifications || '', registrationNo: d.registrationNo || '', experience: d.experience || '',
      consultationMins: d.consultationMins || 15, consultationFee: d.consultationFee || 0,
      room: d.room || '', photo: d.photo || '', bio: d.bio || '',
      email: d.email || '', phone: d.phone || '', password: '', active: d.active !== false,
    });
    setUpcoming([]); setRecentVisits([]);
    try {
      const r = await clinicApi.doctors.get(d._id);
      const det = r.data.data || {};
      setWeekly(det.schedule?.weekly || [[], [], [], [], [], [], []]);
      setOverrides(det.schedule?.overrides || []);
      setUpcoming(det.upcomingAppointments || []);
      setRecentVisits(det.recentVisits || []);
    } catch {
      setWeekly([[], [], [], [], [], [], []]);
      setOverrides([]);
    }
    setShow(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await clinicApi.doctors.update(editId, form);
        await clinicApi.doctors.updateSchedule(editId, { weekly, overrides });
        toast.success('Doctor updated');
      } else {
        const created = await clinicApi.doctors.create(form);
        const id = created.data.data?._id;
        if (id) await clinicApi.doctors.updateSchedule(id, { weekly, overrides });
        toast.success('Doctor added');
      }
      setShow(false);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const deactivate = async () => {
    if (!editId) return;
    if (!window.confirm('Deactivate this doctor? New bookings are blocked; past consultations and prescriptions are preserved.')) return;
    try {
      const r = await clinicApi.doctors.delete(editId);
      const n = r.data.futureAppointments || 0;
      toast.success(r.data.message || 'Doctor deactivated');
      if (n > 0) toast(`${n} upcoming appointment(s) need reassignment — see the list below.`, { icon: '⚠️' });
      load();
      setForm((f) => ({ ...f, active: false }));
    } catch { toast.error('Could not deactivate'); }
  };

  const setWindow = (day: number, idx: number, field: 'start' | 'end', value: string) => {
    setWeekly((prev) => prev.map((wins, d) => d !== day ? wins : wins.map((w, i) => i !== idx ? w : { ...w, [field]: value })));
  };

  const visible = doctors.filter((d) =>
    (showInactive || d.active) &&
    (!search.trim() || `${d.name} ${d.specialty} ${d.department || ''}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold text-admin-text">Doctors</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Roster, schedules, fees and availability</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-admin-text-subdued" />
            <input className={`${inputClass} pl-9`} placeholder="Search doctors" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <label className="flex items-center gap-1.5 text-[12px] text-admin-text-secondary">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> Show inactive
          </label>
          <button type="button" className={primaryBtn} onClick={openNew}><Plus className="h-4 w-4" /> Add doctor</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {loading && <p className="text-[13px] text-admin-text-secondary">Loading…</p>}
        {!loading && visible.length === 0 && (
          <div className={dashboardCardShell}><p className="text-[13px] text-admin-text-secondary">No doctors yet. Add the first doctor to start booking per calendar.</p></div>
        )}
        {visible.map((d) => (
          <button key={d._id} type="button" onClick={() => openEdit(d)} className={`${dashboardCardShell} text-left`}>
            <div className="flex items-start gap-3">
              {d.photo
                ? <img src={d.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6f6f7] text-[13px] font-semibold">{d.name.charAt(0)}</div>}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-semibold text-admin-text">Dr. {d.name}</p>
                  {!d.active && <span className="rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">Inactive</span>}
                </div>
                <p className="text-[12px] text-admin-text-secondary">
                  {d.specialty || 'General'}{d.department ? ` · ${d.department}` : ''}{d.room ? ` · Room ${d.room}` : ''}
                </p>
                <p className="mt-1 text-[12px] text-admin-text-subdued">
                  {d.consultationMins} min slots{d.consultationFee ? ` · ₹${d.consultationFee}` : ''}{d.registrationNo ? ` · Reg ${d.registrationNo}` : ''}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShow(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-admin-border p-4">
              <h3 className="font-semibold">{editId ? `Dr. ${form.name || 'Edit doctor'}` : 'Add doctor'}</h3>
              <button type="button" onClick={() => setShow(false)}>×</button>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase text-admin-text-subdued">Professional</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label><span className={labelClass}>Full name *</span>
                    <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                  <label><span className={labelClass}>Specialty</span>
                    <input className={inputClass} value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></label>
                  <label><span className={labelClass}>Department</span>
                    <input className={inputClass} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></label>
                  <label><span className={labelClass}>Qualifications</span>
                    <input className={inputClass} placeholder="MBBS, MD…" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} /></label>
                  <label><span className={labelClass}>Registration no.</span>
                    <input className={inputClass} value={form.registrationNo} onChange={(e) => setForm({ ...form, registrationNo: e.target.value })} /></label>
                  <label><span className={labelClass}>Experience</span>
                    <input className={inputClass} placeholder="e.g. 12 years" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></label>
                  <label><span className={labelClass}>Consult duration (min)</span>
                    <input type="number" className={inputClass} value={form.consultationMins} onChange={(e) => setForm({ ...form, consultationMins: Number(e.target.value) })} /></label>
                  <label><span className={labelClass}>Consult fee (₹)</span>
                    <input type="number" className={inputClass} value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })} /></label>
                  <label><span className={labelClass}>Room</span>
                    <input className={inputClass} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></label>
                  <label><span className={labelClass}>Photo URL</span>
                    <input className={inputClass} value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} /></label>
                  <label className="sm:col-span-2"><span className={labelClass}>Bio</span>
                    <textarea className={inputClass} rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase text-admin-text-subdued">Contact</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label><span className={labelClass}>Work email</span>
                    <input className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                  <label><span className={labelClass}>Work phone</span>
                    <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
                </div>
                {!editId && (
                  <div className="mt-2 rounded-lg border border-admin-border bg-[#fafafa] p-3">
                    <p className="mb-2 text-[12px] text-admin-text-secondary">Optional panel login — doctor can sign in and see only their own queue/consults.</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input className={inputClass} placeholder="Login email" autoComplete="off" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      <input className={inputClass} type="password" placeholder="Login password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase text-admin-text-subdued">Weekly hours</p>
                {DAY_NAMES.map((name, day) => (
                  <div key={name} className="mb-1.5 flex items-center gap-2">
                    <span className="w-10 text-[12px] font-medium text-admin-text-secondary">{name}</span>
                    {(weekly[day] || []).length === 0 ? (
                      <button type="button" className="text-[12px] text-[#005bd3]" onClick={() => setWeekly((w) => w.map((wins, i) => i === day ? [{ start: '10:00', end: '18:00' }] : wins))}>Set hours</button>
                    ) : (
                      <>
                        {(weekly[day] || []).map((win, idx) => (
                          <span key={idx} className="flex items-center gap-1">
                            <input type="time" className="rounded border border-admin-border px-1 text-[12px]" value={win.start} onChange={(e) => setWindow(day, idx, 'start', e.target.value)} />
                            <span className="text-[11px]">–</span>
                            <input type="time" className="rounded border border-admin-border px-1 text-[12px]" value={win.end} onChange={(e) => setWindow(day, idx, 'end', e.target.value)} />
                            <button type="button" className="text-admin-text-subdued" onClick={() => setWeekly((w) => w.map((wins, i) => i === day ? wins.filter((_, x) => x !== idx) : wins))}><Trash2 className="h-3 w-3" /></button>
                          </span>
                        ))}
                        <button type="button" className="text-[12px] text-[#005bd3]" onClick={() => setWeekly((w) => w.map((wins, i) => i === day ? [...wins, { start: '14:00', end: '17:00' }] : wins))}>+ split</button>
                        <button type="button" className="text-admin-text-subdued" onClick={() => setWeekly((w) => w.map((wins, i) => i === day ? [] : wins))}><Trash2 className="h-3.5 w-3.5" /></button>
                      </>
                    )}
                  </div>
                ))}
                <p className="mt-1 text-[11px] text-admin-text-subdued">Empty day = not consulting. Use split for breaks (e.g. 10–1 and 5–8).</p>
              </div>

              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase text-admin-text-subdued">Leave / unavailable dates</p>
                {overrides.map((o, i) => (
                  <div key={i} className="mb-1.5 flex items-center gap-2">
                    <input type="date" className={inputClass} style={{ width: 'auto' }} value={o.date} onChange={(e) => setOverrides((arr) => arr.map((x, j) => j === i ? { ...x, date: e.target.value } : x))} />
                    <span className="text-[12px] text-admin-text-secondary">Unavailable</span>
                    <button type="button" className="text-admin-text-subdued" onClick={() => setOverrides((arr) => arr.filter((_, j) => j !== i))}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <button type="button" className="text-[12px] font-medium text-[#005bd3]" onClick={() => setOverrides((arr) => [...arr, { date: '', unavailable: true, windows: [] }])}>+ Add leave date</button>
              </div>

              {editId && (
                <>
                  <label className="flex items-center gap-2 text-[13px]">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active — accepts new bookings
                  </label>
                  {upcoming.length > 0 && (
                    <div>
                      <p className="mb-1 text-[12px] font-semibold uppercase text-admin-text-subdued">Upcoming appointments ({upcoming.length})</p>
                      <div className="max-h-36 overflow-y-auto rounded-lg border border-admin-border">
                        {upcoming.map((a) => (
                          <div key={a._id} className="flex justify-between border-b border-admin-border px-3 py-1.5 text-[12px] last:border-0">
                            <span>{a.contactName || a.contact?.name || 'Patient'}</span>
                            <span className="text-admin-text-secondary">{String(a.date).slice(0, 10)} {a.startTime} · {a.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {recentVisits.length > 0 && (
                    <div>
                      <p className="mb-1 text-[12px] font-semibold uppercase text-admin-text-subdued">Recent consultations</p>
                      <div className="max-h-32 overflow-y-auto rounded-lg border border-admin-border">
                        {recentVisits.map((v) => (
                          <div key={v._id} className="flex justify-between border-b border-admin-border px-3 py-1.5 text-[12px] last:border-0">
                            <span>{v.patientName}</span>
                            <span className="text-admin-text-secondary">{v.date} · {v.diagnosis || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-admin-border p-4">
              {editId && form.active && (
                <button type="button" className="mr-auto text-[13px] font-medium text-red-600" onClick={deactivate}>Deactivate</button>
              )}
              {editId && !form.active && (
                <button type="button" className="mr-auto text-[13px] font-medium text-[#005bd3]" onClick={async () => {
                  await clinicApi.doctors.update(editId, { active: true });
                  toast.success('Doctor reactivated'); setForm((f) => ({ ...f, active: true })); load();
                }}>Reactivate</button>
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
