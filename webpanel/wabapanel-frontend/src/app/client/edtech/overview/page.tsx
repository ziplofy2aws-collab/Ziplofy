'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { edtechApi } from '@/lib/api';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

export default function EdtechOverviewPage() {
  const [counts, setCounts] = useState({ courses: 0, teachers: 0, students: 0, batches: 0, enrollments: 0 });

  useEffect(() => {
    edtechApi.dashboard().then((r) => setCounts(r.data.data || counts)).catch(() => {});
  }, []);

  const cards = [
    { label: 'Courses', value: counts.courses, href: '/client/edtech/courses' },
    { label: 'Batches', value: counts.batches, href: '/client/edtech/batches' },
    { label: 'Students', value: counts.students, href: '/client/edtech/students' },
    { label: 'Teachers', value: counts.teachers, href: '/client/edtech/teachers' },
    { label: 'Active enrollments', value: counts.enrollments, href: '/client/edtech/batches' },
  ];

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-admin-text-secondary" />
        <h1 className="text-[20px] font-semibold text-admin-text">Institute</h1>
      </div>
      <p className="text-[13px] text-admin-text-secondary">Courses, batches, students, teachers, and daily attendance for this workspace.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={dashboardCardShell}>
            <p className="text-[12px] text-admin-text-secondary">{c.label}</p>
            <p className="mt-1 text-[22px] font-semibold text-admin-text">{c.value}</p>
          </Link>
        ))}
      </div>
      <Link href="/client/edtech/attendance" className="text-[13px] font-medium text-[#005bd3]">Mark today’s attendance</Link>
    </div>
  );
}
