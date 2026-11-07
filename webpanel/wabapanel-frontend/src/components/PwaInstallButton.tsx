'use client';
import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const getDeferred = () =>
  (window as unknown as { deferredPwaPrompt?: BeforeInstallPromptEvent }).deferredPwaPrompt;

export default function PwaInstallButton({
  variant = 'light',
  iconOnly = false,
}: {
  variant?: 'light' | 'dark';
  /** Compact icon button — avoids overlapping the header search capsule. */
  iconOnly?: boolean;
}) {
  const [installed, setInstalled] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone
    ) {
      setInstalled(true);
      return;
    }
    if (getDeferred()) setCanPrompt(true);
    const onInstallable = () => setCanPrompt(true);
    const onInstalled = () => setInstalled(true);
    window.addEventListener('pwa-installable', onInstallable);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('pwa-installable', onInstallable);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    const deferred = getDeferred();
    if (deferred) {
      deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
      (window as unknown as { deferredPwaPrompt?: BeforeInstallPromptEvent }).deferredPwaPrompt =
        undefined;
      setCanPrompt(false);
    } else {
      setShowHelp(true);
    }
  };

  const btnClass =
    variant === 'dark'
      ? 'admin-header-control flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-white transition-colors'
      : iconOnly
        ? 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#e8efe9] bg-white text-[#00896F] shadow-[0_1px_2px_rgba(15,61,46,0.06)] transition-all duration-200 hover:border-[#cfe8dc] hover:bg-[#eef8f0] hover:shadow-sm'
        : 'flex items-center gap-1.5 rounded-full bg-[#00896F] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#007a63]';

  return (
    <div className="relative z-[1] shrink-0 isolate">
      <button
        type="button"
        onClick={handleClick}
        title="Install Codiic Panel as an app"
        aria-label="Install App"
        className={btnClass}
      >
        <Download className="h-4 w-4" strokeWidth={2} />
        {!iconOnly && <span className="hidden sm:inline">Install App</span>}
      </button>
      {showHelp && !canPrompt && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-white/50 bg-white/70 p-4 shadow-[0_16px_40px_rgba(15,61,46,0.14)] backdrop-blur-2xl">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-[#101828]">
              <Smartphone className="h-4 w-4 text-[#00896F]" /> Install App
            </h4>
            <button type="button" onClick={() => setShowHelp(false)} aria-label="Close">
              <X className="h-4 w-4 text-[#8a9a93]" />
            </button>
          </div>
          <ul className="list-disc space-y-1.5 pl-4 text-xs text-[#6b7a74]">
            <li>
              <b>iPhone / iPad (Safari):</b> Tap Share, then &quot;Add to Home Screen&quot;.
            </li>
            <li>
              <b>Android (Chrome):</b> Tap ⋮, then &quot;Install app&quot;.
            </li>
            <li>
              <b>Desktop (Chrome / Edge):</b> Use the install icon in the address bar.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
