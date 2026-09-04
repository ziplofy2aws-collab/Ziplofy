'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, BookOpen } from 'lucide-react';
import { adminContentColumnClass } from '@/components/layout/dashboard-ui';

export interface GuideItem {
  q: string;
  a: string[];
}
export interface GuideSection {
  id: string;
  title: string;
  intro?: string;
  items: GuideItem[];
}

function fill(text: string, app: string) {
  return text.replace(/\{app\}/g, app);
}

export default function GuideView({
  app,
  heading,
  subheading,
  sections,
  supportHref = '/client/support',
}: {
  app: string;
  heading: string;
  subheading: string;
  sections: GuideSection[];
  supportHref?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (it) =>
            it.q.toLowerCase().includes(q) ||
            it.a.some((p) => p.toLowerCase().includes(q)) ||
            s.title.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [q, sections]);

  const totalMatches = filtered.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">
              {fill(heading, app)}
            </h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            {fill(subheading, app)}
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-10 -mx-1 rounded-xl border border-admin-border bg-white/95 px-3 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.06)] backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-subdued" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the guide — e.g. connect WhatsApp, invoice, flow…"
            className="w-full rounded-lg border border-admin-border bg-[#f6f6f7] py-2.5 pl-9 pr-4 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30"
          />
        </div>
        {q && (
          <p className="mt-1.5 px-0.5 text-[12px] text-admin-text-secondary">
            {totalMatches} result{totalMatches === 1 ? '' : 's'} for “{query}”
          </p>
        )}
      </div>

      {!q && (
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[12px] font-medium text-admin-text-secondary transition-colors hover:bg-[#f6f6f7] hover:text-admin-text"
            >
              {s.title}
            </a>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="rounded-xl border border-admin-border bg-white px-6 py-14 text-center shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
          <BookOpen className="mx-auto mb-3 h-9 w-9 text-admin-border" />
          <p className="text-[13px] text-admin-text-secondary">
            No results found. Try another keyword, or open a Support ticket.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {filtered.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <div className="mb-2 flex items-center gap-2.5 px-0.5">
              <h2 className="text-[15px] font-semibold text-admin-text">{s.title}</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-admin-border to-transparent" />
            </div>
            {s.intro && (
              <p className="mb-3 text-[13px] text-admin-text-secondary">{fill(s.intro, app)}</p>
            )}
            <div className="overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)]">
              {s.items.map((it, i) => {
                const key = `${s.id}-${i}`;
                const isOpen = !!open[key] || !!q;
                const isLast = i === s.items.length - 1;
                return (
                  <div
                    key={key}
                    className={isLast ? '' : 'border-b border-admin-divider'}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f6f6f7]"
                    >
                      <span className="text-[13px] font-medium text-admin-text">
                        {fill(it.q, app)}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-admin-text-subdued transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="space-y-2 border-t border-admin-divider bg-[#fafafa] px-4 pb-4 pt-0">
                        {it.a.map((p, j) => (
                          <p
                            key={j}
                            className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-admin-text-secondary first:mt-3"
                          >
                            {fill(p, app)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="pb-4 pt-4 text-center text-[12px] text-admin-text-subdued">
        Still stuck? Open a{' '}
        <Link href={supportHref} className="font-semibold text-[#005bd3] hover:underline">
          Support
        </Link>{' '}
        ticket and our team will help you out.
      </p>
    </div>
  );
}
