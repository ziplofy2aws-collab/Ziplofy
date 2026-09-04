'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft, LayoutDashboard, BarChart3, Users, Tags, Layers, Milestone,
  FileText, Send, Clock, Zap, Keyboard, ShoppingBag,
  Package, Share2, FormInput, Link2, Phone, UserPlus, CreditCard,
  Receipt, Settings, Kanban, CalendarCheck, ChevronDown, ChevronUp,
  Menu, X, LogOut, Database, FileDown, MessageCircle, ImageIcon, Wrench, BookOpen,
  Megaphone, Wallet, Palette, Brain, Plug, Sparkles, PiggyBank, Shield,
  Puzzle, LifeBuoy, QrCode, History, PhoneCall, Paintbrush, Store, List, Scale,
} from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTelegram, FaEnvelope } from 'react-icons/fa';
import { useAuthStore } from '@/stores/authStore';
import { displayPersonName } from '@/lib/brand';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import {
  adminSidebarAsideClass,
  adminSidebarChildItemClass,
  adminSidebarNavItemClass,
} from './admin-sidebar';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

function hrefMatches(current: string, href: string): boolean {
  if (current === href) return true;
  const qIdx = href.indexOf('?');
  if (qIdx === -1) {
    return current === href || current.startsWith(`${href}/`);
  }
  const path = href.slice(0, qIdx);
  const [curPath, curQuery = ''] = current.split('?');
  if (curPath !== path) return false;
  const required = new URLSearchParams(href.slice(qIdx + 1));
  const actual = new URLSearchParams(curQuery);
  for (const [k, v] of required.entries()) {
    if (actual.get(k) !== v) return false;
  }
  return true;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/client/dashboard' },
  { label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, href: '/client/analytics' },
  {
    label: 'Inbox',
    icon: <MessageCircle className="w-5 h-5" />,
    children: [
      { label: 'WhatsApp Inbox', href: '/client/chat?channel=whatsapp', icon: <FaWhatsapp className="w-4 h-4 text-green-600" /> },
      { label: 'WhatsApp QR Inbox', href: '/client/chat?channel=whatsapp_qr', icon: <FaWhatsapp className="w-4 h-4 text-emerald-500" /> },
      { label: 'Instagram Inbox', href: '/client/chat?channel=instagram', icon: <FaInstagram className="w-4 h-4 text-pink-600" /> },
      { label: 'Facebook Inbox', href: '/client/chat?channel=facebook', icon: <FaFacebook className="w-4 h-4 text-blue-600" /> },
      { label: 'Telegram Bot Inbox', href: '/client/chat?channel=telegram', icon: <FaTelegram className="w-4 h-4 text-sky-500" /> },
      { label: 'Personal Telegram Inbox', href: '/client/chat?channel=telegram_personal', icon: <FaTelegram className="w-4 h-4 text-sky-600" /> },
      { label: 'Email Inbox', href: '/client/chat?channel=email', icon: <FaEnvelope className="w-4 h-4 text-orange-500" /> },
    ],
  },
  {
    label: 'Campaigns',
    icon: <Send className="w-5 h-5" />,
    children: [
      { label: 'Message Templates', href: '/client/templates', icon: <FileText className="w-4 h-4" /> },
      { label: 'Broadcast', href: '/client/broadcasts', icon: <Send className="w-4 h-4" /> },
      { label: 'Smart Broadcast', href: '/client/smart-broadcast', icon: <Zap className="w-4 h-4" /> },
      { label: 'Drip Campaigns', href: '/client/save-money/drip', icon: <Clock className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Save Money',
    icon: <PiggyBank className="w-5 h-5" />,
    children: [
      { label: 'Preset Templates', href: '/client/save-money/templates', icon: <FileText className="w-4 h-4" /> },
      { label: 'Preset Campaigns', href: '/client/save-money/campaigns', icon: <Send className="w-4 h-4" /> },
      { label: 'Web WhatsApp Campaigns', href: '/client/save-money/qr-campaigns', icon: <QrCode className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Contacts',
    icon: <Users className="w-5 h-5" />,
    children: [
      { label: 'Contact Directory', href: '/client/contacts', icon: <Users className="w-4 h-4" /> },
      { label: 'Segments', href: '/client/segments', icon: <Layers className="w-4 h-4" /> },
      { label: 'Labels', href: '/client/tags', icon: <Tags className="w-4 h-4" /> },
      { label: 'Stage/Pipeline', href: '/client/stages', icon: <Milestone className="w-4 h-4" /> },
      { label: 'Data Fields', href: '/client/data-fields', icon: <Database className="w-4 h-4" /> },
      { label: 'Import Logs', href: '/client/import-logs', icon: <FileDown className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Lead CRM',
    icon: <Milestone className="w-5 h-5" />,
    children: [
      { label: 'Lead Dashboard', href: '/client/lead-dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Lead Report', href: '/client/call-center', icon: <PhoneCall className="w-4 h-4" /> },
      { label: 'CRM 360', href: '/client/crm', icon: <History className="w-4 h-4" /> },
    ],
  },
  { label: 'Pipeline Board', icon: <Kanban className="w-5 h-5" />, href: '/client/pipelines' },
  {
    label: 'Automation',
    icon: <Zap className="w-5 h-5" />,
    children: [
      { label: 'Automation Flows', href: '/client/automations', icon: <Zap className="w-4 h-4" /> },
      { label: 'Bulk AI Calls', href: '/client/bulk-calls', icon: <Phone className="w-4 h-4" /> },
      { label: 'Bot Flow Builder', href: '/client/bot-flows', icon: <Zap className="w-4 h-4" /> },
      { label: 'AI Follow-ups', href: '/client/followups', icon: <Sparkles className="w-4 h-4" /> },
      { label: 'Flow Builder', href: '/client/automations/flows', icon: <Zap className="w-4 h-4" /> },
      { label: 'Quick Replies', href: '/client/quick-replies', icon: <MessageCircle className="w-4 h-4" /> },
      { label: 'Keyword Triggers', href: '/client/keywords', icon: <Keyboard className="w-4 h-4" /> },
      { label: 'Appointments', href: '/client/appointments', icon: <CalendarCheck className="w-4 h-4" /> },
      { label: 'Tickets', href: '/client/tickets', icon: <MessageCircle className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Leads & Commerce',
    icon: <ShoppingBag className="w-5 h-5" />,
    children: [
      { label: 'All Leads', href: '/client/leads', icon: <FormInput className="w-4 h-4" /> },
      { label: 'Lead Gen Forms', href: '/client/forms', icon: <FormInput className="w-4 h-4" /> },
      { label: 'Facebook Leads', href: '/client/facebook-leads', icon: <Share2 className="w-4 h-4" /> },
      { label: 'Product Catalogs', href: '/client/catalogs', icon: <ShoppingBag className="w-4 h-4" /> },
      { label: 'Order Management', href: '/client/orders', icon: <Package className="w-4 h-4" /> },
      { label: 'Short Links', href: '/client/short-links', icon: <Link2 className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Online Store',
    icon: <Store className="w-5 h-5" />,
    href: '/client/online-store',
    children: [
      { label: 'Themes', href: '/client/themes', icon: <Paintbrush className="w-4 h-4" /> },
      { label: 'Media Library', href: '/client/online-store/media-library', icon: <ImageIcon className="w-4 h-4" /> },
      { label: 'Blogs', href: '/client/online-store/blogs', icon: <BookOpen className="w-4 h-4" /> },
      { label: 'Pages', href: '/client/online-store/pages', icon: <FileText className="w-4 h-4" /> },
      { label: 'Menus', href: '/client/online-store/menus', icon: <List className="w-4 h-4" /> },
      { label: 'Policies', href: '/client/online-store/policies', icon: <Scale className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Channels',
    icon: <Plug className="w-5 h-5" />,
    children: [
      { label: 'Channel Config', href: '/client/channels', icon: <Plug className="w-4 h-4" /> },
      { label: 'WhatsApp Settings', href: '/client/whatsapp', icon: <FaWhatsapp className="w-4 h-4 text-green-600" /> },
    ],
  },
  {
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    children: [
      { label: 'Organization Teams', href: '/client/teams', icon: <Users className="w-4 h-4" /> },
      { label: 'Agents', href: '/client/agents', icon: <UserPlus className="w-4 h-4" /> },
      { label: 'Integrations', href: '/client/integrations', icon: <Puzzle className="w-4 h-4" /> },
      { label: 'Chat Appearance', href: '/client/chat-appearance', icon: <Palette className="w-4 h-4" /> },
      { label: 'AI Settings', href: '/client/ai-settings', icon: <Brain className="w-4 h-4" /> },
      { label: 'AI Calling Settings', href: '/client/ai-calling', icon: <Phone className="w-4 h-4" /> },
      { label: 'Knowledge Base', href: '/client/knowledge-base', icon: <BookOpen className="w-4 h-4" /> },
      { label: 'Audit Log', href: '/client/audit-log', icon: <Shield className="w-4 h-4" /> },
      { label: 'Business Settings', href: '/client/settings', icon: <Wrench className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Subscription & Plans',
    icon: <CreditCard className="w-5 h-5" />,
    children: [
      { label: 'Subscription Plans', href: '/client/subscriptions', icon: <Sparkles className="w-4 h-4" /> },
      { label: 'Billing & Wallet', href: '/client/billing', icon: <Wallet className="w-4 h-4" /> },
      { label: 'Transactions', href: '/client/transactions', icon: <Receipt className="w-4 h-4" /> },
      { label: 'Invoices', href: '/client/invoices', icon: <FileText className="w-4 h-4" /> },
    ],
  },
  { label: 'CTWA Ads', icon: <Megaphone className="w-5 h-5" />, href: '/client/ctwa-ads' },
  { label: 'Instagram Auto DM', icon: <FaInstagram className="w-5 h-5 text-pink-600" />, href: '/client/instagram-auto-dm' },
  { label: 'API & Developers', icon: <Plug className="w-5 h-5" />, href: '/client/api-docs' },
  { label: 'Support', icon: <LifeBuoy className="w-5 h-5" />, href: '/client/support' },
  { label: 'User Guide', icon: <BookOpen className="w-5 h-5" />, href: '/client/user-guide' },
];

// Client route -> admin feature-control key (admin can switch these off per client)
const ADMIN_FEATURE_MAP: Record<string, string> = {
  '/client/chat?channel=whatsapp': 'chat',
  '/client/chat?channel=whatsapp_qr': 'whatsappQr',
  '/client/chat?channel=instagram': 'inboxInstagram',
  '/client/chat?channel=facebook': 'inboxFacebook',
  '/client/chat?channel=telegram': 'inboxTelegram',
  '/client/chat?channel=telegram_personal': 'inboxTelegram',
  '/client/chat?channel=email': 'inboxEmail',
  '/client/contacts': 'contacts',
  '/client/segments': 'segments',
  '/client/tags': 'tags',
  '/client/data-fields': 'dataFields',
  '/client/import-logs': 'importLogs',
  '/client/badges': 'badges',
  '/client/save-money/templates': 'presetTemplates',
  '/client/save-money/campaigns': 'presetCampaigns',
  '/client/save-money/qr-campaigns': 'qrCampaigns',
  '/client/tickets': 'tickets',
  '/client/predefined-actions': 'predefinedActions',
  '/client/response-resources': 'responseResources',
  '/client/online-store/media-library': 'mediaLibrary',
  '/client/media-library': 'mediaLibrary',
  '/client/instagram-auto-dm': 'igAutoDm',
  '/client/chat-appearance': 'chatAppearance',
  '/client/audit-log': 'auditLog',
  '/client/templates': 'templates',
  '/client/broadcasts': 'broadcasts',
  '/client/smart-broadcast': 'smartBroadcast',
  '/client/save-money/drip': 'drips',
  '/client/followups': 'followups',
  '/client/bot-flows': 'botFlows',
  '/client/automations': 'automations',
  '/client/automations/flows': 'automations',
  '/client/quick-replies': 'quickReplies',
  '/client/keywords': 'keywords',
  '/client/appointments': 'appointments',
  '/client/events': 'events',
  '/client/leads': 'leads',
  '/client/forms': 'forms',
  '/client/facebook-leads': 'leads',
  '/client/catalogs': 'ecommerce',
  '/client/orders': 'ecommerce',
  '/client/short-links': 'shortLinks',
  '/client/pipelines': 'crm',
  '/client/crm': 'crm',
  '/client/call-center': 'crm',
  '/client/lead-dashboard': 'crm',
  '/client/analytics': 'analytics',
  '/client/teams': 'teams',
  '/client/agents': 'teams',
  '/client/integrations': 'integrations',
  '/client/ai-settings': 'aiChatbot',
  '/client/ai-calling': 'aiCalling',
  '/client/bulk-calls': 'aiCalling',
  '/client/knowledge-base': 'knowledgeBase',
  '/client/ctwa-ads': 'ctwaAds',
  '/client/api-docs': 'apiAccess',
};

// Section label -> permission module key (granular agent permissions)
export const MODULE_KEY_MAP: Record<string, string> = {
  'Dashboard': 'dashboard',
  'Analytics': 'analytics',
  'Inbox': 'inbox',
  'Contacts': 'contacts',
  'Lead CRM': 'pipelines',
  'CRM 360': 'pipelines',
  'Calling Center': 'pipelines',
  'Pipeline Board': 'pipelines',
  'Campaigns': 'campaigns',
  'Save Money': 'campaigns',
  'Automation': 'automation',
  'Leads & Commerce': 'commerce',
  'Channels': 'channels',
  'Settings': 'settings',
  'Subscription & Plans': 'billing',
  'Media Library': 'media',
  'CTWA Ads': 'campaigns',
  'API & Developers': 'developer',
};

// Permission tree for the agent Permissions modal: each grantable section with
// its module key and sub-pages (by href). Granting the module key unlocks the
// whole section; granting individual child hrefs unlocks only those sub-pages.
export const PERMISSION_TREE = navItems
  .filter(s => MODULE_KEY_MAP[s.label])
  .map(s => ({
    label: s.label,
    moduleKey: MODULE_KEY_MAP[s.label],
    children: (s.children || []).map(c => ({ label: c.label, href: c.href })),
  }));

export default function ClientSidebar() {
  const pathname = usePathname();
  // Avoid useSearchParams() here — it suspends this tree under <Suspense fallback={null}>
  // and remounts the rail on every navigation (which felt like "sidebar died").
  const [search, setSearch] = useState('');
  useEffect(() => {
    const sync = () => setSearch(window.location.search || '');
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [pathname]);
  const currentHref = pathname + search;

  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => { setPortalReady(true); }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const { logout, user, features } = useAuthStore();
  const { t } = useI18n();
  const [isImpersonating, setIsImpersonating] = useState(false);
  useEffect(() => { setIsImpersonating(!!localStorage.getItem('adminToken')); }, []);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadUnread = () => api.get('/conversations/unread-counts')
      .then(r => setUnreadCounts(r.data.data || {}))
      .catch(() => {});
    loadUnread();
    const t = setInterval(loadUnread, 30000);
    window.addEventListener('focus', loadUnread);
    return () => { clearInterval(t); window.removeEventListener('focus', loadUnread); };
  }, []);

  const unreadForHref = (href: string) => {
    const m = href.match(/[?&]channel=([a-z_]+)/);
    return m ? unreadCounts[m[1]] || 0 : 0;
  };

  // Filter nav items based on admin per-client feature controls
  const itemVisible = (href: string) => {
    const adminKey = ADMIN_FEATURE_MAP[href];
    if (adminKey && features[adminKey] === false) return false;
    return true;
  };
  const unlockedNav = useMemo(() => navItems.map(section => ({
    ...section,
    children: (section.children || []).filter(item => itemVisible(item.href)),
  })).filter(section => {
    if (section.href) return itemVisible(section.href);
    return (section.children || []).length > 0;
  }), [features]);

  // Granular agent permissions: when an agent has module permissions set,
  // only the allowed modules are shown
  const perms = (user as unknown as { permissions?: string[] })?.permissions || [];
  const allowedCh = (user as unknown as { allowedChannels?: string[] })?.allowedChannels || [];
  const filteredNav = useMemo(() => {
    const permNav = (user?.role === 'agent' && perms.length > 0)
      ? unlockedNav
          .filter(section => {
            const key = MODULE_KEY_MAP[section.label];
            if (!key) return true;
            if (perms.includes(key)) return true;
            return (section.children || []).some(c => perms.includes(c.href));
          })
          .map(section => {
            const key = MODULE_KEY_MAP[section.label];
            if (!key || perms.includes(key) || !section.children) return section;
            return { ...section, children: section.children.filter(c => perms.includes(c.href)) };
          })
      : unlockedNav;

    if (!(user?.role === 'agent' && allowedCh.length > 0)) return permNav;
    return permNav.map(section => section.label !== 'Inbox' ? section : {
      ...section,
      children: (section.children || []).filter(item => {
        const m = item.href.match(/channel=([a-z_]+)/);
        return !m || allowedCh.includes(m[1]);
      }),
    }).filter(section => section.href ? true : (section.children || []).length > 0);
  }, [unlockedNav, user?.role, perms, allowedCh]);

  // Stable key so we only expand when the active section actually changes —
  // previously a fresh array every render caused setState → re-render forever
  // after the first navigation into a nested page (sidebar looked "dead").
  const defaultExpandedKey = useMemo(
    () => filteredNav
      .filter((sec) =>
        (sec.href ? hrefMatches(currentHref, sec.href) : false) ||
        sec.children?.some((c) => hrefMatches(currentHref, c.href))
      )
      .map((sec) => sec.label)
      .join('\0'),
    [filteredNav, currentHref]
  );

  useEffect(() => {
    if (!defaultExpandedKey) return;
    const labels = defaultExpandedKey.split('\0').filter(Boolean);
    setExpandedSections((prev) => {
      let changed = false;
      const next = [...prev];
      for (const label of labels) {
        if (!next.includes(label)) {
          next.push(label);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [defaultExpandedKey]);

  const toggleSection = useCallback((label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  }, []);

  const isSectionOpen = useCallback(
    (label: string) => expandedSections.includes(label),
    [expandedSections]
  );

  const sidebar = (
    <div className="flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto">
        <ul className="m-0 list-none p-2">
          {filteredNav.map((section) => {
            const hasKids = !!section.children?.length;
            const openSection = isSectionOpen(section.label);
            const leafActive = section.href ? hrefMatches(currentHref, section.href) : false;

            const activeChildIndex = hasKids
              ? (section.children || []).findIndex((c) => hrefMatches(currentHref, c.href))
              : -1;

            const lineHeight =
              hasKids && openSection && activeChildIndex >= 0
                ? 40 + 28 * (activeChildIndex + 1)
                : 0;

            return (
              <li key={section.label} className="relative mb-0.5">
                {hasKids && openSection && lineHeight > 0 && (
                  <div
                    className="absolute left-[10px] top-0 z-0 w-0.5 bg-admin-border"
                    style={{ height: `${lineHeight}px` }}
                    aria-hidden
                  />
                )}

                {section.href && !hasKids ? (
                  <Link
                    href={section.href}
                    onClick={() => {
                      closeMobile();
                      setSearch('');
                    }}
                    className={adminSidebarNavItemClass(leafActive)}
                  >
                    <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{section.icon}</span>
                    <span className="flex-1">{t(section.label)}</span>
                  </Link>
                ) : (
                  <>
                    {section.href ? (
                      <div className="flex items-center gap-0.5">
                        <Link
                          href={section.href}
                          onClick={() => {
                            closeMobile();
                            setSearch('');
                            if (!openSection) toggleSection(section.label);
                          }}
                          className={`${adminSidebarNavItemClass(
                            leafActive || activeChildIndex >= 0
                          )} min-w-0 flex-1`}
                        >
                          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{section.icon}</span>
                          <span className="flex-1">{t(section.label)}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleSection(section.label)}
                          className="shrink-0 rounded-md p-2 text-admin-text-subdued hover:bg-admin-row-hover"
                          aria-label={openSection ? 'Collapse' : 'Expand'}
                        >
                          {openSection ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleSection(section.label)}
                        className={adminSidebarNavItemClass(false)}
                      >
                        <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{section.icon}</span>
                        <span className="flex-1">{t(section.label)}</span>
                        <span className="shrink-0 text-admin-text-subdued">
                          {openSection ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      </button>
                    )}

                    <div
                      className={`relative overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                        openSection
                          ? 'max-h-[2000px] opacity-100'
                          : 'pointer-events-none max-h-0 opacity-0'
                      }`}
                    >
                      <ul className="relative z-10 m-0 list-none">
                        {section.children?.map((item) => {
                          const childActive = hrefMatches(currentHref, item.href);
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => {
                                  closeMobile();
                                  const q = item.href.includes('?') ? item.href.slice(item.href.indexOf('?')) : '';
                                  setSearch(q);
                                }}
                                className={adminSidebarChildItemClass(childActive)}
                              >
                                <span className="shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{item.icon}</span>
                                <span className="flex-1">{t(item.label)}</span>
                                {unreadForHref(item.href) > 0 && (
                                  <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-admin-text text-admin-surface text-[10px] font-semibold flex items-center justify-center">
                                    {unreadForHref(item.href) > 99 ? '99+' : unreadForHref(item.href)}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {isImpersonating && (
        <div className="px-2 py-2 border-t border-admin-border">
          <button
            type="button"
            onClick={() => {
              const at = localStorage.getItem('adminToken');
              if (at) {
                localStorage.setItem('token', at);
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/dashboard';
              }
            }}
            className={`${adminSidebarNavItemClass(false)} bg-admin-surface`}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Back to Admin</span>
          </button>
        </div>
      )}

      <div className="mt-auto border-t border-admin-border px-2 py-3">
        <div className="flex items-center gap-2">
          <Link
            href="/client/settings"
            onClick={closeMobile}
            className={`${adminSidebarNavItemClass(pathname.startsWith('/client/settings'))} flex-1 min-w-0 !py-1.5`}
            title="My Profile"
          >
            <div className="w-7 h-7 rounded-full bg-admin-fill flex items-center justify-center text-admin-text text-xs font-semibold shrink-0">
              {(displayPersonName(user?.name) || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-admin-text truncate leading-tight">{displayPersonName(user?.name) || 'User'}</p>
              <p className="text-xs text-admin-text-secondary truncate leading-tight">{user?.email || ''}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            title="Logout"
            className="p-2 rounded-lg text-admin-text-subdued hover:bg-admin-fill hover:text-admin-text transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-[4.25rem] left-3 z-[1110] p-2 bg-admin-surface border border-admin-border rounded-lg shadow-sm text-admin-text"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Spacer keeps main content offset; the real rail is portaled to <body>. */}
      <div className="hidden w-[240px] shrink-0 lg:block" aria-hidden />

      {portalReady
        ? createPortal(
            <>
              {mobileOpen && (
                <div
                  className="lg:hidden fixed inset-0 top-14 z-[1090] bg-black/50"
                  onClick={() => setMobileOpen(false)}
                />
              )}
              <aside
                className={`${adminSidebarAsideClass} ${
                  mobileOpen ? 'translate-x-0' : 'max-lg:-translate-x-full'
                }`}
              >
                {sidebar}
              </aside>
            </>,
            document.body
          )
        : null}
    </>
  );
}
