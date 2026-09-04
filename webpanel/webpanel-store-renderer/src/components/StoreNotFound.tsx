type StoreNotFoundProps = {
  hostname?: string;
  message?: string | null;
};

/**
 * Beautiful empty state when subdomain / host does not map to a webpanel store.
 */
export function StoreNotFound({ hostname, message }: StoreNotFoundProps) {
  const host = hostname || (typeof window !== 'undefined' ? window.location.host : '');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1220] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(900px 420px at 15% 10%, rgba(59,130,246,0.28), transparent 55%), radial-gradient(700px 360px at 90% 80%, rgba(14,165,233,0.18), transparent 50%), linear-gradient(180deg, #0b1220 0%, #111827 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.35) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(circle at center, black 20%, transparent 75%)',
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
          <span className="text-3xl font-light tracking-tight text-slate-200" aria-hidden>
            :(
          </span>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/90">
          Web Panel Store Renderer
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Sorry, no store found
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-slate-300">
          We couldn&apos;t find an Informatic website for this address. The subdomain may be wrong,
          expired, or not published yet.
        </p>

        {host ? (
          <p className="mt-5 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-[12px] text-slate-200">
            {host}
          </p>
        ) : null}

        {message ? (
          <p className="mt-4 max-w-lg text-[13px] text-slate-400">{message}</p>
        ) : null}

        <div className="mt-10 grid w-full max-w-lg gap-3 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-sky-300/90">Try this</p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
              Open{' '}
              <code className="rounded bg-black/30 px-1.5 py-0.5 text-[11px] text-sky-100">
                {'{subdomain}.localhost:3003'}
              </code>{' '}
              using the subdomain from your Online Store page.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-sky-300/90">Need help?</p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
              Create or switch stores in the web panel account menu, then copy the generated store
              link.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="http://localhost:3002/client/online-store"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-900 shadow-lg shadow-black/20 transition hover:bg-slate-100"
          >
            Open Online Store
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/10"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
