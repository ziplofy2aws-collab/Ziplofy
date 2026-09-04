'use client';
import React from 'react';
import { Check, CheckCheck, MoreVertical, Paperclip, Search, Send, Smile } from 'lucide-react';

const DOODLE =
  "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c8c0b6' stroke-width='1.4' opacity='0.32'%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3Cpath d='M70 15 l10 10 M80 15 l-10 10'/%3E%3Crect x='95' y='40' width='14' height='10' rx='2'/%3E%3Cpath d='M15 70 q6 -10 12 0 q-6 10 -12 0'/%3E%3Ccircle cx='60' cy='60' r='5'/%3E%3Cpath d='M40 100 h16 M48 92 v16'/%3E%3Cpath d='M90 90 a8 8 0 1 0 8 8'/%3E%3C/g%3E%3C/svg%3E\")";

const CONTACTS = [
  { n: 'Priya Mehta', t: 'Appointment confirmed for 4pm', time: '10:24', unread: 2, active: true },
  { n: 'StyleKart Orders', t: 'Your order #4821 is packed', time: '09:51', unread: 0, active: false },
  { n: 'Aman Verma', t: 'Can we schedule a demo?', time: 'Yesterday', unread: 1, active: false },
  { n: 'CityCare Clinic', t: 'Reminder sent to 24 patients', time: 'Yesterday', unread: 0, active: false },
];

export default function WhatsAppDashboardPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#d1d7db] bg-white shadow-[0_16px_40px_rgba(11,20,26,0.16)]">
      <div className="flex items-center justify-between bg-[#00a884] px-4 py-2.5 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-tight">Inbox</p>
            <p className="text-[10px] text-white/80">WhatsApp Business</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-white/85">
          <span className="hidden rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold sm:inline">Connected</span>
          <Search className="h-4 w-4" />
          <MoreVertical className="h-4 w-4" />
        </div>
      </div>

      <div className="grid grid-cols-[38%_62%] min-h-[340px] sm:min-h-[400px]">
        <div className="border-r border-[#e9edef] bg-white">
          <div className="border-b border-[#e9edef] bg-[#f0f2f5] px-3 py-2">
            <div className="flex h-8 items-center gap-2 rounded-lg bg-white px-2.5 text-[#667781]">
              <Search className="h-3.5 w-3.5" />
              <span className="text-[11px]">Search conversations</span>
            </div>
          </div>
          {CONTACTS.map((c) => (
            <div
              key={c.n}
              className={`flex items-center gap-3 border-b border-[#f0f2f5] px-3 py-2.5 ${c.active ? 'bg-[#f0f2f5]' : 'bg-white'}`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dfe5e7] text-[11px] font-bold text-[#54656f]">
                {c.n.split(' ').map((p) => p[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[13px] font-semibold text-[#111b21]">{c.n}</p>
                  <span className={`text-[10px] ${c.unread ? 'font-semibold text-[#00a884]' : 'text-[#667781]'}`}>{c.time}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1">
                  <p className="min-w-0 flex-1 truncate text-[11px] text-[#667781]">{c.t}</p>
                  {c.unread > 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#25d366] px-1 text-[9px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex min-w-0 flex-col bg-[#efeae2]" style={{ backgroundImage: DOODLE }}>
          <div className="flex items-center gap-3 border-b border-[#d1d7db] bg-[#f0f2f5] px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfe5e7] text-[11px] font-bold text-[#54656f]">PM</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-[#111b21]">Priya Mehta</p>
              <p className="text-[10px] text-[#00a884]">online</p>
            </div>
            <Search className="h-4 w-4 text-[#54656f]" />
            <MoreVertical className="h-4 w-4 text-[#54656f]" />
          </div>

          <div className="flex flex-1 flex-col justify-end gap-2 px-4 py-4">
            <div className="max-w-[78%] self-start rounded-lg rounded-tl-none bg-white px-3 py-2 shadow-sm">
              <p className="text-[13px] leading-snug text-[#111b21]">Hi, I need to reschedule my appointment to 4pm today.</p>
              <p className="mt-1 text-right text-[10px] text-[#667781]">10:21</p>
            </div>
            <div className="max-w-[78%] self-end rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 shadow-sm">
              <p className="text-[13px] leading-snug text-[#111b21]">Done — booked for 4:00 PM. You&apos;ll get a reminder 30 minutes before.</p>
              <p className="mt-1 flex items-center justify-end gap-0.5 text-[10px] text-[#667781]">
                10:22 <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
              </p>
            </div>
            <div className="max-w-[78%] self-end rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 shadow-sm">
              <p className="text-[13px] leading-snug text-[#111b21]">Catalog and payment link sent. Reply YES to confirm.</p>
              <p className="mt-1 flex items-center justify-end gap-0.5 text-[10px] text-[#667781]">
                10:24 <Check className="h-3 w-3" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#f0f2f5] px-3 py-2">
            <Smile className="h-5 w-5 text-[#54656f]" />
            <Paperclip className="h-5 w-5 text-[#54656f]" />
            <div className="flex h-9 flex-1 items-center rounded-lg bg-white px-3 text-[12px] text-[#667781]">Type a message</div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00a884] text-white">
              <Send className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppChatPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#d1d7db] bg-white shadow-[0_12px_28px_rgba(11,20,26,0.12)]">
      <div className="flex items-center gap-2 bg-[#075e54] px-4 py-2.5 text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">AI</div>
        <div>
          <p className="text-[13px] font-semibold">Support Bot</p>
          <p className="text-[10px] text-emerald-100">Always online</p>
        </div>
      </div>
      <div className="flex min-h-[280px] flex-col justify-end gap-2 px-4 py-5" style={{ backgroundColor: '#efeae2', backgroundImage: DOODLE }}>
        <div className="max-w-[80%] self-start rounded-lg rounded-tl-none bg-white px-3 py-2 text-[13px] shadow-sm">What are your delivery timings?</div>
        <div className="max-w-[80%] self-end rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-[13px] shadow-sm">
          We deliver 9 AM – 9 PM, 7 days a week. Track your order anytime on WhatsApp.
        </div>
        <div className="max-w-[80%] self-end rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-[13px] shadow-sm">Want me to share today&apos;s catalog?</div>
      </div>
    </div>
  );
}

export function AutomationPreview() {
  const steps = [
    { t: 'Keyword', d: 'Customer says “price”' },
    { t: 'AI qualify', d: 'Score lead automatically' },
    { t: 'Broadcast', d: 'Send catalog + payment' },
  ];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#d1d7db] bg-[#f0f2f5] p-5 shadow-[0_12px_28px_rgba(11,20,26,0.12)]">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#00a884]">Workflow</p>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={s.t} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-xs font-bold text-white">{i + 1}</div>
            <div className="flex-1 rounded-xl border border-[#e9edef] bg-white px-4 py-3">
              <p className="text-sm font-semibold text-[#111b21]">{s.t}</p>
              <p className="text-xs text-[#667781]">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
