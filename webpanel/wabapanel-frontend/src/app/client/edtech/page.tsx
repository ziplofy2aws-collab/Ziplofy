'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EdtechIndexPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/client/edtech/overview'); }, [router]);
  return null;
}
