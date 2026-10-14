'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { clinicApi, appointmentApi } from '@/lib/api';
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
  patientName: string;
  patientPhone: string;
  status: string;
  visit?: { _id: string };
  appointment?: { startTime?: string };
  doctor?: { name: string };
}

export default function ClinicQueuePage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayStr());
  const [tokens, setTokens] = useState<Token[]>([]);
  const [appts, setAppts] = useState<Array<{ _id: string; contactName: string; startTime: string; doctor?: { _id: string } }>>([]);
  const [walkIn, setWalkIn] = useState({ patientName: '', patientPhone: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clinicApi.doctors.list({ active: 'true' }).then((r) => {
      const list = r.data.data || [];
      setDoctors(list);
      if (list.length && !doctorId) setDoctorId(list[0]._id);
    }).catch(() => {});
  }, []);

  const load = () => {
    if (!doctorId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      clinicApi.queue.list({ date, doctor: doctorId }),
      appointmentApi.list({ date, doctor: doctorId, limit: 100 }),
    ]).then(([q, a]) => {
      setTokens(q.data.data || []);
      setAppts(a.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [doctorId, date]);

  const waiting = tokens.filter((t) => t.status === 'waiting');
  const called = tokens.filter((t) => t.status === 'called');
  const done = tokens.filter((t) => t.status === 'done' || t.status === 'skipped');
  const checkedIds = new Set(
    tokens
      .map((t) => (t.appointment && typeof t.appointment === 'object' ? String((t.appointment as { _id?: string })._id || '') : ''))
      .filter(Boolean)
  );

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold text-admin-text">OPD queue</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Check-in, call next, and complete consults</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className={inputClass} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            {doctors.map((d) => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
          </select>
          <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="button" className={primaryBtn} disabled={!doctorId} onClick={async () => {
            try {
              await clinicApi.queue.callNext({ doctor: doctorId, date });
              toast.success('Next patient called');
              load();
            } catch (e: unknown) {
              const err = e as { response?: { data?: { message?: string } } };
              toast.error(err.response?.data?.message || 'No waiting patients');
            }
          }}>Call next</button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className={dashboardCardShell}>
          <p className="text-[12px] font-semibold uppercase text-admin-text-subdued">Waiting ({waiting.length})</p>
          {waiting.map((t) => (
            <div key={t._id} className="mt-2 flex items-center justify-between rounded-lg border border-admin-border px-3 py-2">
              <div>
                <p className="text-[13px] font-medium">#{t.tokenNo} {t.patientName || t.patientPhone}</p>
                <p className="text-[11px] text-admin-text-subdued">{t.appointment?.startTime || 'Walk-in'}</p>
              </div>
              <button type="button" className={secondaryBtn} onClick={async () => { await clinicApi.queue.call(t._id); load(); }}>Call</button>
            </div>
          ))}
          {!waiting.length && !loading && <p className="mt-2 text-[12px] text-admin-text-secondary">Queue is empty</p>}
        </div>
        <div className={dashboardCardShell}>
          <p className="text-[12px] font-semibold uppercase text-admin-text-subdued">In consult ({called.length})</p>
          {called.map((t) => (
            <div key={t._id} className="mt-2 rounded-lg border border-admin-border px-3 py-2">
              <p className="text-[13px] font-medium">#{t.tokenNo} {t.patientName || t.patientPhone}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" className={primaryBtn} onClick={() => router.push(`/client/clinic/consult?visit=${t.visit?._id || ''}`)}>Open consult</button>
                <button type="button" className={secondaryBtn} onClick={async () => { await clinicApi.queue.complete(t._id); load(); }}>Done</button>
                <button type="button" className={secondaryBtn} onClick={async () => { await clinicApi.queue.skip(t._id); load(); }}>Skip</button>
              </div>
            </div>
          ))}
        </div>
        <div className={dashboardCardShell}>
          <p className="text-[12px] font-semibold uppercase text-admin-text-subdued">Finished ({done.length})</p>
          {done.map((t) => (
            <p key={t._id} className="mt-2 text-[13px] text-admin-text-secondary">#{t.tokenNo} {t.patientName} · {t.status}</p>
          ))}
        </div>
      </div>

      <div className={dashboardCardShell}>
        <p className="mb-2 text-[13px] font-semibold">Today&apos;s appointments — check in</p>
        {(appts || []).filter((a) => !checkedIds.has(a._id)).map((a) => (
          <div key={a._id} className="flex items-center justify-between border-t border-admin-border py-2">
            <span className="text-[13px]">{a.startTime} · {a.contactName}</span>
            <button type="button" className={secondaryBtn} onClick={async () => {
              await clinicApi.queue.checkIn({ doctor: doctorId, date, appointment: a._id });
              toast.success('Checked in');
              load();
            }}>Check in</button>
          </div>
        ))}
        <div className="mt-3 flex flex-wrap gap-2">
          <input className={inputClass} placeholder="Walk-in name" value={walkIn.patientName} onChange={(e) => setWalkIn({ ...walkIn, patientName: e.target.value })} />
          <input className={inputClass} placeholder="Phone" value={walkIn.patientPhone} onChange={(e) => setWalkIn({ ...walkIn, patientPhone: e.target.value })} />
          <button type="button" className={primaryBtn} onClick={async () => {
            if (!walkIn.patientName && !walkIn.patientPhone) { toast.error('Name or phone required'); return; }
            await clinicApi.queue.checkIn({ doctor: doctorId, date, ...walkIn });
            setWalkIn({ patientName: '', patientPhone: '' });
            toast.success('Walk-in added');
            load();
          }}>Add walk-in</button>
        </div>
      </div>
    </div>
  );
}
