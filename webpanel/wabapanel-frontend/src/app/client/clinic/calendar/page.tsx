'use client';
import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarCheck, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi, clinicApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7] disabled:opacity-50';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';
const labelClass = 'block text-[12px] font-medium text-admin-text-secondary mb-1';

const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const APPT_TYPES = ['general', 'consultation', 'follow_up', 'review', 'procedure', 'vaccination'];

const STATUS_META: Record<string, { label: string; cls: string }> = {
  scheduled: { label: 'Scheduled', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  confirmed: { label: 'Confirmed', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  checked_in: { label: 'Checked in', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_consultation: { label: 'In consult', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  completed: { label: 'Completed', cls: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border-red-200' },
  no_show: { label: 'No-show', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  rescheduled: { label: 'Rescheduled', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
};

interface Doctor { _id: string; name: string; specialty?: string; consultationMins?: number; }
interface Apt {
  _id: string; title: string; contactName: string; contactPhone?: string; contactEmail?: string;
  contact?: { _id?: string; name?: string; phone?: string } | null;
  date: string; startTime: string; endTime: string; status: string;
  type?: string; notes?: string; location?: string;
  doctor?: { _id: string; name: string } | string | null;
  reminder1hSent?: boolean; reminder24hSent?: boolean; rescheduleCount?: number;
  cancelReason?: string;
}
interface Slot { start: string; end: string; available: boolean; remaining?: number; }
interface PatientHit { _id: string; name: string; phone: string; medical?: { uhid?: string } | null; }

type View = 'month' | 'week' | 'day';

function CalendarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetPatient = searchParams.get('patient') || '';

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [statusF, setStatusF] = useState('');
  const [view, setView] = useState<View>('week');
  const [cursor, setCursor] = useState(() => { const n = new Date(); n.setHours(0, 0, 0, 0); return n; });
  const [appts, setAppts] = useState<Apt[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Apt | null>(null);
  const [resched, setResched] = useState(false);

  // create form
  const [cForm, setCForm] = useState({ contact: '', contactName: '', contactPhone: '', contactEmail: '', doctor: '', date: dstr(new Date()), type: 'consultation', title: '', notes: '', location: '' });
  const [slot, setSlot] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [patientQ, setPatientQ] = useState('');
  const [patientHits, setPatientHits] = useState<PatientHit[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clinicApi.doctors.list({ active: 'true' }).then((r) => {
      const list = r.data.data || [];
      setDoctors(list);
      if (presetPatient) openCreate();
    }).catch(() => {});
  }, []);

  // Visible range → fetch appointments
  const range = useMemo(() => {
    const start = new Date(cursor);
    if (view === 'month') { start.setDate(1); }
    if (view === 'week') { start.setDate(start.getDate() - start.getDay()); }
    const end = new Date(start);
    if (view === 'month') end.setMonth(end.getMonth() + 1, 0);
    else if (view === 'week') end.setDate(end.getDate() + 6);
    return { start, end };
  }, [cursor, view]);

  const load = () => {
    setLoading(true);
    appointmentApi.list({ limit: 500, ...(doctorId ? { doctor: doctorId } : {}), ...(statusF ? { status: statusF } : {}) })
      .then((r) => setAppts(r.data.data || []))
      .catch(() => toast.error('Could not load appointments'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [doctorId, statusF, view, cursor]);

  const byDay = (day: Date) =>
    appts.filter((a) => a.date && dstr(new Date(a.date)) === dstr(day))
      .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));

  const nav = (dir: number) => {
    const n = new Date(cursor);
    if (view === 'month') n.setMonth(n.getMonth() + dir, 1);
    else n.setDate(n.getDate() + dir * (view === 'week' ? 7 : 1));
    setCursor(n);
  };

  // ---- Create / reschedule slot loading ----
  const loadSlots = (date: string, doc: string) => {
    if (!date) { setSlots([]); return; }
    setSlotsLoading(true);
    appointmentApi.getSlots(date, doc || undefined)
      .then((r) => setSlots(r.data.data?.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  };

  const openCreate = () => {
    setCForm({ contact: presetPatient, contactName: '', contactPhone: '', contactEmail: '', doctor: doctorId, date: dstr(cursor), type: 'consultation', title: '', notes: '', location: '' });
    setSlot(''); setSlots([]); setPatientQ(''); setPatientHits([]);
    if (presetPatient) {
      clinicApi.patients.get(presetPatient).then((r) => {
        const c = r.data.data?.contact;
        if (c) setCForm((f) => ({ ...f, contactName: c.name || '', contactPhone: c.phone || '', contactEmail: c.email || '' }));
      }).catch(() => {});
    }
    setShowCreate(true);
  };

  const searchPatients = (q: string) => {
    setPatientQ(q);
    if (q.trim().length < 2) { setPatientHits([]); return; }
    clinicApi.patients.list({ search: q, limit: 8 })
      .then((r) => setPatientHits(r.data.data || []))
      .catch(() => {});
  };

  const pickPatient = (p: PatientHit) => {
    setCForm((f) => ({ ...f, contact: p._id, contactName: p.name || '', contactPhone: p.phone || '' }));
    setPatientQ(p.name || p.phone);
    setPatientHits([]);
  };

  const createAppt = async () => {
    if (!cForm.contactName.trim() && !cForm.contactPhone.trim()) { toast.error('Patient name or phone is required'); return; }
    if (!cForm.date || !slot) { toast.error('Pick a date and time slot'); return; }
    const endTime = slots.find((s) => s.start === slot)?.end || '';
    setSaving(true);
    try {
      await appointmentApi.create({
        contact: cForm.contact || undefined,
        contactName: cForm.contactName,
        contactPhone: cForm.contactPhone,
        contactEmail: cForm.contactEmail,
        doctor: cForm.doctor || undefined,
        title: cForm.title || `${cForm.type} — ${cForm.contactName || 'Patient'}`,
        type: cForm.type,
        date: cForm.date,
        startTime: slot,
        endTime,
        duration: Math.max(5, (new Date(`2000-01-01T${endTime || slot}:00`).getTime() - new Date(`2000-01-01T${slot}:00`).getTime()) / 60000) || 30,
        notes: cForm.notes,
        location: cForm.location,
      });
      toast.success('Appointment booked');
      setShowCreate(false);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSaving(false); }
  };

  // ---- Detail actions ----
  const [rDate, setRDate] = useState('');
  const [rSlot, setRSlot] = useState('');
  const openReschedule = (a: Apt) => {
    setResched(true);
    setRDate(dstr(new Date(a.date)));
    setRSlot('');
    loadSlots(dstr(new Date(a.date)), typeof a.doctor === 'object' ? a.doctor?._id || '' : String(a.doctor || ''));
  };
  const doReschedule = async () => {
    if (!detail || !rDate || !rSlot) { toast.error('Pick a new slot'); return; }
    try {
      const end = slots.find((s) => s.start === rSlot)?.end;
      await appointmentApi.reschedule(detail._id, { date: rDate, startTime: rSlot, endTime: end });
      toast.success('Rescheduled');
      setResched(false); setDetail(null); load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Reschedule failed');
    }
  };
  const doCancel = async () => {
    if (!detail) return;
    const reason = window.prompt('Cancellation reason (optional)') ?? '';
    try {
      await appointmentApi.cancel(detail._id, reason);
      toast.success('Cancelled'); setDetail(null); load();
    } catch { toast.error('Cancel failed'); }
  };
  const doNoShow = async () => {
    if (!detail) return;
    try {
      await appointmentApi.noShow(detail._id, '');
      toast.success('Marked no-show'); setDetail(null); load();
    } catch { toast.error('Failed'); }
  };
  const doCheckIn = async () => {
    if (!detail) return;
    const docId = typeof detail.doctor === 'object' ? detail.doctor?._id : detail.doctor;
    if (!docId) { toast.error('Appointment has no doctor — assign one first'); return; }
    try {
      await clinicApi.queue.checkIn({ doctor: docId, date: dstr(new Date(detail.date)), appointment: detail._id });
      toast.success('Checked in — see OPD queue');
      setDetail(null);
      router.push('/client/clinic/queue');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };
  const sendReminder = async () => {
    if (!detail) return;
    try { await appointmentApi.sendReminder(detail._id); toast.success('Reminder sent'); }
    catch { toast.error('Reminder failed'); }
  };

  const docName = (a: Apt) => (typeof a.doctor === 'object' ? a.doctor?.name : '') || '';

  // ---- Month grid ----
  const monthGrid = useMemo(() => {
    const first = new Date(range.start);
    const cells: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    const daysIn = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysIn; d++) cells.push(new Date(first.getFullYear(), first.getMonth(), d));
    return cells;
  }, [range.start]);
  const weekDays = useMemo(() => Array.from({ length: view === 'day' ? 1 : 7 }, (_, i) => {
    const d = new Date(range.start); d.setDate(range.start.getDate() + i); return d;
  }), [range.start, view]);

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold text-admin-text">Clinic calendar</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Appointments, availability, and scheduling</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-admin-border">
            {(['day', 'week', 'month'] as View[]).map((v) => (
              <button key={v} type="button" className={`px-3 py-1.5 text-[12px] font-medium capitalize ${view === v ? 'bg-admin-text text-white' : 'bg-white text-admin-text'}`} onClick={() => setView(v)}>{v}</button>
            ))}
          </div>
          <button type="button" className={secondaryBtn} onClick={() => nav(-1)}><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" className={secondaryBtn} onClick={() => { const n = new Date(); n.setHours(0, 0, 0, 0); setCursor(n); }}>Today</button>
          <button type="button" className={secondaryBtn} onClick={() => nav(1)}><ChevronRight className="h-4 w-4" /></button>
          <select className={inputClass} style={{ width: 'auto' }} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">All doctors</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
          </select>
          <select className={inputClass} style={{ width: 'auto' }} value={statusF} onChange={(e) => setStatusF(e.target.value)}>
            <option value="">All statuses</option>
            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button type="button" className={primaryBtn} onClick={openCreate}><Plus className="h-4 w-4" /> New appointment</button>
        </div>
      </div>

      <p className="text-[12px] text-admin-text-subdued">
        {view === 'month' && range.start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        {view === 'week' && `${range.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${range.end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
        {view === 'day' && cursor.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      {loading && <p className="text-[13px] text-admin-text-secondary">Loading…</p>}

      {!loading && view === 'month' && (
        <div className={dashboardCardShell + ' p-2'}>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <p key={d} className="px-1 py-1 text-center text-[11px] font-semibold uppercase text-admin-text-subdued">{d}</p>
            ))}
            {monthGrid.map((day, i) => {
              if (!day) return <div key={`e${i}`} />;
              const list = byDay(day);
              const isToday = dstr(day) === dstr(new Date());
              return (
                <button key={dstr(day)} type="button" onClick={() => { setCursor(day); setView('day'); }}
                  className={`min-h-[76px] rounded-md border p-1 text-left align-top ${isToday ? 'border-[#005bd3] bg-[#f0f7ff]' : 'border-admin-border hover:bg-[#fafafa]'}`}>
                  <p className={`text-[11px] font-medium ${isToday ? 'text-[#005bd3]' : 'text-admin-text-secondary'}`}>{day.getDate()}</p>
                  {list.slice(0, 3).map((a) => (
                    <p key={a._id} className="mt-0.5 truncate rounded bg-[#f6f6f7] px-1 text-[10px]">{a.startTime} {a.contactName || a.title}</p>
                  ))}
                  {list.length > 3 && <p className="text-[10px] text-admin-text-subdued">+{list.length - 3} more</p>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!loading && view !== 'month' && (
        <div className={`grid grid-cols-1 gap-2 ${view === 'week' ? 'md:grid-cols-7' : ''}`}>
          {weekDays.map((day) => (
            <div key={dstr(day)} className={dashboardCardShell}>
              <p className="text-[12px] font-semibold text-admin-text">{day.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
              <p className="mb-2 text-[11px] text-admin-text-subdued">{day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              {byDay(day).map((a) => {
                const meta = STATUS_META[a.status] || STATUS_META.scheduled;
                return (
                  <button key={a._id} type="button" onClick={() => { setDetail(a); setResched(false); }} className="mb-1 block w-full rounded-md bg-[#f6f6f7] px-2 py-1 text-left hover:bg-[#eeeef0]">
                    <p className="text-[11px] font-medium">{a.startTime} {a.contactName || a.title}</p>
                    <p className="text-[10px] text-admin-text-subdued">{docName(a) ? `Dr. ${docName(a)} · ` : ''}<span className={`inline-block rounded border px-1 ${meta.cls}`}>{meta.label}</span></p>
                  </button>
                );
              })}
              {byDay(day).length === 0 && <p className="text-[11px] text-admin-text-subdued">—</p>}
            </div>
          ))}
        </div>
      )}

      {/* ---- Create modal ---- */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-admin-border p-4">
              <h3 className="font-semibold">New appointment</h3>
              <button type="button" onClick={() => setShowCreate(false)}>×</button>
            </div>
            <div className="space-y-3 p-4">
              <div className="relative">
                <span className={labelClass}>Patient</span>
                <input className={inputClass} placeholder="Search registered patients…" value={patientQ} onChange={(e) => searchPatients(e.target.value)} />
                {patientHits.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-admin-border bg-white shadow-lg">
                    {patientHits.map((p) => (
                      <button key={p._id} type="button" className="block w-full px-3 py-2 text-left text-[13px] hover:bg-[#fafafa]" onClick={() => pickPatient(p)}>
                        {p.name || p.phone} <span className="text-admin-text-subdued">{p.medical?.uhid ? `· ${p.medical.uhid}` : p.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
                {cForm.contact && <p className="mt-1 text-[11px] text-green-700">Linked to patient record.</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label><span className={labelClass}>Patient name *</span>
                  <input className={inputClass} value={cForm.contactName} onChange={(e) => setCForm({ ...cForm, contactName: e.target.value })} /></label>
                <label><span className={labelClass}>Phone *</span>
                  <input className={inputClass} value={cForm.contactPhone} onChange={(e) => setCForm({ ...cForm, contactPhone: e.target.value })} /></label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label><span className={labelClass}>Doctor</span>
                  <select className={inputClass} value={cForm.doctor} onChange={(e) => { setCForm({ ...cForm, doctor: e.target.value }); setSlot(''); loadSlots(cForm.date, e.target.value); }}>
                    <option value="">Any / clinic-wide</option>
                    {doctors.map((d) => <option key={d._id} value={d._id}>Dr. {d.name}{d.specialty ? ` — ${d.specialty}` : ''}</option>)}
                  </select></label>
                <label><span className={labelClass}>Type</span>
                  <select className={inputClass} value={cForm.type} onChange={(e) => setCForm({ ...cForm, type: e.target.value })}>
                    {APPT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select></label>
                <label><span className={labelClass}>Date</span>
                  <input type="date" className={inputClass} value={cForm.date} onChange={(e) => { setCForm({ ...cForm, date: e.target.value }); setSlot(''); loadSlots(e.target.value, cForm.doctor); }} /></label>
                <label><span className={labelClass}>Visit reason</span>
                  <input className={inputClass} placeholder="e.g. Fever, follow-up" value={cForm.title} onChange={(e) => setCForm({ ...cForm, title: e.target.value })} /></label>
              </div>
              <div>
                <span className={labelClass}>Time slot {slotsLoading ? '· loading…' : slots.length ? `· ${slots.filter((s) => s.available).length} free` : ''}</span>
                {!cForm.date ? <p className="text-[12px] text-admin-text-secondary">Pick a date first.</p>
                  : slots.length === 0 ? <p className="text-[12px] text-admin-text-secondary">{slotsLoading ? 'Loading…' : 'No slots configured for this date — check doctor hours / clinic schedule.'}</p>
                  : (
                    <div className="grid max-h-40 grid-cols-4 gap-1.5 overflow-y-auto rounded-lg border border-admin-border p-2">
                      {slots.map((s) => (
                        <button key={s.start} type="button" disabled={!s.available}
                          className={`rounded border px-1 py-1.5 text-[11px] font-medium ${slot === s.start ? 'border-[#005bd3] bg-[#f0f7ff] text-[#005bd3]' : s.available ? 'border-admin-border hover:bg-[#f6f6f7]' : 'border-admin-border bg-[#f6f6f7] text-admin-text-subdued line-through'}`}
                          onClick={() => setSlot(s.start)}>
                          {s.start}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
              <label><span className={labelClass}>Notes (internal)</span>
                <textarea className={inputClass} rows={2} value={cForm.notes} onChange={(e) => setCForm({ ...cForm, notes: e.target.value })} /></label>
              <p className="text-[11px] text-admin-text-subdued">Confirmation + 24h/1h WhatsApp reminders go out automatically per clinic reminder settings.</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-admin-border p-4">
              <button type="button" className={secondaryBtn} onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="button" className={primaryBtn} disabled={saving} onClick={createAppt}>{saving ? 'Booking…' : 'Book appointment'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Detail modal ---- */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetail(null)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-admin-border p-4">
              <h3 className="font-semibold">{detail.contactName || detail.title}</h3>
              <button type="button" onClick={() => setDetail(null)}>×</button>
            </div>
            <div className="space-y-2 p-4 text-[13px]">
              {(() => { const meta = STATUS_META[detail.status] || STATUS_META.scheduled; return (
                <p><span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.cls}`}>{meta.label}</span></p>
              ); })()}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                <span className="text-admin-text-subdued">Date</span><span>{dstr(new Date(detail.date))}</span>
                <span className="text-admin-text-subdued">Time</span><span>{detail.startTime}–{detail.endTime}</span>
                <span className="text-admin-text-subdued">Doctor</span><span>{docName(detail) ? `Dr. ${docName(detail)}` : '—'}</span>
                <span className="text-admin-text-subdued">Type</span><span>{detail.type || 'general'}</span>
                <span className="text-admin-text-subdued">Phone</span><span>{detail.contactPhone || detail.contact?.phone || '—'}</span>
                <span className="text-admin-text-subdued">Reminders</span><span>{[detail.reminder24hSent && '24h sent', detail.reminder1hSent && '1h sent'].filter(Boolean).join(', ') || 'Pending'}</span>
                {detail.location ? (<><span className="text-admin-text-subdued">Location</span><span>{detail.location}</span></>) : null}
                {(detail.rescheduleCount || 0) > 0 ? (<><span className="text-admin-text-subdued">Rescheduled</span><span>{detail.rescheduleCount}×</span></>) : null}
                {detail.cancelReason ? (<><span className="text-admin-text-subdued">Reason</span><span>{detail.cancelReason}</span></>) : null}
              </div>
              {detail.notes && <p className="rounded-lg bg-[#f6f6f7] p-2 text-[12px] text-admin-text-secondary">{detail.notes}</p>}

              {resched && (
                <div className="rounded-lg border border-admin-border p-3">
                  <p className="mb-2 text-[12px] font-semibold">Reschedule to</p>
                  <input type="date" className={inputClass} value={rDate} onChange={(e) => { setRDate(e.target.value); setRSlot(''); loadSlots(e.target.value, typeof detail.doctor === 'object' ? detail.doctor?._id || '' : String(detail.doctor || '')); }} />
                  <div className="mt-2 grid max-h-36 grid-cols-4 gap-1.5 overflow-y-auto">
                    {slots.map((s) => (
                      <button key={s.start} type="button" disabled={!s.available}
                        className={`rounded border px-1 py-1.5 text-[11px] font-medium ${rSlot === s.start ? 'border-[#005bd3] bg-[#f0f7ff] text-[#005bd3]' : s.available ? 'border-admin-border' : 'border-admin-border bg-[#f6f6f7] text-admin-text-subdued line-through'}`}
                        onClick={() => setRSlot(s.start)}>{s.start}</button>
                    ))}
                    {!slots.length && <p className="col-span-4 text-[11px] text-admin-text-secondary">No slots on this date.</p>}
                  </div>
                  <button type="button" className={`${primaryBtn} mt-2`} onClick={doReschedule}>Confirm reschedule</button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-admin-border p-4">
              {!resched && ['scheduled', 'confirmed', 'rescheduled'].includes(detail.status) && (
                <>
                  <button type="button" className={secondaryBtn} onClick={doCheckIn}>Check in</button>
                  <button type="button" className={secondaryBtn} onClick={() => openReschedule(detail)}>Reschedule</button>
                  <button type="button" className={secondaryBtn} onClick={sendReminder}>Send reminder</button>
                  <button type="button" className={secondaryBtn} onClick={doNoShow}>No-show</button>
                  <button type="button" className="inline-flex items-center rounded-lg border border-red-200 px-3 py-1.5 text-[13px] font-medium text-red-600 hover:bg-red-50" onClick={doCancel}>Cancel</button>
                </>
              )}
              {detail.status === 'checked_in' && (
                <button type="button" className={primaryBtn} onClick={() => router.push('/client/clinic/queue')}>Open OPD queue</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClinicCalendarPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[13px] text-admin-text-secondary">Loading…</div>}>
      <CalendarInner />
    </Suspense>
  );
}
