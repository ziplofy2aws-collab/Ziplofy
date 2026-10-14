'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, FileText, Stethoscope, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { clinicApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1a1a1a] disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text hover:bg-[#f6f6f7]';
const inputClass = 'w-full rounded-lg border border-admin-border px-3 py-2 text-[13px] focus:border-[#005bd3] focus:outline-none';
const labelClass = 'block text-[12px] font-medium text-admin-text-secondary mb-1';

const emptyForm = {
  name: '', phone: '', email: '', gender: '', dob: '', bloodGroup: '', allergies: '', chronicNotes: '', uhid: '',
  address: '', city: '', state: '', pincode: '',
  emergencyName: '', emergencyPhone: '', guardianName: '', occupation: '', referredBy: '',
};

type Tab = 'profile' | 'visits' | 'prescriptions' | 'appointments';

interface Visit {
  _id: string;
  date: string;
  status: string;
  notes?: string;
  subjective?: string;
  assessment?: string;
  doctor?: { name?: string; specialty?: string } | null;
}
interface Rx {
  _id: string;
  visit?: string;
  advice?: string;
  pdfUrl?: string;
  createdAt?: string;
  drugs?: { name: string; dose?: string; freq?: string; days?: string }[];
}
interface Appt {
  _id: string;
  date: string;
  startTime?: string;
  title?: string;
  status?: string;
  doctor?: { name?: string } | null;
}

export default function PatientChartPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || '');
  const isNew = id === 'new';
  const [tab, setTab] = useState<Tab>('profile');
  const [form, setForm] = useState(emptyForm);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [prescriptions, setPrescriptions] = useState<Rx[]>([]);
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [archived, setArchived] = useState(false);

  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    clinicApi.patients.get(id)
      .then((r) => {
        const { contact, medical, visits: v, prescriptions: rx, appointments: a } = r.data.data || {};
        setForm({
          name: contact?.name || '',
          phone: contact?.phone || '',
          email: contact?.email || '',
          gender: medical?.gender || '',
          dob: medical?.dob ? String(medical.dob).slice(0, 10) : '',
          bloodGroup: medical?.bloodGroup || '',
          allergies: medical?.allergies || '',
          chronicNotes: medical?.chronicNotes || '',
          uhid: medical?.uhid || '',
          address: medical?.address || '',
          city: medical?.city || '',
          state: medical?.state || '',
          pincode: medical?.pincode || '',
          emergencyName: medical?.emergencyName || '',
          emergencyPhone: medical?.emergencyPhone || '',
          guardianName: medical?.guardianName || '',
          occupation: medical?.occupation || '',
          referredBy: medical?.referredBy || '',
        });
        setArchived(!!medical?.archived);
        setVisits(v || []);
        setPrescriptions(rx || []);
        setAppointments(a || []);
      })
      .catch(() => toast.error('Could not load patient'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const save = async () => {
    if (!form.phone.trim()) { toast.error('Phone is required'); return; }
    setSaving(true);
    try {
      const r = isNew
        ? await clinicApi.patients.create(form)
        : await clinicApi.patients.upsert(id, form);
      const contactId = r.data.data?.contact?._id;
      toast.success('Patient saved');
      if (isNew && contactId) router.replace(`/client/clinic/patients/${contactId}`);
      else if (r.data.data?.medical?.uhid) setForm((f) => ({ ...f, uhid: r.data.data.medical.uhid || f.uhid }));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const archive = async () => {
    if (isNew) return;
    if (!window.confirm('Archive this patient? The contact is kept; they leave the active list.')) return;
    try {
      await clinicApi.patients.archive(id);
      toast.success('Patient archived');
      router.push('/client/clinic/patients');
    } catch {
      toast.error('Archive failed');
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="h-3.5 w-3.5" /> },
    { id: 'visits', label: 'Visits', icon: <Stethoscope className="h-3.5 w-3.5" /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="h-3.5 w-3.5" /> },
  ];

  if (loading) {
    return <div className={`${adminContentColumnClass} py-10 text-[13px] text-admin-text-secondary`}>Loading chart…</div>;
  }

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/client/clinic/patients" className="mb-1 inline-flex items-center gap-1 text-[12px] text-admin-text-secondary hover:text-admin-text">
            <ArrowLeft className="h-3.5 w-3.5" /> Patients
          </Link>
          <h1 className="text-[20px] font-semibold text-admin-text">
            {isNew ? 'New patient' : (form.name || form.phone || 'Patient chart')}
          </h1>
          {!isNew && (
            <p className="mt-0.5 text-[13px] text-admin-text-secondary">
              {form.uhid ? `UHID ${form.uhid}` : 'UHID assigned on save'}
              {form.phone ? ` · ${form.phone}` : ''}
              {archived ? ' · Archived' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <button type="button" className={secondaryBtn} onClick={archive}>Archive</button>
          )}
          {tab === 'profile' && (
            <button type="button" className={primaryBtn} disabled={saving} onClick={save}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {!isNew && (
        <div className="flex gap-1 border-b border-admin-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium ${
                tab === t.id ? 'border-b-2 border-admin-text text-admin-text' : 'text-admin-text-secondary'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}

      {(isNew || tab === 'profile') && (
        <div className={dashboardCardShell + ' space-y-4'}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label><span className={labelClass}>Name</span>
              <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
            <label><span className={labelClass}>Phone *</span>
              <input className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} /></label>
            <label><span className={labelClass}>Email</span>
              <input className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
            <label><span className={labelClass}>UHID</span>
              <input className={inputClass} placeholder="Auto-assigned if blank" value={form.uhid} onChange={(e) => set('uhid', e.target.value)} /></label>
            <label><span className={labelClass}>Gender</span>
              <select className={inputClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select></label>
            <label><span className={labelClass}>Date of birth</span>
              <input className={inputClass} type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} /></label>
            <label><span className={labelClass}>Blood group</span>
              <input className={inputClass} value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} /></label>
            <label><span className={labelClass}>Occupation</span>
              <input className={inputClass} value={form.occupation} onChange={(e) => set('occupation', e.target.value)} /></label>
            <label><span className={labelClass}>Guardian</span>
              <input className={inputClass} value={form.guardianName} onChange={(e) => set('guardianName', e.target.value)} /></label>
            <label><span className={labelClass}>Referred by</span>
              <input className={inputClass} value={form.referredBy} onChange={(e) => set('referredBy', e.target.value)} /></label>
            <label className="sm:col-span-2"><span className={labelClass}>Address</span>
              <input className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} /></label>
            <label><span className={labelClass}>City</span>
              <input className={inputClass} value={form.city} onChange={(e) => set('city', e.target.value)} /></label>
            <label><span className={labelClass}>State</span>
              <input className={inputClass} value={form.state} onChange={(e) => set('state', e.target.value)} /></label>
            <label><span className={labelClass}>Pincode</span>
              <input className={inputClass} value={form.pincode} onChange={(e) => set('pincode', e.target.value)} /></label>
            <label><span className={labelClass}>Emergency contact</span>
              <input className={inputClass} value={form.emergencyName} onChange={(e) => set('emergencyName', e.target.value)} /></label>
            <label><span className={labelClass}>Emergency phone</span>
              <input className={inputClass} value={form.emergencyPhone} onChange={(e) => set('emergencyPhone', e.target.value)} /></label>
            <label className="sm:col-span-2"><span className={labelClass}>Allergies</span>
              <input className={inputClass} value={form.allergies} onChange={(e) => set('allergies', e.target.value)} /></label>
            <label className="sm:col-span-2"><span className={labelClass}>Chronic notes</span>
              <textarea className={inputClass} rows={3} value={form.chronicNotes} onChange={(e) => set('chronicNotes', e.target.value)} /></label>
          </div>
        </div>
      )}

      {!isNew && tab === 'visits' && (
        <div className={dashboardCardShell + ' space-y-2 p-0'}>
          {visits.length === 0 && <p className="px-4 py-6 text-[13px] text-admin-text-secondary">No visits yet.</p>}
          {visits.map((v) => (
            <Link key={v._id} href={`/client/clinic/consult?visit=${v._id}`} className="block border-b border-admin-border px-4 py-3 last:border-0 hover:bg-[#fafafa]">
              <p className="text-[13px] font-medium text-admin-text">{v.date} · {v.doctor?.name || 'Doctor'} · {v.status}</p>
              <p className="text-[12px] text-admin-text-secondary">{v.assessment || v.notes || v.subjective || 'Open consult'}</p>
            </Link>
          ))}
        </div>
      )}

      {!isNew && tab === 'prescriptions' && (
        <div className={dashboardCardShell + ' space-y-3'}>
          {prescriptions.length === 0 && <p className="text-[13px] text-admin-text-secondary">No prescriptions yet.</p>}
          {prescriptions.map((rx) => (
            <div key={rx._id} className="rounded-lg border border-admin-border p-3">
              <p className="text-[12px] text-admin-text-secondary">{rx.createdAt ? new Date(rx.createdAt).toLocaleString() : ''}</p>
              <ul className="mt-1 text-[13px] text-admin-text">
                {(rx.drugs || []).map((d, i) => (
                  <li key={i}>{d.name} {d.dose} {d.freq} {d.days ? `× ${d.days}` : ''}</li>
                ))}
              </ul>
              {rx.advice ? <p className="mt-1 text-[12px] text-admin-text-secondary">{rx.advice}</p> : null}
              {rx.pdfUrl ? <a className="mt-1 inline-block text-[12px] text-[#005bd3]" href={rx.pdfUrl} target="_blank" rel="noreferrer">Open PDF</a> : null}
            </div>
          ))}
        </div>
      )}

      {!isNew && tab === 'appointments' && (
        <div className={dashboardCardShell + ' space-y-2 p-0'}>
          {appointments.length === 0 && <p className="px-4 py-6 text-[13px] text-admin-text-secondary">No appointments yet.</p>}
          {appointments.map((a) => (
            <div key={a._id} className="border-b border-admin-border px-4 py-3 last:border-0">
              <p className="text-[13px] font-medium text-admin-text">{a.date} {a.startTime || ''} · {a.title || 'Visit'}</p>
              <p className="text-[12px] text-admin-text-secondary">{a.doctor?.name || 'Doctor'} · {a.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
