'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { appointmentApi, clinicApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const inputClass = 'rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';

const dstr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

interface Apt {
  _id: string;
  title: string;
  contactName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  doctor?: { name: string } | string;
}

export default function ClinicCalendarPage() {
  const [doctors, setDoctors] = useState<Array<{ _id: string; name: string }>>([]);
  const [doctorId, setDoctorId] = useState('');
  const [weekStart, setWeekStart] = useState(() => {
    const n = new Date();
    n.setDate(n.getDate() - n.getDay());
    n.setHours(0, 0, 0, 0);
    return n;
  });
  const [appts, setAppts] = useState<Apt[]>([]);

  useEffect(() => {
    clinicApi.doctors.list({ active: 'true' }).then((r) => setDoctors(r.data.data || [])).catch(() => {});
  }, []);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  }), [weekStart]);

  useEffect(() => {
    appointmentApi.list({ limit: 200, ...(doctorId ? { doctor: doctorId } : {}) })
      .then((r) => setAppts(r.data.data || []))
      .catch(() => {});
  }, [doctorId, weekStart]);

  const byDay = (day: Date) => {
    const key = dstr(day);
    return appts.filter((a) => a.date && dstr(new Date(a.date)) === key)
      .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  };

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-admin-text-secondary" />
            <h1 className="text-[20px] font-semibold text-admin-text">Clinic calendar</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">Week view, filtered by doctor</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={inputClass} onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })}>Prev</button>
          <button type="button" className={inputClass} onClick={() => { const n = new Date(); n.setDate(n.getDate() - n.getDay()); n.setHours(0, 0, 0, 0); setWeekStart(n); }}>This week</button>
          <button type="button" className={inputClass} onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })}>Next</button>
          <select className={inputClass} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">All doctors</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>Dr. {d.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
        {days.map((day) => (
          <div key={dstr(day)} className={dashboardCardShell}>
            <p className="text-[12px] font-semibold text-admin-text">{day.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
            <p className="mb-2 text-[11px] text-admin-text-subdued">{day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            {byDay(day).map((a) => (
              <div key={a._id} className="mb-1 rounded-md bg-[#f6f6f7] px-2 py-1">
                <p className="text-[11px] font-medium">{a.startTime} {a.contactName || a.title}</p>
                <p className="text-[10px] text-admin-text-subdued">{typeof a.doctor === 'object' ? a.doctor?.name : ''} · {a.status}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
