'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, PhoneCall, RotateCcw, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { clinicApi, appointmentApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7]';
const inputClass = 'rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';

const todayStr = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

interface Doctor { _id: string; name: string; }
interface Token {
  _id: string;
  tokenNo: number;
  tokenLabel?: string;
  patientName: string;
  patientPhone: string;
  uhid?: string;
  patientDob?: string | null;
  patientGender?: string;
  priority: 'normal' | 'urgent';
  status: string;
  skipReason?: string;
  cancelReason?: string;
  recallCount?: number;
  calledAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  visit?: { _id: string; status?: string } | null;
  appointment?: { _id?: string; startTime?: string; endTime?: string; type?: string } | null;
  doctor?: { _id: string; name: string } | null;
}
interface Summary {
  total: number; waiting: number; called: number; done: number; skipped: number; noShow: number; avgWaitMin: number;
}
interface Appt {
  _id: string; contactName: string; startTime: string; status: string;
  doctor?: { _id: string } | string | null;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  waiting: { label: 'Waiting', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  called: { label: 'In consult', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  done: { label: 'Done', cls: 'bg-green-50 text-green-700 border-green-200' },
  skipped: { label: 'Skipped', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  no_show: { label: 'No-show', cls: 'bg-red-50 text-red-600 border-red-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

function ageOf(dob?: string | null) {
  if (!dob) return '';
  const d = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
  return a >= 0 ? `${a}y` : '';
}
function minsBetween(from?: string | null, to?: string | Date | null) {
  if (!from) return null;
  const end = to ? new Date(to) : new Date();
  const m = Math.max(0, Math.round((end.getTime() - new Date(from).getTime()) / 60000));
  return m;
}
const fmtDur = (m: number | null) => (m == null ? '—' : m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`);

export default function ClinicQueuePage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayStr());
  const [statusF, setStatusF] = useState('');
  const [search, setSearch] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [walkIn, setWalkIn] = useState({ patientName: '', patientPhone: '', priority: 'normal' });
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    clinicApi.doctors.list({ active: 'true' }).then((r) => {
      const list = r.data.data || [];
      setDoctors(list);
      if (list.length && !doctorId) setDoctorId(list[0]._id);
    }).catch(() => {});
  }, []);

  const load = (silent = false) => {
    if (!silent) setLoading(true);
    const qParams: Record<string, unknown> = { date, ...(doctorId ? { doctor: doctorId } : {}) };
    if (statusF) qParams.status = statusF;
    Promise.all([
      clinicApi.queue.list(qParams),
      appointmentApi.list({ date, limit: 100, ...(doctorId ? { doctor: doctorId } : {}) }),
    ]).then(([q, a]) => {
      setTokens(q.data.data || []);
      setSummary(q.data.summary || null);
      setAppts(a.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [doctorId, date, statusF]);

  // Realtime refresh on queue events + a light poll fallback.
  useEffect(() => {
    const socket = getSocket();
    const onQueue = () => load(true);
    socket?.on('clinic:queue', onQueue);
    const poll = setInterval(() => load(true), 45000);
    const tick = setInterval(() => setTick((n) => n + 1), 30000); // waiting-duration re-render
    return () => {
      socket?.off('clinic:queue', onQueue);
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [doctorId, date, statusF]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) =>
      (t.patientName || '').toLowerCase().includes(q) ||
      (t.uhid || '').toLowerCase().includes(q) ||
      String(t.tokenLabel || t.tokenNo).toLowerCase().includes(q) ||
      (t.patientPhone || '').includes(q)
    );
  }, [tokens, search]);

  const checkedIds = new Set(tokens.map((t) => String((t.appointment as { _id?: string })?._id || '')).filter(Boolean));
  const pendingAppts = appts.filter((a) =>
    !checkedIds.has(a._id) && ['scheduled', 'confirmed', 'rescheduled'].includes(a.status)
  );

  const act = async (fn: () => Promise<unknown>, okMsg?: string) => {
    try {
      await fn();
      if (okMsg) toast.success(okMsg);
      load(true);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };
  const skipWithReason = (id: string) => {
    const reason = window.prompt('Skip reason (optional)') ?? '';
    act(() => clinicApi.queue.skip(id, reason), 'Patient skipped');
  };
  const noShowWithReason = (id: string) => {
    const reason = window.prompt('No-show reason (optional)') ?? '';
    act(() => clinicApi.queue.noShow(id, reason), 'Marked no-show');
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold text-admin-text">OPD queue</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Arrivals, tokens, calls and consult handoff</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className={inputClass} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">All doctors</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
          </select>
          <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          <select className={inputClass} value={statusF} onChange={(e) => setStatusF(e.target.value)}>
            <option value="">All statuses</option>
            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button type="button" className={primaryBtn} disabled={!doctorId && !doctors.length} onClick={() => setShowCheckIn((s) => !s)}>
            <UserPlus className="h-4 w-4" /> Check in
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {[
            ['Checked in', summary.total],
            ['Waiting', summary.waiting],
            ['In consult', summary.called],
            ['Done', summary.done],
            ['Skipped', summary.skipped],
            ['No-show', summary.noShow],
            ['Avg wait', fmtDur(summary.avgWaitMin)],
          ].map(([label, v]) => (
            <div key={label} className={dashboardCardShell}>
              <p className="text-[11px] font-semibold uppercase text-admin-text-subdued">{label}</p>
              <p className="mt-1 text-[20px] font-semibold text-admin-text">{v}</p>
            </div>
          ))}
        </div>
      )}

      {showCheckIn && (
        <div className={dashboardCardShell}>
          <p className="mb-2 text-[13px] font-semibold">Check in — today&apos;s appointments</p>
          {!doctorId && <p className="mb-2 text-[12px] text-amber-600">Pick a doctor first — the queue is per doctor.</p>}
          {pendingAppts.length === 0 && <p className="text-[12px] text-admin-text-secondary">No pending appointments for this date{doctorId ? ' / doctor' : ''}.</p>}
          {pendingAppts.map((a) => (
            <div key={a._id} className="flex items-center justify-between border-t border-admin-border py-2">
              <span className="text-[13px]">{a.startTime} · {a.contactName} · <span className="text-admin-text-subdued">{a.status}</span></span>
              <div className="flex gap-2">
                <button type="button" className={secondaryBtn} disabled={!doctorId} onClick={() => act(() => clinicApi.queue.checkIn({ doctor: doctorId, date, appointment: a._id }), 'Checked in')}>Check in</button>
                <button type="button" className={secondaryBtn} disabled={!doctorId} onClick={() => act(() => clinicApi.queue.checkIn({ doctor: doctorId, date, appointment: a._id, priority: 'urgent' }), 'Checked in as urgent')}>Urgent</button>
              </div>
            </div>
          ))}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-admin-border pt-3">
            <span className="text-[12px] font-medium text-admin-text-secondary">Walk-in:</span>
            <input className={inputClass} placeholder="Name" value={walkIn.patientName} onChange={(e) => setWalkIn({ ...walkIn, patientName: e.target.value })} />
            <input className={inputClass} placeholder="Phone" value={walkIn.patientPhone} onChange={(e) => setWalkIn({ ...walkIn, patientPhone: e.target.value })} />
            <select className={inputClass} value={walkIn.priority} onChange={(e) => setWalkIn({ ...walkIn, priority: e.target.value })}>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
            <button type="button" className={primaryBtn} disabled={!doctorId} onClick={() => {
              if (!walkIn.patientName && !walkIn.patientPhone) { toast.error('Name or phone required'); return; }
              act(async () => {
                await clinicApi.queue.checkIn({ doctor: doctorId, date, ...walkIn });
                setWalkIn({ patientName: '', patientPhone: '', priority: 'normal' });
              }, 'Walk-in added');
            }}>Add walk-in</button>
          </div>
        </div>
      )}

      <div className="relative">
        <input
          className={`${inputClass} w-full`}
          placeholder="Search patient, UHID, or token…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={dashboardCardShell + ' overflow-x-auto p-0'}>
        <table className="w-full min-w-[980px] text-left text-[13px]">
          <thead className="border-b border-admin-border bg-[#f6f6f7] text-admin-text-secondary">
            <tr>
              <th className="px-3 py-2.5 font-medium">Token</th>
              <th className="px-3 py-2.5 font-medium">Patient</th>
              <th className="px-3 py-2.5 font-medium">UHID</th>
              <th className="px-3 py-2.5 font-medium">Appt</th>
              <th className="px-3 py-2.5 font-medium">Doctor</th>
              <th className="px-3 py-2.5 font-medium">Type</th>
              <th className="px-3 py-2.5 font-medium">Checked in</th>
              <th className="px-3 py-2.5 font-medium">Waiting</th>
              <th className="px-3 py-2.5 font-medium">Priority</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {loading && <tr><td colSpan={11} className="px-4 py-6 text-admin-text-secondary">Loading queue…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-6 text-admin-text-secondary">No queue entries for this date. Use “Check in” to add arrivals.</td></tr>
            )}
            {!loading && filtered.map((t) => {
              const meta = STATUS_META[t.status] || STATUS_META.waiting;
              const waitMin = t.status === 'waiting'
                ? minsBetween(t.createdAt, null)
                : minsBetween(t.createdAt, t.calledAt || t.completedAt);
              return (
                <tr key={t._id} className="hover:bg-[#fafafa]">
                  <td className="px-3 py-2.5 font-mono text-[12px] font-semibold">{t.tokenLabel || `#${t.tokenNo}`}</td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{t.patientName || t.patientPhone || '—'}</p>
                    <p className="text-[11px] text-admin-text-subdued">{[ageOf(t.patientDob), t.patientGender].filter(Boolean).join(' · ')}</p>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[12px] text-admin-text-secondary">{t.uhid || '—'}</td>
                  <td className="px-3 py-2.5 text-admin-text-secondary">{t.appointment?.startTime || '—'}</td>
                  <td className="px-3 py-2.5 text-admin-text-secondary">{t.doctor?.name || '—'}</td>
                  <td className="px-3 py-2.5 text-admin-text-secondary">{t.appointment ? (t.appointment.type || 'Scheduled') : 'Walk-in'}</td>
                  <td className="px-3 py-2.5 text-admin-text-secondary">{t.createdAt ? new Date(t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td className="px-3 py-2.5 text-admin-text-secondary">{fmtDur(waitMin)}</td>
                  <td className="px-3 py-2.5">
                    {t.priority === 'urgent'
                      ? <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">Urgent</span>
                      : <span className="text-[12px] text-admin-text-subdued">Normal</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.cls}`}>{meta.label}</span>
                    {t.skipReason && <p className="mt-0.5 text-[10px] text-admin-text-subdued">{t.skipReason}</p>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {t.status === 'waiting' && (
                        <>
                          <button type="button" className={secondaryBtn} onClick={() => act(() => clinicApi.queue.call(t._id), 'Patient called')}><PhoneCall className="h-3.5 w-3.5" /> Call</button>
                          <button type="button" className={secondaryBtn} onClick={() => skipWithReason(t._id)}>Skip</button>
                          <button type="button" className={secondaryBtn} onClick={() => noShowWithReason(t._id)}>No-show</button>
                        </>
                      )}
                      {t.status === 'called' && (
                        <>
                          <button type="button" className={primaryBtn} onClick={() => router.push(`/client/clinic/consult?visit=${t.visit?._id || ''}`)}>Consult</button>
                          <button type="button" className={secondaryBtn} onClick={() => act(() => clinicApi.queue.call(t._id), 'Recalled')}>Recall</button>
                          <button type="button" className={secondaryBtn} onClick={() => act(() => clinicApi.queue.complete(t._id), 'Visit completed')}>Done</button>
                          <button type="button" className={secondaryBtn} onClick={() => skipWithReason(t._id)}>Skip</button>
                        </>
                      )}
                      {t.status === 'skipped' && (
                        <>
                          <button type="button" className={secondaryBtn} onClick={() => act(() => clinicApi.queue.requeue(t._id), 'Back in queue')}><RotateCcw className="h-3.5 w-3.5" /> Re-queue</button>
                          <button type="button" className={secondaryBtn} onClick={() => noShowWithReason(t._id)}>No-show</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] text-admin-text-subdued">
        Queue updates in realtime. “Call” moves the patient to consult — open it from the Consult page or the Consult button.
      </p>
    </div>
  );
}
