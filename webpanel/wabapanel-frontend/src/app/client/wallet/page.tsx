"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WalletPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/client/billing"); }, [router]);
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-admin-text" />
    </div>
  );
}
