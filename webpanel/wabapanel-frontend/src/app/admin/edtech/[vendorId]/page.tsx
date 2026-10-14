'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { adminApi } from '@/lib/api';

interface Teacher { _id: string; name: string; subject?: string; active?: boolean; userId?: { email?: string } | null; }
interface Course { _id: string; name: string; grade?: string; feeAmount?: number; }
interface Batch { _id: string; name: string; course?: { name?: string }; teacher?: { name?: string }; }
interface Student { _id: string; enrollmentNo?: string; grade?: string; contact?: { name?: string; phone?: string } | null; }

export default function AdminEdtechVendorPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = String(params.vendorId || '');
  const [tab, setTab] = useState<'teachers' | 'students' | 'batches'>('teachers');
  const [vendor, setVendor] = useState<{ name: string; email: string; companyName?: string } | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const load = () => {
    adminApi.edtech.get(vendorId).then((r) => {
      const d = r.data.data || {};
      setVendor(d.vendor);
      setEnabled(d.edtechEnabled !== false);
      setTeachers(d.teachers || []);
      setStudents(d.students || []);
      setBatches(d.batches || []);
      setCourses(d.courses || []);
    }).catch(() => toast.error('Failed to load institute'));
  };
  useEffect(() => { if (vendorId) load(); }, [vendorId]);

  const toggle = async () => {
    try {
      await adminApi.edtech.setFeature(vendorId, !enabled);
      setEnabled(!enabled);
      toast.success(enabled ? 'Edtech disabled' : 'Edtech enabled');
    } catch { toast.error('Could not update'); }
  };

  const deactivate = async (t: Teacher) => {
    try {
      await adminApi.edtech.updateTeacher(vendorId, t._id, { active: false });
      toast.success('Teacher deactivated');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => router.push('/admin/edtech')}><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{vendor?.companyName || vendor?.name || 'Institute'}</h1>
          <p className="text-sm text-gray-500">{vendor?.email} · {courses.length} courses · {batches.length} batches</p>
        </div>
        <Button variant="outline" size="sm" onClick={toggle}>{enabled ? 'Disable edtech' : 'Enable edtech'}</Button>
      </div>
      <div className="flex gap-1 border-b">
        {(['teachers', 'students', 'batches'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`px-4 py-2 text-sm capitalize ${tab === t ? 'border-b-2 border-emerald-600 text-emerald-700' : 'text-gray-500'}`}>{t}</button>
        ))}
      </div>
      {tab === 'teachers' && (
        <div className="bg-white rounded-xl border divide-y">
          {teachers.length === 0 && <p className="p-4 text-sm text-gray-400">No teachers.</p>}
          {teachers.map((t) => (
            <div key={t._id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{t.name} · {t.subject || '—'} · {t.active === false ? 'Inactive' : 'Active'}{t.userId?.email ? ` · ${t.userId.email}` : ''}</span>
              {t.active !== false && <button type="button" className="text-xs text-red-500" onClick={() => deactivate(t)}>Deactivate</button>}
            </div>
          ))}
        </div>
      )}
      {tab === 'students' && (
        <div className="bg-white rounded-xl border divide-y">
          {students.length === 0 && <p className="p-4 text-sm text-gray-400">No students.</p>}
          {students.map((s) => (
            <div key={s._id} className="px-4 py-3 text-sm">{s.enrollmentNo || '—'} · {s.contact?.name || s.contact?.phone} · {s.grade || ''}</div>
          ))}
        </div>
      )}
      {tab === 'batches' && (
        <div className="bg-white rounded-xl border divide-y">
          {batches.length === 0 && <p className="p-4 text-sm text-gray-400">No batches.</p>}
          {batches.map((b) => (
            <div key={b._id} className="px-4 py-3 text-sm">{b.name} · {b.course?.name || 'Course'} · {b.teacher?.name || 'No teacher'}</div>
          ))}
        </div>
      )}
    </div>
  );
}
