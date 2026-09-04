/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare, Send, Users, BarChart3, Bot, Zap, Phone,
  Check, ChevronDown, Menu, X, ArrowRight, Sparkles,
  Play, MousePointerClick, Star, Quote
} from 'lucide-react';

import { useSiteContent } from '@/lib/siteContent';
import { useSiteTheme, SiteThemeData } from '@/lib/siteTheme';
import { normalizeBrandName, isKkhsName } from '@/lib/brand';
import WhatsAppDashboardPreview, { WhatsAppChatPreview, AutomationPreview } from '@/components/WhatsAppDashboardPreview';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`${className} transition-all duration-700 ease-out will-change-transform ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>{children}</div>;
}

function CountUp({ end, suffix = '', decimals = 0, duration = 1800 }: { end: number; suffix?: string; decimals?: number; duration?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => { const p = Math.min(1, (t - t0) / duration); setVal(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-IN')}{suffix}</span>;
}

const TESTIMONIALS = [
  { name: 'Rajesh Sharma', role: 'Founder, StyleKart (E-Commerce)', initials: 'RS', color: 'from-emerald-500 to-teal-600', text: 'Broadcasts + abandoned cart recovery alone paid for the panel in the first month. Our repeat orders on WhatsApp went up 3x.' },
  { name: 'Dr. Priya Mehta', role: 'Director, CityCare Clinic', initials: 'PM', color: 'from-teal-500 to-emerald-600', text: 'Appointment booking and reminders run completely on autopilot now. Patients love replying on WhatsApp instead of calling.' },
  { name: 'Aman Verma', role: 'Agency Owner, GrowthLab Media', initials: 'AV', color: 'from-emerald-600 to-teal-700', text: 'We manage 14 client accounts from one dashboard. The AI chatbot answers 80% of queries before my team even opens the chat.' },
];

export default function HomeLanding({ initialTheme, initialContent }: { initialTheme?: SiteThemeData; initialContent?: any }) {
  const c = useSiteContent(initialContent);
  const h = c.home;
  const theme = useSiteTheme(initialTheme);
  const L = theme.layout || { nav: 'floating', hero: 'centered', features: 'grid' };
  const [settings, setSettings] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const cyclePrice = (plan: any) => {
    const m = plan.price || plan.monthlyPrice || 0;
    if (cycle === 'quarterly') return plan.quarterlyPrice > 0 ? plan.quarterlyPrice : Math.round(m * 3);
    if (cycle === 'yearly') return plan.yearlyPrice > 0 ? plan.yearlyPrice : Math.round(m * 10);
    return m;
  };
  const cycleSuffix = cycle === 'quarterly' ? 'quarter' : cycle === 'yearly' ? 'year' : 'month';
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API}/public/site-settings`).then(r => r.json()).then(d => { if (d.success) setSettings(d.data); }).catch(() => {});
    fetch(`${API}/plans`).then(r => r.json()).then(d => { if (d.success) setPlans(d.data || []); else if (Array.isArray(d)) setPlans(d); }).catch(() => {});
  }, []);

  const rawBizName = settings?.business?.name || 'Codiic Panel';
  const biz = {
    name: normalizeBrandName(rawBizName),
    tagline: settings?.business?.tagline || 'WhatsApp Business Platform',
  };
  const logo = isKkhsName(rawBizName) ? '' : settings?.branding?.logo;
  const faqs = h.faqs;

  const featureIcons = [<MessageSquare key="0" className="w-6 h-6" />, <Send key="1" className="w-6 h-6" />, <Bot key="2" className="w-6 h-6" />, <Zap key="3" className="w-6 h-6" />, <Users key="4" className="w-6 h-6" />, <BarChart3 key="5" className="w-6 h-6" />, <Phone key="6" className="w-6 h-6" />, <MousePointerClick key="7" className="w-6 h-6" />];
  const features = (h.features.items || []).map((f: any, i: number) => ({ ...f, icon: featureIcons[i % featureIcons.length] }));

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#111b21] overflow-x-hidden">
      <style>{`
        @keyframes lp-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .lp-marquee { animation: lp-marquee 28s linear infinite; }
        .lp-marquee:hover { animation-play-state: paused; }
        @keyframes lp-floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .lp-floaty { animation: lp-floaty 5s ease-in-out infinite; }
        .lp-floaty-2 { animation: lp-floaty 6.5s ease-in-out 1s infinite; }
        @keyframes lp-blob { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-30px) scale(1.1); } 66% { transform: translate(-30px,20px) scale(0.92); } }
        .lp-blob { animation: lp-blob 14s ease-in-out infinite; }
        .lp-blob-2 { animation: lp-blob 18s ease-in-out 2s infinite; }
        @keyframes lp-fade-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .lp-hero-in { animation: lp-fade-up .8s ease-out both; }
        .lp-hero-in-1 { animation: lp-fade-up .8s ease-out .1s both; }
        .lp-hero-in-2 { animation: lp-fade-up .8s ease-out .2s both; }
        .lp-hero-in-3 { animation: lp-fade-up .8s ease-out .3s both; }
        .lp-hero-in-4 { animation: lp-fade-up .9s ease-out .45s both; }
        .lp-grid-bg { background-image: linear-gradient(rgba(0,168,132,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,132,.07) 1px, transparent 1px); background-size: 44px 44px; mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%); }
        .lp-card { border-radius: 0.75rem; border: 1px solid #e9edef; background: #fff; box-shadow: 0 1px 2px rgba(11,20,26,0.06), 0 1px 3px rgba(11,20,26,0.04); transition: box-shadow .15s, transform .15s; }
        .lp-card:hover { box-shadow: 0 2px 8px rgba(11,20,26,0.08); }
        .lp-btn-primary { background: #00a884 !important; box-shadow: 0 8px 20px rgba(0,168,132,0.28) !important; }
        .lp-btn-primary:hover { background: #008f72 !important; }
        .lp-band { background: linear-gradient(95deg, #075e54 0%, #128c7e 48%, #00a884 100%) !important; }
      `}</style>
      {/* Navbar — WhatsApp dashboard chrome */}
      <nav className={L.nav === 'floating'
        ? 'fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl bg-white/95 backdrop-blur-xl border border-[#e9edef] rounded-xl shadow-[0_1px_3px_rgba(11,20,26,0.08)] z-50 px-5 py-2.5'
        : 'fixed top-0 left-0 w-full bg-[#00a884] z-50 px-4 py-2.5 shadow-[0_1px_4px_rgba(0,0,0,0.12)]'}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
            {logo ? <img src={logo} alt={biz.name} className="h-10 w-auto" /> : (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${L.nav === 'floating' ? 'bg-[#00a884]' : 'bg-white/15'}`}>
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            )}
            {L.nav !== 'floating' && (
              <span className="hidden sm:block text-white font-bold tracking-tight">{biz.name}</span>
            )}
          </Link>

          {/* Desktop Nav — centered */}
          <div className="hidden lg:flex items-center gap-1">
            {(c.nav.links || []).map((l: any, i: number) => (
              <a key={i} href={l.href} className={L.nav === 'floating'
                ? 'px-3 py-1.5 text-sm font-bold text-[#111b21] hover:text-[#00a884] hover:bg-[#e7f8f4] rounded-lg transition-all'
                : 'px-3 py-1.5 text-sm font-bold text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all'}>{l.label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/auth/login" className={L.nav === 'floating'
              ? 'px-4 py-2 text-sm font-bold text-[#111b21] hover:text-[#00a884] transition-all'
              : 'px-4 py-2 text-sm font-bold text-white/90 hover:text-white transition-all'}>{c.nav.loginText}</Link>
            <Link href="/auth/register" className={L.nav === 'floating'
              ? 'lp-btn-primary px-4 py-2 text-sm font-bold text-white rounded-lg transition-all'
              : 'px-4 py-2 text-sm font-bold text-[#075e54] bg-white rounded-lg hover:bg-[#e7f8f4] transition-all'}>{c.nav.registerText}</Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className={L.nav === 'floating' ? 'lg:hidden p-2 rounded-lg hover:bg-gray-100' : 'lg:hidden p-2 rounded-lg text-white hover:bg-white/10'}>
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenu && (
          <div className={`lg:hidden pt-3 pb-2 mt-2 space-y-1 ${L.nav === 'floating' ? 'border-t border-gray-100/60' : 'border-t border-white/20'}`}>
            {(c.nav.links || []).map((l: any, i: number) => (
              <a key={i} href={l.href} onClick={() => setMobileMenu(false)} className={L.nav === 'floating' ? 'block px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-emerald-50' : 'block px-3 py-2 text-sm font-medium text-white rounded-lg hover:bg-white/10'}>{l.label}</a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" className={L.nav === 'floating' ? 'flex-1 text-center px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg' : 'flex-1 text-center px-4 py-2.5 text-sm font-semibold border border-white/30 text-white rounded-lg'}>{c.nav.loginText}</Link>
              <Link href="/auth/register" className={L.nav === 'floating' ? 'lp-btn-primary flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white rounded-lg' : 'flex-1 text-center px-4 py-2.5 text-sm font-semibold bg-white text-[#075e54] rounded-lg'}>{c.nav.registerText}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero — WhatsApp dashboard ─── */}
      <section className="relative pt-28 md:pt-32 pb-16 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 lp-grid-bg" />
          <div className="lp-blob absolute top-10 left-1/4 w-[520px] h-[520px] bg-[#00a884]/15 rounded-full blur-3xl" />
          <div className="lp-blob-2 absolute top-32 right-1/5 w-[380px] h-[380px] bg-[#25d366]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <div className="lp-hero-in inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#d1f0e8] rounded-full shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-[#00a884]" />
              <span className="text-sm font-medium text-[#075e54]">{h.badge}</span>
            </div>
            <h1 className="lp-hero-in-1 text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.1] tracking-tight mb-6">
              <span className="text-[#111b21]">{h.heroTitle} </span>
              <span className="text-[#00a884]">{h.heroTitleHighlight}</span>
            </h1>
            <p className="lp-hero-in-2 text-lg text-[#667781] mb-8 leading-relaxed">{h.heroSubtitle}</p>
            <div className="lp-hero-in-3 flex flex-col sm:flex-row items-start gap-4 mb-8">
              <Link href="/auth/register" className="lp-btn-primary group px-8 py-4 text-base font-semibold text-white rounded-xl transition-all hover:-translate-y-0.5 flex items-center gap-2">
                {h.ctaPrimary} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="px-8 py-4 text-base font-semibold text-[#111b21] bg-white border border-[#e9edef] rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                <Play className="w-4 h-4 text-[#00a884]" /> {h.ctaSecondary}
              </a>
            </div>
            <div className="lp-hero-in-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#667781]">
              {(h.trustBadges || []).map((t: string, i: number) => (
                <span key={i} className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#00a884]" /> {t}</span>
              ))}
            </div>
          </div>
          <div className="lp-hero-in-4">
            <WhatsAppDashboardPreview />
          </div>
        </div>
      </section>

      {/* Trusted By (Logo Marquee) */}
      <section className="py-14 border-y border-[#e3e3e3] bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-gray-400 tracking-wide uppercase mb-8">{h.trustedByTitle}</p>
          <div className="relative [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="lp-marquee flex w-max items-center gap-10 md:gap-16">
              {[...(h.trustedByLogos || []), ...(h.trustedByLogos || [])].map((b: string, i: number) => (
                typeof b === 'string' && (b.startsWith('/') || b.startsWith('http')) ? (
                  <img key={i} src={b} alt="Trusted company logo" className="h-8 md:h-9 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
                ) : (
                  <div key={i} className="px-6 py-3 bg-gray-100/80 rounded-xl text-sm font-bold text-gray-500 whitespace-nowrap hover:text-emerald-600 hover:bg-emerald-50 transition-colors">{b}</div>
                )
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Automation Section (Cheerio-style: text + image) */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-4">{h.automation.badge}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{h.automation.title} <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{h.automation.titleHighlight}</span></h2>
              <ul className="space-y-4">
                {(h.automation.points || []).map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-emerald-600" /></div>
                    <span className="text-gray-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120} className="relative">
              <AutomationPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* AI Chat Section (image + text) */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-[#f1f1f1]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal delay={120} className="relative order-2 lg:order-1">
              <WhatsAppChatPreview />
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-4">{h.aiChat.badge}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{h.aiChat.title} <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{h.aiChat.titleHighlight}</span></h2>
              <ul className="space-y-4">
                {(h.aiChat.points || []).map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-emerald-600" /></div>
                    <span className="text-gray-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats (Dark) */}
      <section className="relative py-24 px-4 overflow-hidden lp-band">
        <div className="absolute inset-0 pointer-events-none">
          <div className="lp-blob absolute -top-32 left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl" />
          <div className="lp-blob-2 absolute -bottom-40 right-1/4 w-[450px] h-[450px] bg-[#25d366]/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="inline-flex items-center px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-semibold rounded-full mb-4">Proven at scale</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">Numbers that speak <span className="text-[#d9fdd3]">for themselves</span></h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { val: <CountUp end={12000000} suffix="+" />, label: 'Messages delivered', sub: 'across WhatsApp, FB & IG' },
              { val: <CountUp end={500} suffix="+" />, label: 'Businesses onboard', sub: 'from 15+ industries' },
              { val: <CountUp end={98.6} decimals={1} suffix="%" />, label: 'Delivery rate', sub: 'on official Cloud API' },
              { val: <span>24/7</span>, label: 'AI answering', sub: 'chatbots never sleep' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="h-full p-7 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition-all text-center">
                  <p className="text-3xl md:text-4xl font-extrabold text-white mb-2">{s.val}</p>
                  <p className="text-sm font-bold text-white">{s.label}</p>
                  <p className="text-xs text-white/70 mt-1">{s.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-4">{h.features.badge}</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">{h.features.title}<br className="hidden md:block" /> <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{h.features.titleHighlight}</span></h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">{h.features.subtitle}</p>
          </Reveal>

          {L.features === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f: any, i: number) => (
              <div key={i} className="group flex items-start gap-4 p-6 lp-card hover:border-emerald-200 shadow-sm hover:shadow-lg transition-all">
                <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:text-white transition-all duration-300">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
            {features.map((f: any, i: number) => {
              const spans = ['md:col-span-3', 'md:col-span-3', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2'];
              const hero = i % 8 === 0;
              return (
                <Reveal key={i} delay={(i % 4) * 80} className={spans[i % 8]}>
                  <div className={hero
                    ? 'lp-band group h-full p-7 rounded-xl text-white transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden'
                    : 'group h-full p-7 lp-card hover:border-emerald-200 shadow-sm hover:shadow-xl hover:shadow-[0_6px_16px_rgba(16,24,40,0.1)] transition-all duration-300 hover:-translate-y-0.5'}>
                    {hero && <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />}
                    <div className={hero
                      ? 'w-12 h-12 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300'
                      : 'w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:text-white group-hover:scale-110 transition-all duration-300'}>
                      {f.icon}
                    </div>
                    <h3 className={hero ? 'text-lg font-bold mb-2' : 'text-base font-bold text-gray-900 mb-2'}>{f.title}</h3>
                    <p className={hero ? 'text-sm text-emerald-50 leading-relaxed' : 'text-sm text-gray-500 leading-relaxed'}>{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          )}
          <div className="text-center mt-10"><a href="/features" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-emerald-600 border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 transition-all">{h.features.viewAllText} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a></div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-[#f1f1f1]">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-4">{h.steps.badge}</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">{h.steps.title} <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{h.steps.titleHighlight}</span></h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(h.steps.items || []).map((s: any, i: number) => (
              <Reveal key={i} delay={i * 120}>
                <div className="relative h-full p-8 lp-card shadow-sm hover:shadow-xl hover:shadow-[0_6px_16px_rgba(16,24,40,0.1)] hover:-translate-y-0.5 transition-all duration-300 group">
                  <span className="absolute -top-4 left-6 px-3 py-1 lp-btn-primary text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-200/50 group-hover:scale-110 transition-transform">{s.step}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-4">Loved by businesses</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Don&apos;t take our word <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">for it</span></h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Real teams, real results — here&apos;s what they say.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="relative h-full p-7 lp-card shadow-sm hover:shadow-xl hover:shadow-[0_6px_16px_rgba(16,24,40,0.1)] hover:-translate-y-0.5 transition-all duration-300">
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-emerald-100" />
                  <div className="flex items-center gap-1 mb-4">{[0,1,2,3,4].map(j => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">“{t.text}”</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold shadow-md`}>{t.initials}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-4">{h.solutions.badge}</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">{h.solutions.title} <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{h.solutions.titleHighlight}</span></h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(h.solutions.items || []).map((uc: any, i: number) => (
              <Reveal key={i} delay={(i % 3) * 100}>
                <div className="h-full p-6 lp-card hover:border-emerald-200 shadow-sm hover:shadow-xl hover:shadow-[0_6px_16px_rgba(16,24,40,0.1)] hover:-translate-y-0.5 transition-all duration-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{uc.title}</h3>
                  <ul className="space-y-2">
                    {(uc.items || []).map((item: string, j: number) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-500">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-gradient-to-b from-white to-[#f1f1f1]">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-4">{h.pricing.badge}</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">{h.pricing.title} <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{h.pricing.titleHighlight}</span> {h.pricing.titleAfter}</h2>
            <p className="text-lg text-gray-500">{h.pricing.subtitle}</p>

            {/* Toggle */}
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1.5 mt-6 shadow-sm">
              <button onClick={() => setCycle('monthly')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${cycle === 'monthly' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>Monthly</button>
              <button onClick={() => setCycle('quarterly')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${cycle === 'quarterly' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>Quarterly</button>
              <button onClick={() => setCycle('yearly')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${cycle === 'yearly' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>Yearly <span className={cycle === 'yearly' ? 'text-emerald-100 ml-1' : 'text-emerald-500 ml-1'}>-20%</span></button>
            </div>
          </Reveal>

          {plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {plans.filter((p: any) => p.isActive !== false).slice(0, 4).map((plan: any, i: number, arr: any[]) => {
                const pop = arr.some((p: any) => p.isPopular) ? !!plan.isPopular : i === 1;
                return (
                <div key={plan._id || i} className={`relative p-7 rounded-2xl border ${pop ? 'border-emerald-300 bg-gradient-to-b from-emerald-50 to-white shadow-[0_4px_14px_rgba(5,150,105,0.14)] scale-[1.02]' : 'border-[#e3e3e3] bg-white shadow-sm'} transition-all duration-300 hover:shadow-xl hover:shadow-[0_6px_16px_rgba(16,24,40,0.1)] hover:-translate-y-0.5`}>
                  {pop && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 lp-btn-primary text-white text-xs font-bold rounded-full">{h.pricing.popularBadge}</span>}
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mt-1 mb-4">{plan.description || 'Best for growing businesses'}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">₹{cyclePrice(plan)}</span>
                    <span className="text-gray-400 text-sm">/{cycleSuffix}</span>
                    {plan.trialDays > 0 && plan.price > 0 && (
                      <div className="mt-2"><span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">{plan.trialDays}-day Free Trial</span></div>
                    )}
                  </div>
                  <Link href="/auth/register" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${pop ? 'lp-btn-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'}`}>
                    {h.pricing.buttonText}
                  </Link>
                  {(plan.featureList?.length || plan.features) && (
                    <ul className="mt-6 space-y-2.5">
                      {(Array.isArray(plan.featureList) && plan.featureList.length ? plan.featureList : (Array.isArray(plan.features) ? plan.features : [])).map((f: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">Loading plans...</div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{h.faqTitle}</h2>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((faq: any, i: number) => (
              <div key={i} className={`border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 ${openFaq === i ? 'border-emerald-200 shadow-md' : 'border-gray-100 hover:border-emerald-100'}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="font-semibold text-gray-900 text-sm md:text-base">{faq.q || faq.question}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-emerald-500' : 'text-gray-400'}`} />
                </button>
                <div className={`grid transition-all duration-300 ease-out ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a || faq.answer}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <Reveal className="max-w-4xl mx-auto">
        <div className="lp-band relative overflow-hidden rounded-2xl p-10 md:p-16 text-center shadow-[0_12px_32px_rgba(5,150,105,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
          <div className="lp-blob absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <h2 className="relative text-3xl md:text-4xl font-extrabold text-white mb-4">{h.cta.title}</h2>
          <p className="relative text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">{h.cta.subtitle}</p>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">{h.cta.primaryText}</Link>
            <Link href="/contact" className="w-full sm:w-auto px-8 py-4 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">{h.cta.secondaryText}</Link>
          </div>
        </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e3e3e3] bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                {logo ? <img src={logo} alt={biz.name} className="h-7 w-auto" /> : (
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg flex items-center justify-center"><MessageSquare className="w-4 h-4 text-white" /></div>
                )}
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">{biz.tagline || c.footer.tagline}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">{c.footer.productTitle}</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-emerald-600 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a></li>
                <li><Link href="/blog" className="hover:text-emerald-600 transition-colors">Blog</Link></li>
                <li><Link href="/knowledge-base" className="hover:text-emerald-600 transition-colors">Knowledge Base</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">{c.footer.companyTitle}</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/about" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
                <li><Link href="/team" className="hover:text-emerald-600 transition-colors">Our Team</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-600 transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="/data-deletion" className="hover:text-emerald-600 transition-colors">Data Deletion</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">{c.footer.connectTitle}</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {settings?.social?.facebook && <li><a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">Facebook</a></li>}
                {settings?.social?.twitter && <li><a href={settings.social.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">Twitter / X</a></li>}
                {settings?.social?.instagram && <li><a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">Instagram</a></li>}
                {settings?.social?.linkedin && <li><a href={settings.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">LinkedIn</a></li>}
                {settings?.social?.youtube && <li><a href={settings.social.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">YouTube</a></li>}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} {biz.name}. {c.footer.copyrightText}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-emerald-600">Privacy</Link>
              <Link href="/terms" className="hover:text-emerald-600">Terms</Link>
              <Link href="/data-deletion" className="hover:text-emerald-600">Data Deletion</Link>
              <Link href="/about" className="hover:text-emerald-600">About</Link>
              <Link href="/team" className="hover:text-emerald-600">Team</Link>
              <Link href="/contact" className="hover:text-emerald-600">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
      {settings?.whatsappWidget?.enabled && settings?.whatsappWidget?.phone && (
        <a
          href={`https://wa.me/${String(settings.whatsappWidget.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(settings.whatsappWidget.message || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-[60] group flex items-center gap-2 rounded-full bg-[#25D366] text-white pl-3.5 pr-3.5 py-3.5 shadow-lg hover:shadow-2xl hover:pr-5 transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current shrink-0" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {settings.whatsappWidget.greeting && (
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 group-hover:max-w-[220px]">{settings.whatsappWidget.greeting}</span>
          )}
        </a>
      )}
    </div>
  );
}
