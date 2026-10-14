'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Stethoscope, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { adminApi } from '@/lib/api';

interface Doctor {
  _id: string;
  name: string;
  specialty?: string;
  qualifications?: string;
  consultationMins?: number;
  room?: string;
  bio?: string;
  active?: boolean;
  userId?: { name?: string; email?: string } | null;
}
interface Patient {
  _id: string;
  name: string;
  phone: string;
  medical?: { uhid?: string } | null;
  lastVisit?: { date?: string } | null;
}

const inputClass = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm';

export default function AdminClinicVendorPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = String(params.vendorId || '');
  const [tab, setTab] = useState<'doctors' | 'patients'>('doctors');
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<{ _id: string; name: string; email: string; companyName?: string } | null>(null);
  const [clinicEnabled, setClinicEnabled] = useState(true);
  const [counts, setCounts] = useState({ doctors: 0, patients: 0, visits: 0 });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientTotal, setPatientTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Doctor | null>(null);
  const [form, setForm] = useState({ name: '', specialty: '', qualifications: '', consultationMins: 15, room: '', bio: '', active: true });
  const [saving, setSaving] = useState(false);

  const load = (p = page, q = search) => {
    setLoading(true);
    adminApi.clinic.get(vendorId, { page: p, limit: 20, search: q })
      .then((r) => {
        const d = r.data.data || {};
        setVendor(d.vendor);
        setClinicEnabled(d.clinicEnabled !== false);
        setCounts(d.counts || { doctors: 0, patients: 0, visits: 0 });
        setDoctors(d.doctors || []);
        setPatients(d.patients?.data || []);
        setPatientTotal(d.patients?.total || 0);
      })
      .catch(() => toast.error('Failed to load clinic'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (vendorId) load(page, search); }, [vendorId, page]);

  const openDoctor = (d: Doctor) => {
    setEdit(d);
    setForm({
      name: d.name || '',
      specialty: d.specialty || '',
      qualifications: d.qualifications || '',
      consultationMins: d.consultationMins || 15,
      room: d.room || '',
      bio: d.bio || '',
      active: d.active !== false,
    });
  };

  const saveDoctor = async () => {
    if (!edit) return;
    setSaving(true);
    try {
      await adminApi.clinic.updateDoctor(vendorId, edit._id, form);
      toast.success('Doctor updated');
      setEdit(null);
      load();
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (d: Doctor) => {
    if (!window.confirm(`Deactivate ${d.name}?`)) return;
    try {
      await adminApi.clinic.updateDoctor(vendorId, d._id, { active: false });
      toast.success('Doctor deactivated');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const toggleClinic = async () => {
    try {
      await adminApi.clinic.setFeature(vendorId, !clinicEnabled);
      setClinicEnabled(!clinicEnabled);
      toast.success(clinicEnabled ? 'Clinic disabled' : 'Clinic enabled');
    } catch {
      toast.error('Could not update feature');
    }
  };

  const pages = Math.max(1, Math.ceil(patientTotal / 20));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => router.push('/admin/clinic')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{vendor?.companyName || vendor?.name || 'Clinic'}</h1>
          <p className="text-sm text-gray-500">{vendor?.email} · {counts.doctors} doctors · {counts.patients} patients · {counts.visits} visits</p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleClinic}>
          {clinicEnabled ? 'Disable clinic' : 'Enable clinic'}
        </Button>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {([
          { id: 'doctors' as const, label: 'Doctors', icon: <Stethoscope className="w-4 h-4" /> },
          { id: 'patients' as const, label: 'Patients', icon: <Users className="w-4 h-4" /> },
        ]).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium ${
              tab === t.id ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-gray-500'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}

      {!loading && tab === 'doctors' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Specialty</th>
                <th className="px-4 py-3 font-medium">Login</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctors.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-gray-400">No doctors on this roster.</td></tr>}
              {doctors.map((d) => (
                <tr key={d._id}>
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-gray-500">{d.specialty || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{d.userId?.email || '—'}</td>
                  <td className="px-4 py-3">{d.active === false ? <span className="text-red-500">Inactive</span> : <span className="text-emerald-600">Active</span>}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button type="button" className="text-emerald-700 text-xs font-medium" onClick={() => openDoctor(d)}>Edit</button>
                    {d.active !== false && (
                      <button type="button" className="text-red-500 text-xs font-medium" onClick={() => deactivate(d)}>Deactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'patients' && (
        <div className="space-y-3">
          <input
            className={inputClass + ' max-w-sm'}
            placeholder="Search name, phone, UHID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(1, search); } }}
          />
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">UHID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Last visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-gray-400">No patients.</td></tr>}
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.medical?.uhid || '—'}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/clinic/${vendorId}/patients/${p._id}`} className="font-medium text-emerald-700 hover:underline">
                        {p.name || p.phone}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.phone}</td>
                    <td className="px-4 py-3 text-gray-500">{p.lastVisit?.date ? String(p.lastVisit.date).slice(0, 10) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-end gap-2 text-sm">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>Previous</Button>
              <span className="text-gray-500">Page {page} of {pages}</span>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((n) => n + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEdit(null)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold">Edit doctor</h3>
            <input className={inputClass} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={inputClass} placeholder="Specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
            <input className={inputClass} placeholder="Qualifications" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />
            <input className={inputClass} placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            <input className={inputClass} type="number" placeholder="Consultation minutes" value={form.consultationMins} onChange={(e) => setForm({ ...form, consultationMins: Number(e.target.value) })} />
            <textarea className={inputClass} rows={2} placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
              <Button disabled={saving} onClick={saveDoctor}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
