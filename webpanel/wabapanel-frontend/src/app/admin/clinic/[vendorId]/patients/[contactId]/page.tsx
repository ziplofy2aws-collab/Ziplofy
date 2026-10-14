'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { adminApi } from '@/lib/api';

const inputClass = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm';
const labelClass = 'block text-xs font-medium text-gray-500 mb-1';

const emptyForm = {
  name: '', phone: '', email: '', gender: '', dob: '', bloodGroup: '', allergies: '', chronicNotes: '', uhid: '',
  address: '', city: '', state: '', pincode: '',
  emergencyName: '', emergencyPhone: '', guardianName: '', occupation: '', referredBy: '',
};

type Tab = 'profile' | 'visits' | 'prescriptions' | 'appointments';

export default function AdminPatientChartPage() {
  const params = useParams();
  const vendorId = String(params.vendorId || '');
  const contactId = String(params.contactId || '');
  const [tab, setTab] = useState<Tab>('profile');
  const [form, setForm] = useState(emptyForm);
  const [visits, setVisits] = useState<Array<{ _id: string; date: string; status: string; notes?: string; doctor?: { name?: string } }>>([]);
  const [prescriptions, setPrescriptions] = useState<Array<{ _id: string; advice?: string; createdAt?: string; drugs?: { name: string; dose?: string; freq?: string; days?: string }[] }>>([]);
  const [appointments, setAppointments] = useState<Array<{ _id: string; date: string; startTime?: string; title?: string; status?: string; doctor?: { name?: string } }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    adminApi.clinic.getPatient(vendorId, contactId)
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
        setVisits(v || []);
        setPrescriptions(rx || []);
        setAppointments(a || []);
      })
      .catch(() => toast.error('Could not load patient'))
      .finally(() => setLoading(false));
  }, [vendorId, contactId]);

  const save = async () => {
    setSaving(true);
    try {
      const r = await adminApi.clinic.updatePatient(vendorId, contactId, form);
      if (r.data.data?.medical?.uhid) setForm((f) => ({ ...f, uhid: r.data.data.medical.uhid || f.uhid }));
      toast.success('Patient updated');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-400">Loading chart…</div>;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/admin/clinic/${vendorId}`} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Clinic
          </Link>
          <h1 className="text-2xl font-bold">{form.name || form.phone}</h1>
          <p className="text-sm text-gray-500">{form.uhid ? `UHID ${form.uhid}` : ''}{form.phone ? ` · ${form.phone}` : ''}</p>
        </div>
        {tab === 'profile' && (
          <Button disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</Button>
        )}
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {(['profile', 'visits', 'prescriptions', 'appointments'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label><span className={labelClass}>Name</span><input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
          <label><span className={labelClass}>Phone</span><input className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} /></label>
          <label><span className={labelClass}>Email</span><input className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
          <label><span className={labelClass}>UHID</span><input className={inputClass} value={form.uhid} onChange={(e) => set('uhid', e.target.value)} /></label>
          <label><span className={labelClass}>Gender</span>
            <select className={inputClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="">—</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </label>
          <label><span className={labelClass}>DOB</span><input className={inputClass} type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} /></label>
          <label><span className={labelClass}>Blood group</span><input className={inputClass} value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} /></label>
          <label><span className={labelClass}>Occupation</span><input className={inputClass} value={form.occupation} onChange={(e) => set('occupation', e.target.value)} /></label>
          <label><span className={labelClass}>Guardian</span><input className={inputClass} value={form.guardianName} onChange={(e) => set('guardianName', e.target.value)} /></label>
          <label><span className={labelClass}>Referred by</span><input className={inputClass} value={form.referredBy} onChange={(e) => set('referredBy', e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={labelClass}>Address</span><input className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} /></label>
          <label><span className={labelClass}>City</span><input className={inputClass} value={form.city} onChange={(e) => set('city', e.target.value)} /></label>
          <label><span className={labelClass}>State</span><input className={inputClass} value={form.state} onChange={(e) => set('state', e.target.value)} /></label>
          <label><span className={labelClass}>Pincode</span><input className={inputClass} value={form.pincode} onChange={(e) => set('pincode', e.target.value)} /></label>
          <label><span className={labelClass}>Emergency name</span><input className={inputClass} value={form.emergencyName} onChange={(e) => set('emergencyName', e.target.value)} /></label>
          <label><span className={labelClass}>Emergency phone</span><input className={inputClass} value={form.emergencyPhone} onChange={(e) => set('emergencyPhone', e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={labelClass}>Allergies</span><input className={inputClass} value={form.allergies} onChange={(e) => set('allergies', e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={labelClass}>Chronic notes</span><textarea className={inputClass} rows={3} value={form.chronicNotes} onChange={(e) => set('chronicNotes', e.target.value)} /></label>
        </div>
      )}

      {tab === 'visits' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {visits.length === 0 && <p className="p-4 text-sm text-gray-400">No visits.</p>}
          {visits.map((v) => (
            <div key={v._id} className="px-4 py-3 text-sm">
              <p className="font-medium">{v.date} · {v.doctor?.name || 'Doctor'} · {v.status}</p>
              {v.notes ? <p className="text-gray-500 text-xs mt-0.5">{v.notes}</p> : null}
            </div>
          ))}
        </div>
      )}

      {tab === 'prescriptions' && (
        <div className="space-y-3">
          {prescriptions.length === 0 && <p className="text-sm text-gray-400">No prescriptions.</p>}
          {prescriptions.map((rx) => (
            <div key={rx._id} className="bg-white rounded-xl border border-gray-200 p-4 text-sm">
              <p className="text-xs text-gray-400">{rx.createdAt ? new Date(rx.createdAt).toLocaleString() : ''}</p>
              {(rx.drugs || []).map((d, i) => <p key={i}>{d.name} {d.dose} {d.freq} {d.days}</p>)}
              {rx.advice ? <p className="text-gray-500 mt-1">{rx.advice}</p> : null}
            </div>
          ))}
        </div>
      )}

      {tab === 'appointments' && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {appointments.length === 0 && <p className="p-4 text-sm text-gray-400">No appointments.</p>}
          {appointments.map((a) => (
            <div key={a._id} className="px-4 py-3 text-sm">
              <p className="font-medium">{a.date} {a.startTime || ''} · {a.title || 'Visit'}</p>
              <p className="text-xs text-gray-500">{a.doctor?.name || 'Doctor'} · {a.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
