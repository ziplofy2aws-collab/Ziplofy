'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, Link2, Unlink, ArrowUpDown, Zap, Copy, Send, CheckCircle2, Clock, XCircle, Search, Pencil, Trash2, Plus, Download, BookOpen, Puzzle, X } from 'lucide-react';
import { integrationApi } from '@/lib/api';
import { INTEGRATION_GUIDES } from '@/lib/integrationGuides';
import toast from 'react-hot-toast';
import { adminContentColumnClass, dashboardCardShell } from '@/components/layout/dashboard-ui';

const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-admin-text px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-[#f6f6f7] disabled:cursor-not-allowed disabled:opacity-50';
const inputClass =
  'w-full rounded-lg border border-admin-border bg-white px-3 py-2 text-[13px] text-admin-text placeholder:text-admin-text-subdued focus:outline-none focus:ring-2 focus:ring-[#005bd3]/30';
const labelClass = 'mb-1 block text-[12px] font-medium text-admin-text-secondary';
const cardClass = `${dashboardCardShell} !p-5`;
const modalOverlayClass = 'fixed inset-0 z-[1300] flex items-center justify-center p-4 sm:p-6';
const modalPanelClass =
  'relative z-10 flex max-h-[min(90vh,880px)] w-full flex-col overflow-hidden rounded-xl border border-admin-border bg-white shadow-[0_16px_48px_rgba(16,24,40,0.18)]';

interface IntegrationDef {
  id: string; name: string; description: string; icon: string; category: string; color: string;
  fields: { key: string; label: string; type: string; placeholder: string }[];
}

const integrationDefs: IntegrationDef[] = [
  { id: 'google-calendar', name: 'Google Calendar', description: 'Auto-create calendar events when appointments are booked', icon: 'GC', category: 'productivity', color: '#4285F4',
    fields: [{ key: 'apiKey', label: 'Service Account JSON Key', type: 'textarea', placeholder: 'Paste service account JSON...' }, { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'e.g. yourname@gmail.com or calendar ID from settings' }] },
  { id: 'google-sheets', name: 'Google Sheets', description: 'Sync contacts and data with Google Sheets', icon: 'GS', category: 'productivity', color: '#0F9D58',
    fields: [{ key: 'apiKey', label: 'Service Account JSON Key', type: 'textarea', placeholder: 'Paste service account JSON...' }, { key: 'sheetId', label: 'Sheet ID', type: 'text', placeholder: 'Google Sheet ID from URL' }] },
  { id: 'shopify', name: 'Shopify', description: 'Sync orders and customers from Shopify', icon: 'S', category: 'ecommerce', color: '#7AB55C',
    fields: [{ key: 'storeUrl', label: 'Store URL', type: 'text', placeholder: 'mystore.myshopify.com' }, { key: 'apiKey', label: 'Admin API Access Token', type: 'password', placeholder: 'shpat_...' }] },
  { id: 'woocommerce', name: 'WooCommerce', description: 'Connect your WooCommerce store', icon: 'WC', category: 'ecommerce', color: '#96588A',
    fields: [{ key: 'storeUrl', label: 'Store URL', type: 'text', placeholder: 'https://yourstore.com' }, { key: 'apiKey', label: 'Consumer Key', type: 'password', placeholder: 'ck_...' }, { key: 'apiSecret', label: 'Consumer Secret', type: 'password', placeholder: 'cs_...' }] },
  { id: 'hubspot', name: 'HubSpot', description: 'Sync contacts with HubSpot CRM', icon: 'HS', category: 'crm', color: '#FF7A59',
    fields: [{ key: 'apiKey', label: 'Private App Token', type: 'password', placeholder: 'pat-...' }] },
  { id: 'mailchimp', name: 'Mailchimp', description: 'Sync email marketing contacts', icon: 'MC', category: 'marketing', color: '#FFE01B',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'xxxxxxxx-us21' }] },
  { id: 'razorpay', name: 'Razorpay', description: 'Process payments via Razorpay', icon: 'RP', category: 'payments', color: '#0051FF',
    fields: [{ key: 'apiKey', label: 'Key ID', type: 'text', placeholder: 'rzp_live_...' }, { key: 'apiSecret', label: 'Key Secret', type: 'password', placeholder: 'Secret...' }, { key: 'webhookSecret', label: 'Webhook Secret (for auto-confirm messages)', type: 'password', placeholder: 'Same secret you set in Razorpay Dashboard → Webhooks' }] },
  { id: 'stripe', name: 'Stripe', description: 'Accept payments via Stripe', icon: 'ST', category: 'payments', color: '#635BFF',
    fields: [{ key: 'apiKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...' }] },
  { id: 'google-analytics', name: 'Google Analytics', description: 'Track campaign performance', icon: 'GA', category: 'analytics', color: '#E37400',
    fields: [{ key: 'measurementId', label: 'Measurement ID', type: 'text', placeholder: 'G-XXXXXXXXXX' }] },
  { id: 'webhook', name: 'Custom Webhook', description: 'Send data to any URL via webhooks', icon: 'WH', category: 'developer', color: '#6366F1',
    fields: [{ key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://your-server.com/webhook' }] },
  { id: 'zapier', name: 'Zapier', description: 'Connect with 5000+ apps via Zapier', icon: 'Z', category: 'automation', color: '#FF4A00',
    fields: [{ key: 'webhookUrl', label: 'Zapier Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/...' }] },
  { id: 'make', name: 'Make (Integromat)', description: 'Automate workflows with Make', icon: 'MK', category: 'automation', color: '#6D00CC',
    fields: [{ key: 'webhookUrl', label: 'Make Webhook URL', type: 'text', placeholder: 'https://hook.make.com/...' }] },
  { id: 'calendly', name: 'Calendly', description: 'Schedule appointments via Calendly', icon: 'CL', category: 'productivity', color: '#006BFF',
    fields: [{ key: 'apiKey', label: 'Personal Access Token', type: 'password', placeholder: 'eyJ...' }] },
  { id: 'pabbly', name: 'Pabbly Connect', description: 'Automate workflows with Pabbly Connect', icon: 'PC', category: 'automation', color: '#16A34A',
    fields: [{ key: 'webhookUrl', label: 'Pabbly Webhook URL', type: 'text', placeholder: 'https://connect.pabbly.com/workflow/sendwebhookdata/...' }] },
  { id: 'n8n', name: 'n8n', description: 'Automate workflows with self-hosted n8n', icon: 'N8', category: 'automation', color: '#EA4B71',
    fields: [{ key: 'webhookUrl', label: 'n8n Webhook URL', type: 'text', placeholder: 'https://your-n8n.com/webhook/...' }] },
  { id: 'ifttt', name: 'IFTTT', description: 'Trigger IFTTT applets from panel events', icon: 'IF', category: 'automation', color: '#000000',
    fields: [{ key: 'webhookUrl', label: 'IFTTT Webhook URL', type: 'text', placeholder: 'https://maker.ifttt.com/trigger/{event}/with/key/{key}' }] },
  { id: 'salesforce', name: 'Salesforce', description: 'Sync leads and contacts with Salesforce CRM', icon: 'SF', category: 'crm', color: '#00A1E0',
    fields: [{ key: 'instanceUrl', label: 'Instance URL', type: 'text', placeholder: 'https://yourorg.my.salesforce.com' }, { key: 'apiKey', label: 'Access Token', type: 'password', placeholder: 'Access token...' }] },
  { id: 'zoho-crm', name: 'Zoho CRM', description: 'Sync contacts and deals with Zoho CRM', icon: 'ZC', category: 'crm', color: '#E42527',
    fields: [{ key: 'apiKey', label: 'OAuth Access Token', type: 'password', placeholder: '1000.xxxx...' }, { key: 'apiDomain', label: 'API Domain', type: 'text', placeholder: 'https://www.zohoapis.com (or .in / .eu)' }] },
  { id: 'pipedrive', name: 'Pipedrive', description: 'Sync contacts and deals with Pipedrive', icon: 'PD', category: 'crm', color: '#017737',
    fields: [{ key: 'apiKey', label: 'API Token', type: 'password', placeholder: 'API token from Pipedrive settings' }, { key: 'companyDomain', label: 'Company Domain', type: 'text', placeholder: 'yourcompany (from yourcompany.pipedrive.com)' }] },
  { id: 'bitrix24', name: 'Bitrix24', description: 'Sync leads with Bitrix24 CRM', icon: 'B24', category: 'crm', color: '#2FC7F7',
    fields: [{ key: 'webhookUrl', label: 'Inbound Webhook URL', type: 'text', placeholder: 'https://yourcompany.bitrix24.com/rest/1/xxxx/' }] },
  { id: 'paypal', name: 'PayPal', description: 'Accept payments worldwide via PayPal', icon: 'PP', category: 'payments', color: '#003087',
    fields: [{ key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'PayPal Client ID' }, { key: 'apiSecret', label: 'Client Secret', type: 'password', placeholder: 'Client Secret...' }] },
  { id: 'paytm', name: 'Paytm', description: 'Accept payments via Paytm', icon: 'PT', category: 'payments', color: '#00BAF2',
    fields: [{ key: 'merchantId', label: 'Merchant ID', type: 'text', placeholder: 'Paytm MID' }, { key: 'apiSecret', label: 'Merchant Key', type: 'password', placeholder: 'Merchant key...' }] },
  { id: 'phonepe', name: 'PhonePe', description: 'Accept payments via PhonePe', icon: 'PE', category: 'payments', color: '#5F259F',
    fields: [{ key: 'merchantId', label: 'Merchant ID', type: 'text', placeholder: 'PhonePe MID' }, { key: 'apiSecret', label: 'Salt Key', type: 'password', placeholder: 'Salt key...' }, { key: 'saltIndex', label: 'Salt Index', type: 'text', placeholder: '1' }] },
  { id: 'cashfree', name: 'Cashfree', description: 'Accept payments via Cashfree', icon: 'CF', category: 'payments', color: '#7C3AED',
    fields: [{ key: 'clientId', label: 'App ID', type: 'text', placeholder: 'Cashfree App ID' }, { key: 'apiSecret', label: 'Secret Key', type: 'password', placeholder: 'Secret key...' }] },
  { id: 'payu', name: 'PayU', description: 'Accept payments via PayU', icon: 'PU', category: 'payments', color: '#00A651',
    fields: [{ key: 'merchantKey', label: 'Merchant Key', type: 'text', placeholder: 'PayU Merchant Key' }, { key: 'merchantSalt', label: 'Merchant Salt', type: 'password', placeholder: 'Merchant Salt...' }] },
  { id: 'paystack', name: 'Paystack', description: 'Accept payments in Africa via Paystack', icon: 'PS', category: 'payments', color: '#09A5DB',
    fields: [{ key: 'apiKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...' }] },
  { id: 'mercadopago', name: 'Mercado Pago', description: 'Accept payments in Latin America via Mercado Pago', icon: 'MP', category: 'payments', color: '#009EE3',
    fields: [{ key: 'apiKey', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' }] },
  { id: 'openai', name: 'OpenAI / Custom GPT', description: 'Use your own OpenAI key or custom GPT endpoint for AI replies', icon: 'AI', category: 'ai', color: '#10A37F',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-...' }, { key: 'endpointUrl', label: 'Custom Endpoint URL (optional)', type: 'text', placeholder: 'https://your-gpt-server.com/v1/chat/completions' }, { key: 'model', label: 'Model (optional)', type: 'text', placeholder: 'gpt-4o-mini' }] },
  // Lead sources — connect, copy your webhook URL into the platform, leads auto-reply on WhatsApp
  { id: 'indiamart', name: 'IndiaMART', description: 'Auto-send WhatsApp to every IndiaMART enquiry instantly', icon: 'IM', category: 'leads', color: '#128807', fields: [] },
  { id: 'justdial', name: 'Justdial', description: 'Auto-send WhatsApp to every Justdial lead instantly', icon: 'JD', category: 'leads', color: '#F26722', fields: [] },
  { id: 'tradeindia', name: 'TradeIndia', description: 'Auto-send WhatsApp to TradeIndia enquiries', icon: 'TI', category: 'leads', color: '#C8102E', fields: [] },
  { id: 'exportersindia', name: 'ExportersIndia', description: 'Auto-send WhatsApp to ExportersIndia enquiries', icon: 'EI', category: 'leads', color: '#1B5E9E', fields: [] },
  { id: 'facebook-leads', name: 'Facebook Lead Ads', description: 'Instant WhatsApp welcome to Facebook/Instagram lead form submissions', icon: 'FB', category: 'leads', color: '#1877F2', fields: [] },
  { id: 'google-lead-forms', name: 'Google Lead Form Ads', description: 'Auto WhatsApp for Google & YouTube Ads lead forms', icon: 'GL', category: 'leads', color: '#EA4335', fields: [] },
  { id: 'linkedin-ads', name: 'LinkedIn Lead Gen', description: 'Auto WhatsApp for LinkedIn Lead Gen form leads', icon: 'LI', category: 'leads', color: '#0A66C2', fields: [] },
  { id: 'twitter-ads', name: 'X (Twitter) Ads', description: 'Auto WhatsApp for X lead generation cards', icon: 'X', category: 'leads', color: '#000000', fields: [] },
  { id: '99acres', name: '99acres', description: 'Auto WhatsApp to property enquiries from 99acres', icon: '99', category: 'leads', color: '#0078DB', fields: [] },
  { id: 'magicbricks', name: 'MagicBricks', description: 'Auto WhatsApp to property leads from MagicBricks', icon: 'MB', category: 'leads', color: '#D8232A', fields: [] },
  { id: 'housing', name: 'Housing.com', description: 'Auto WhatsApp to leads from Housing.com', icon: 'HO', category: 'leads', color: '#6B21A8', fields: [] },
  { id: 'olx', name: 'OLX', description: 'Auto WhatsApp to OLX ad enquiries', icon: 'OX', category: 'leads', color: '#002F34', fields: [] },
  { id: 'tagmango', name: 'TagMango', description: 'Auto WhatsApp to TagMango leads and customers', icon: 'TM', category: 'leads', color: '#FF6B00', fields: [] },
  { id: 'leadsquared', name: 'LeadSquared', description: 'Auto WhatsApp to leads pushed from LeadSquared', icon: 'LS', category: 'leads', color: '#2E7CF6', fields: [] },
  { id: 'gohighlevel', name: 'GoHighLevel', description: 'Auto WhatsApp to GoHighLevel contacts/leads', icon: 'GH', category: 'leads', color: '#188BF6', fields: [] },
  { id: 'wordpress-forms', name: 'WordPress Forms', description: 'Elementor, CF7, WPForms, Gravity — auto WhatsApp on form submit', icon: 'WP', category: 'forms', color: '#21759B', fields: [] },
  { id: 'google-forms', name: 'Google Forms', description: 'Auto WhatsApp on Google Form responses', icon: 'GF', category: 'forms', color: '#7248B9', fields: [] },
  { id: 'typeform', name: 'Typeform', description: 'Auto WhatsApp on Typeform submissions', icon: 'TF', category: 'forms', color: '#262627', fields: [] },
  { id: 'jotform', name: 'Jotform', description: 'Auto WhatsApp on Jotform submissions', icon: 'JF', category: 'forms', color: '#0A1551', fields: [] },
  { id: 'landing-pages', name: 'Landing Pages', description: 'Auto WhatsApp from any landing page form', icon: 'LP', category: 'forms', color: '#059669', fields: [] },
  { id: 'flexifunnels', name: 'FlexiFunnels', description: 'Auto WhatsApp to FlexiFunnels leads and buyers', icon: 'FF', category: 'forms', color: '#7C3AED', fields: [] },
  { id: 'website', name: 'Own Website Webhook', description: 'Send leads from your own website to WhatsApp instantly', icon: 'WS', category: 'forms', color: '#334155', fields: [] },
  { id: 'shiprocket', name: 'Shiprocket', description: 'Shipment status updates on WhatsApp — shipped, out for delivery', icon: 'SR', category: 'shipping', color: '#7B2CBF', fields: [] },
];

// Integrations that support event automation (webhook in → WhatsApp template out)
const automationTypes = new Set(['indiamart', 'justdial', 'tradeindia', 'exportersindia', '99acres', 'magicbricks', 'housing', 'olx', 'tagmango', 'google-lead-forms', 'wordpress-forms', 'google-forms', 'typeform', 'jotform', 'landing-pages', 'flexifunnels', 'website', 'linkedin-ads', 'twitter-ads', 'leadsquared', 'gohighlevel', 'facebook-leads', 'shopify', 'shiprocket', 'woocommerce']);

// Per-source, honest setup guidance shown in the Automation modal.
// `steps` = how to make it work; `note` = provider dependency/limitation.
const SETUP_HINTS: Record<string, { steps: string[]; note?: string }> = {
  indiamart: {
    steps: [
      'IndiaMART Seller panel → Lead Manager → "Import/Export Leads" → API / Push API section.',
      'Enable the Push API and paste the Webhook URL above as the destination CRM URL.',
      'Submit + approve the "Lead Thank You" template below and turn Auto-send ON.',
    ],
    note: 'IndiaMART only exposes lead push/pull on eligible seller plans. If your plan has no API option, ask your IndiaMART relationship manager to enable "Push API to CRM" — otherwise leads cannot flow automatically.',
  },
  justdial: {
    steps: [
      'Contact your Justdial account/relationship manager and request "Lead Webhook / API push".',
      'Give them the Webhook URL above as your CRM endpoint.',
      'Submit + approve the template below and turn Auto-send ON.',
    ],
    note: 'Justdial does NOT offer self-serve lead APIs. Webhook push is enabled manually by Justdial only for paid/verified advertisers on request. Without their approval, automatic lead capture is not possible.',
  },
  'facebook-leads': {
    steps: [
      'Meta App Dashboard → your App → Webhooks → subscribe to the "leadgen" field on your Page.',
      'Use the Webhook URL and Verify Token above in the Meta webhook config.',
      'Submit + approve the template below and turn Auto-send ON.',
    ],
    note: 'Requires a Meta App with pages_manage_metadata + leads_retrieval permissions and the Page connected. New apps need Meta App Review before leads flow in production.',
  },
  'google-lead-forms': { steps: ['Google Ads → your Lead form asset → "Webhook integration".', 'Paste the Webhook URL above (Key = leave blank or as shown).', 'Submit + approve the template and turn Auto-send ON.'] },
  'linkedin-ads': { steps: ['LinkedIn Campaign Manager → Lead Gen Forms → connect via a webhook tool (Zapier/Make) pointing to the URL above.'], note: 'LinkedIn has no native webhook; a connector (Zapier/Make) is required to forward leads to this URL.' },
  'twitter-ads': { steps: ['Forward X (Twitter) lead cards via a connector (Zapier/Make) to the Webhook URL above.'], note: 'X provides no direct webhook; use a connector to forward leads.' },
  tradeindia: { steps: ['TradeIndia Seller panel → Lead/Enquiry API settings → set the Webhook URL above.', 'Submit + approve the template and turn Auto-send ON.'], note: 'Requires TradeIndia lead API access on your plan.' },
  exportersindia: { steps: ['ExportersIndia lead/enquiry forwarding → set the Webhook URL above.'], note: 'Requires ExportersIndia lead forwarding/API access on your plan.' },
  '99acres': { steps: ['99acres CRM/lead push settings → set the Webhook URL above.'], note: 'Lead push availability depends on your 99acres subscription.' },
  magicbricks: { steps: ['MagicBricks lead API/CRM push → set the Webhook URL above.'], note: 'Lead push availability depends on your MagicBricks plan.' },
  housing: { steps: ['Housing.com lead push/CRM settings → set the Webhook URL above.'], note: 'Lead push availability depends on your Housing.com plan.' },
  olx: { steps: ['OLX lead forwarding → set the Webhook URL above (or via a connector).'], note: 'OLX has no public webhook; a connector may be required.' },
  leadsquared: { steps: ['LeadSquared → Automation/Webhook → POST new leads to the Webhook URL above.'] },
  gohighlevel: { steps: ['GoHighLevel → Workflows → Webhook action → POST to the Webhook URL above.'] },
  tagmango: { steps: ['TagMango → integrations/webhook → POST leads to the Webhook URL above.'] },
  'wordpress-forms': { steps: ['Elementor / CF7 / WPForms / Gravity → add a Webhook action → POST submissions to the URL above (map phone & name fields).'] },
  'google-forms': { steps: ['Google Form → Apps Script → onFormSubmit → POST responses to the Webhook URL above.'] },
  typeform: { steps: ['Typeform → Connect → Webhooks → add the Webhook URL above.'] },
  jotform: { steps: ['Jotform → Settings → Integrations → Webhooks → add the Webhook URL above.'] },
  'landing-pages': { steps: ['Any landing page form → POST the submission (with phone & name) to the Webhook URL above.'] },
  flexifunnels: { steps: ['FlexiFunnels → form/webhook settings → POST leads to the Webhook URL above.'] },
  website: { steps: ['Your website form backend → POST { name, phone, email } to the Webhook URL above.'] },
  shiprocket: { steps: ['Shiprocket → Settings → Webhooks → add the Webhook URL above for shipment status updates.'] },
  shopify: { steps: ['Shopify Admin → Settings → Notifications → Webhooks → add the URL above for orders/create, orders/fulfilled, refunds/create.'] },
  woocommerce: { steps: ['WooCommerce → Settings → Advanced → Webhooks → add the URL above for order.created / order.updated.'] },
};

// Returns the combined setup steps for an app (credential guide + lead-source hint).
function guideForApp(id: string): { steps: string[]; keysUrl?: string; note?: string } | null {
  const g = INTEGRATION_GUIDES[id];
  const h = SETUP_HINTS[id];
  if (!g && !h) return null;
  return {
    steps: [...(g?.steps || []), ...(h?.steps || [])],
    keysUrl: g?.keysUrl,
    note: g?.note || h?.note,
  };
}

const esc = (s: string) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Builds a printable HTML doc (used for "Download PDF") for the given app ids.
function buildGuideHtml(ids: string[]): string {
  const sections = ids.map((id) => {
    const def = integrationDefs.find((d) => d.id === id);
    if (!def) return '';
    const g = guideForApp(id);
    const steps = g?.steps?.length
      ? `<ol>${g.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`
      : '<p class="muted">Enter the required keys in the panel and click Connect.</p>';
    const keys = g?.keysUrl ? `<p class="muted">Get keys: <span>${esc(g.keysUrl)}</span></p>` : '';
    const fields = def.fields.length
      ? `<p class="muted">Fields to fill: ${def.fields.map((f) => esc(f.label)).join(', ')}</p>` : '';
    const note = g?.note ? `<p class="note"><b>Note:</b> ${esc(g.note)}</p>` : '';
    return `<section><h2>${esc(def.name)}</h2><p class="desc">${esc(def.description)}</p>${fields}${keys}<h3>Steps</h3>${steps}${note}</section>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Integration Setup Guide</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;color:#111;padding:28px;max-width:820px;margin:0 auto}
      h1{font-size:22px;margin-bottom:4px}
      .lead{color:#555;margin-top:0}
      section{page-break-inside:avoid;border-top:1px solid #eee;padding:16px 0}
      h2{font-size:17px;margin:0 0 4px}
      h3{font-size:13px;margin:12px 0 4px;color:#333}
      .desc{color:#555;margin:2px 0 8px;font-size:13px}
      .muted{color:#666;font-size:12px;margin:3px 0}
      ol{margin:4px 0 4px 18px;padding:0}
      li{font-size:13px;margin:3px 0}
      .note{background:#fff8e1;border:1px solid #ffe082;padding:8px 10px;border-radius:6px;font-size:12px;margin-top:8px}
      @media print{a{color:#111}}
    </style></head><body>
    <h1>Integration Setup Guide</h1>
    <p class="lead">Step-by-step configuration for each app. Use your browser's "Save as PDF" in the print dialog.</p>
    ${sections}
    <script>window.onload=function(){setTimeout(function(){window.print();},300);}</script>
    </body></html>`;
}

function downloadGuidePdf(ids: string[]) {
  const w = window.open('', '_blank');
  if (!w) { toast.error('Allow pop-ups to download the guide'); return; }
  w.document.write(buildGuideHtml(ids));
  w.document.close();
}

interface SetupTemplate { key: string; event: string; eventLabel: string; name: string; label: string; body: string; variables: string[]; status: string; rejectionReason: string; custom?: boolean }
interface SetupData { webhookUrl: string; verifyToken?: string; templates: SetupTemplate[]; automations: Record<string, { enabled: boolean; templateName: string }>; connected: boolean }

export default function IntegrationsPage() {
  const [connectedMap, setConnectedMap] = useState<Record<string, { connected: boolean; config: Record<string, string>; stats?: { totalSynced: number; lastSyncAt: string } }>>({});
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [showConfig, setShowConfig] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showAuto, setShowAuto] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [submittingTpl, setSubmittingTpl] = useState<string | null>(null);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: '', body: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const emptyAddForm = { event: '', label: '', body: '', headerType: 'none', headerText: '', headerImage: '', buttons: [] as { type: string; text: string; url: string }[] };
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [savingTpl, setSavingTpl] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    integrationApi.list().then(r => {
      const map: Record<string, typeof connectedMap[string]> = {};
      (r.data.data || []).forEach((i: { type: string; connected: boolean; config: Record<string, string>; stats?: { totalSynced: number; lastSyncAt: string } }) => {
        map[i.type] = { connected: i.connected, config: i.config, stats: i.stats };
      });
      setConnectedMap(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(integrationDefs.map(i => i.category)))];
  const q = search.trim().toLowerCase();
  const filtered = integrationDefs.filter(i =>
    (filterCat === 'all' || i.category === filterCat) &&
    (!q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
  );

  const openConfig = (id: string) => {
    const def = integrationDefs.find(d => d.id === id);
    if (!def) return;
    const existing = connectedMap[id]?.config || {};
    const form: Record<string, string> = {};
    def.fields.forEach(f => { form[f.key] = existing[f.key] || ''; });
    setConfigForm(form);
    setShowConfig(id);
  };

  // Webhook-based lead sources have no credentials to enter — connect them
  // instantly and jump straight to the setup (webhook URL + templates) modal
  // instead of showing a confusing empty "Connect" form.
  const handleConnectClick = async (id: string) => {
    const def = integrationDefs.find(d => d.id === id);
    if (!def) return;
    if (def.fields.length === 0 && automationTypes.has(id)) {
      setConnecting(true);
      try {
        const r = await integrationApi.connect({ type: id, config: {} });
        setConnectedMap(prev => ({ ...prev, [id]: { connected: true, config: r.data.data?.config || {}, stats: r.data.data?.stats } }));
        openAutomation(id);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || 'Connection failed');
      } finally { setConnecting(false); }
      return;
    }
    openConfig(id);
  };

  const handleConnect = async () => {
    if (submitting) return;
    if (!showConfig) return;
    setSubmitting(true);
    setConnecting(true);
    try {
      const r = await integrationApi.connect({ type: showConfig, config: configForm });
      setConnectedMap({ ...connectedMap, [showConfig]: { connected: true, config: r.data.data?.config || configForm, stats: r.data.data?.stats } });
      toast.success(r.data.message || 'Connected!');
      setShowConfig(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      // Failed validation must clear any stale "connected" badge
      setConnectedMap(prev => ({ ...prev, [showConfig]: { connected: false, config: prev[showConfig]?.config || {}, stats: prev[showConfig]?.stats } }));
      toast.error(error.response?.data?.message || 'Connection failed');
    }
    setSubmitting(false);
    setConnecting(false);
  };

  const handleDisconnect = async (type: string) => {
    if (submitting) return;
    if (!confirm('Disconnect this integration?')) return;
    setSubmitting(true);
    try {
      await integrationApi.disconnect(type);
      setConnectedMap(prev => ({ ...prev, [type]: { ...prev[type], connected: false } }));
      toast.success('Disconnected');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to disconnect');
    } finally { setSubmitting(false); }
  };

  const handleSync = async (type: string) => {
    if (submitting) return;
    setSyncing(type);
    setSubmitting(true);
    try {
      const r = await integrationApi.sync(type);
      toast.success(r.data.data?.message || 'Sync complete');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Sync failed');
    } finally {
      setSubmitting(false);
    }
    setSyncing(null);
  };

  const refreshSetup = async (id: string) => {
    try {
      const r = await integrationApi.setup(id);
      setSetupData(r.data.data);
    } catch { /* keep old data */ }
  };

  const openAutomation = async (id: string) => {
    setShowAuto(id);
    setSetupData(null);
    setEditKey(null);
    setShowAddForm(false);
    setLoadingSetup(true);
    try {
      const r = await integrationApi.setup(id);
      setSetupData(r.data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to load setup');
      setShowAuto(null);
    }
    setLoadingSetup(false);
  };

  const handleSubmitTemplate = async (type: string, tpl: SetupTemplate) => {
    setSubmittingTpl(tpl.key);
    try {
      const r = await integrationApi.submitTemplate(type, tpl.key);
      toast.success(r.data.message || 'Submitted');
      const upd = r.data.data as { status: string; rejectionReason: string };
      setSetupData(prev => prev ? { ...prev, templates: prev.templates.map(t => t.key === tpl.key ? { ...t, status: upd.status, rejectionReason: upd.rejectionReason } : t) } : prev);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Submit failed');
    }
    setSubmittingTpl(null);
  };

  const handleToggleAuto = async (type: string, tpl: SetupTemplate, enabled: boolean) => {
    try {
      const r = await integrationApi.automation(type, { event: tpl.event, enabled, templateName: tpl.name });
      setSetupData(prev => prev ? { ...prev, automations: r.data.data } : prev);
      toast.success(enabled ? 'Auto-send ON' : 'Auto-send OFF');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleSaveEdit = async (type: string, key: string) => {
    if (!editForm.body.trim()) { toast.error('Template body required'); return; }
    setSavingTpl(true);
    try {
      await integrationApi.updateTemplate(type, key, editForm);
      toast.success('Template updated');
      setEditKey(null);
      await refreshSetup(type);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Update failed');
    }
    setSavingTpl(false);
  };

  const handleAddTemplate = async (type: string) => {
    if (!addForm.event || !addForm.body.trim()) { toast.error('Event and body required'); return; }
    setSavingTpl(true);
    try {
      await integrationApi.addTemplate(type, addForm);
      toast.success('Template added');
      setShowAddForm(false);
      setAddForm(emptyAddForm);
      await refreshSetup(type);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Add failed');
    }
    setSavingTpl(false);
  };

  const handleDeleteTemplate = async (type: string, key: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await integrationApi.deleteTemplate(type, key);
      toast.success('Template removed');
      await refreshSetup(type);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!')).catch(() => toast.error('Copy failed'));
  };

  if (loading) {
    return (
      <div className={`${adminContentColumnClass} flex h-64 items-center justify-center`}>
        <RefreshCw className="h-6 w-6 animate-spin text-admin-text-subdued" />
      </div>
    );
  }

  return (
    <div className={`${adminContentColumnClass} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Puzzle className="h-5 w-5 shrink-0 text-admin-text-secondary" aria-hidden />
            <h1 className="text-[20px] font-semibold tracking-tight text-admin-text">Integrations</h1>
          </div>
          <p className="mt-1 text-[13px] text-admin-text-secondary">
            Connect third-party tools and services — works as soon as you add your key
          </p>
        </div>
        <button type="button" onClick={() => downloadGuidePdf(integrationDefs.map(d => d.id))} className={secondaryBtn}>
          <Download className="h-4 w-4" /> Setup guide (PDF)
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-subdued" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search integrations..."
          className={`${inputClass} pl-9`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCat(cat)}
            className={`rounded-lg px-3 py-1.5 text-[13px] capitalize transition-colors ${
              filterCat === cat
                ? 'bg-admin-text font-semibold text-white'
                : 'border border-admin-border bg-white text-admin-text-secondary hover:bg-[#f6f6f7]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(def => {
          const conn = connectedMap[def.id];
          const isConnected = conn?.connected;
          return (
            <div key={def.id} className={cardClass}>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: def.color }}
                  >
                    {def.icon}
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-admin-text">{def.name}</h3>
                    <span className="text-[11px] capitalize text-admin-text-subdued">{def.category}</span>
                  </div>
                </div>
                {isConnected && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                    Connected
                  </span>
                )}
              </div>
              <p className="mb-3 text-[13px] text-admin-text-secondary">{def.description}</p>
              {isConnected && conn?.stats && (
                <div className="mb-3 text-[12px] text-admin-text-subdued">
                  {conn.stats.totalSynced > 0 && <span>Synced: {conn.stats.totalSynced} </span>}
                  {conn.stats.lastSyncAt && <span>Last: {new Date(conn.stats.lastSyncAt).toLocaleDateString('en-IN')}</span>}
                </div>
              )}
              <div className="flex gap-2">
                {isConnected ? (
                  <>
                    {automationTypes.has(def.id) ? (
                      <button type="button" onClick={() => openAutomation(def.id)} className={`flex-1 ${secondaryBtn}`}>
                        <Zap className="h-3.5 w-3.5" /> Automation
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSync(def.id)}
                        disabled={syncing === def.id}
                        className={`flex-1 ${secondaryBtn}`}
                      >
                        {syncing === def.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ArrowUpDown className="h-3.5 w-3.5" />}
                        Sync
                      </button>
                    )}
                    {def.fields.length > 0 && (
                      <button type="button" onClick={() => openConfig(def.id)} className={secondaryBtn} title="Edit connection">
                        <Link2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDisconnect(def.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                      title="Disconnect"
                    >
                      <Unlink className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnectClick(def.id)}
                    disabled={connecting}
                    className={`w-full ${primaryBtn}`}
                  >
                    {def.fields.length === 0 && automationTypes.has(def.id) ? 'Connect & Set up' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Config Modal */}
      {showConfig && mounted && (() => {
        const def = integrationDefs.find(d => d.id === showConfig);
        if (!def) return null;
        const rzpWebhookUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/webhook/razorpay`;
        return createPortal(
          <div className={modalOverlayClass}>
            <div className="absolute inset-0 bg-black/45" onClick={() => setShowConfig(null)} />
            <div
              className={`${modalPanelClass} max-w-md`}
              role="dialog"
              aria-modal="true"
              aria-label={`Connect ${def.name}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center gap-3 border-b border-admin-border px-5 py-4">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: def.color }}
                >
                  {def.icon}
                </div>
                <h3 className="flex-1 text-[16px] font-semibold tracking-tight text-admin-text">Connect {def.name}</h3>
                <button
                  type="button"
                  onClick={() => setShowConfig(null)}
                  className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                {def.fields.map(field => (
                  <div key={field.key}>
                    <label className={labelClass}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={configForm[field.key] || ''}
                        onChange={e => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                        className={`${inputClass} h-24 resize-y`}
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={configForm[field.key] || ''}
                        onChange={e => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                        className={inputClass}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
                {def.id === 'razorpay' && (
                  <div className="space-y-2 rounded-lg border border-[#005bd3]/25 bg-[#f0f5ff] p-3 text-[12px] text-admin-text">
                    <p className="font-medium text-admin-text">Auto payment-confirmation message setup</p>
                    <p>In Razorpay Dashboard → <b>Settings → Webhooks</b> → Add New Webhook, paste this URL:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 break-all rounded border border-admin-border bg-white px-2 py-1 font-mono text-[11px]">{rzpWebhookUrl}</code>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(rzpWebhookUrl); toast.success('Webhook URL copied'); }}
                        className={secondaryBtn}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p>Enable events <b>payment_link.paid</b> + <b>payment.failed</b>, set a secret, and paste the <b>same secret</b> in the field above. Without this, the confirmation message won&apos;t auto-send after payment.</p>
                  </div>
                )}
                {(() => {
                  const g = guideForApp(def.id);
                  if (!g) return null;
                  return (
                    <div className="rounded-lg border border-admin-border bg-[#fafafa] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-admin-text">
                          <BookOpen className="h-4 w-4" /> Setup guide
                        </span>
                        <button
                          type="button"
                          onClick={() => downloadGuidePdf([def.id])}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#005bd3] hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </button>
                      </div>
                      <ol className="ml-4 list-decimal space-y-1 text-[12px] text-admin-text-secondary">
                        {g.steps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                      {g.keysUrl && <p className="mt-2 text-[12px] text-admin-text-subdued">Get keys: <span className="break-all font-mono">{g.keysUrl}</span></p>}
                      {g.note && <p className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-[12px] text-amber-800">{g.note}</p>}
                    </div>
                  );
                })()}
              </div>
              <div className="flex shrink-0 gap-2 border-t border-admin-border p-4">
                <button type="button" onClick={() => setShowConfig(null)} className={`flex-1 ${secondaryBtn}`}>Cancel</button>
                <button type="button" onClick={handleConnect} disabled={connecting} className={`flex-1 ${primaryBtn}`}>
                  {connecting ? 'Connecting...' : 'Connect & Save'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Automation Modal */}
      {showAuto && mounted && (() => {
        const def = integrationDefs.find(d => d.id === showAuto);
        if (!def) return null;
        return createPortal(
          <div className={modalOverlayClass}>
            <div className="absolute inset-0 bg-black/45" onClick={() => setShowAuto(null)} />
            <div
              className={`${modalPanelClass} max-w-2xl`}
              role="dialog"
              aria-modal="true"
              aria-label={`${def.name} WhatsApp Automation`}
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b border-admin-border bg-white px-5 py-4">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: def.color }}
                >
                  {def.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[16px] font-semibold tracking-tight text-admin-text">{def.name} — WhatsApp Automation</h3>
                  <p className="text-[12px] text-admin-text-secondary">Auto-send an approved template when an event arrives</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuto(null)}
                  className="rounded-lg p-1.5 text-admin-text-subdued hover:bg-[#f6f6f7] hover:text-admin-text"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {loadingSetup || !setupData ? (
                <div className="flex h-40 items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-admin-text-subdued" />
                </div>
              ) : (
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
                  {setupData.webhookUrl && (
                    <div>
                      <label className={labelClass}>
                        {showAuto === 'facebook-leads'
                          ? 'Meta Webhook URL (set in your Meta App → Webhooks → leadgen)'
                          : `Your Webhook URL (paste this in ${def.name})`}
                      </label>
                      <div className="flex gap-2">
                        <input readOnly value={setupData.webhookUrl} className={`${inputClass} bg-[#f6f6f7] font-mono text-[12px]`} />
                        <button type="button" onClick={() => copyText(setupData.webhookUrl)} className={secondaryBtn}>
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      {showAuto !== 'facebook-leads' && (
                        <p className="mt-1 text-[12px] text-admin-text-subdued">
                          Jaise hi {def.name} is URL par lead/event bhejega, contact save hoga aur approved template auto-send hogi.
                        </p>
                      )}
                      {setupData.verifyToken && (
                        <div className="mt-3">
                          <label className={labelClass}>Verify Token (paste in Meta App → Webhooks → Verify Token)</label>
                          <div className="flex gap-2">
                            <input readOnly value={setupData.verifyToken} className={`${inputClass} bg-[#f6f6f7] font-mono text-[12px]`} />
                            <button type="button" onClick={() => copyText(setupData.verifyToken!)} className={secondaryBtn}>
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {SETUP_HINTS[showAuto] && (
                    <div className="rounded-xl border border-[#005bd3]/20 bg-[#f0f5ff] p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-[13px] font-semibold text-admin-text">How to connect {def.name}</h4>
                        <button
                          type="button"
                          onClick={() => downloadGuidePdf([showAuto])}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#005bd3] hover:underline"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </button>
                      </div>
                      <ol className="list-inside list-decimal space-y-1 text-[12px] text-admin-text">
                        {SETUP_HINTS[showAuto].steps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                      {SETUP_HINTS[showAuto].note && (
                        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                          ⚠ {SETUP_HINTS[showAuto].note}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <h4 className="mb-2 text-[13px] font-semibold text-admin-text">Recommended Templates (1-click Meta approval)</h4>
                    <div className="space-y-3">
                      {setupData.templates.map(tpl => {
                        const auto = setupData.automations[tpl.event];
                        const enabled = !!auto?.enabled && auto?.templateName === tpl.name;
                        const approved = tpl.status === 'approved';
                        return (
                          <div key={tpl.key} className="rounded-xl border border-admin-border p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[13px] font-medium text-admin-text">{tpl.label}</span>
                                  {tpl.status === 'approved' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                                      <CheckCircle2 className="h-3 w-3" /> Approved
                                    </span>
                                  )}
                                  {tpl.status === 'pending' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/15">
                                      <Clock className="h-3 w-3" /> Pending approval
                                    </span>
                                  )}
                                  {tpl.status === 'rejected' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/15">
                                      <XCircle className="h-3 w-3" /> Rejected
                                    </span>
                                  )}
                                  {tpl.status === 'not_submitted' && (
                                    <span className="rounded-full bg-[#f6f6f7] px-2 py-0.5 text-[11px] text-admin-text-secondary ring-1 ring-inset ring-admin-border">
                                      Not submitted
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-[12px] text-admin-text-subdued">Event: {tpl.eventLabel}</p>
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                {!approved && editKey !== tpl.key && (
                                  <button
                                    type="button"
                                    onClick={() => { setEditKey(tpl.key); setEditForm({ label: tpl.label, body: tpl.body }); }}
                                    className={secondaryBtn}
                                    title="Edit template"
                                  >
                                    <Pencil className="h-3 w-3" /> Edit
                                  </button>
                                )}
                                {tpl.custom && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTemplate(showAuto, tpl.key)}
                                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-2 py-1.5 text-red-600 hover:bg-red-50"
                                    title="Delete template"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                                {!approved && (
                                  <button
                                    type="button"
                                    onClick={() => handleSubmitTemplate(showAuto, tpl)}
                                    disabled={submittingTpl === tpl.key}
                                    className={primaryBtn}
                                  >
                                    {submittingTpl === tpl.key ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                    {tpl.status === 'pending' ? 'Re-submit' : 'Submit for approval'}
                                  </button>
                                )}
                              </div>
                            </div>
                            {editKey === tpl.key ? (
                              <div className="mt-2 space-y-2">
                                <input
                                  value={editForm.label}
                                  onChange={e => setEditForm({ ...editForm, label: e.target.value })}
                                  className={inputClass}
                                  placeholder="Template title"
                                />
                                <textarea
                                  value={editForm.body}
                                  onChange={e => setEditForm({ ...editForm, body: e.target.value })}
                                  className={`${inputClass} h-24 resize-y`}
                                  placeholder="Message body — use {{1}}, {{2}} for variables"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(showAuto, tpl.key)}
                                    disabled={savingTpl}
                                    className={primaryBtn}
                                  >
                                    {savingTpl ? 'Saving...' : 'Save'}
                                  </button>
                                  <button type="button" onClick={() => setEditKey(null)} className={secondaryBtn}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2 whitespace-pre-wrap rounded-lg bg-[#f6f6f7] p-3 text-[12px] text-admin-text-secondary">
                                {tpl.body}
                              </div>
                            )}
                            {tpl.rejectionReason && <p className="mt-1 text-[12px] text-red-600">{tpl.rejectionReason}</p>}
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[12px] text-admin-text-secondary">
                                Auto-send this template on &quot;{tpl.eventLabel}&quot;
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleAuto(showAuto, tpl, !enabled)}
                                className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-admin-text' : 'bg-[#d1d1d1]'}`}
                              >
                                <span
                                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                    enabled ? 'translate-x-5' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                            </div>
                            {enabled && !approved && (
                              <p className="mt-1 text-[12px] text-amber-700">
                                Template approve hone ke baad hi message jayega — pehle submit karke approval ka wait karein.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {showAddForm ? (
                      <div className="mt-3 space-y-2 rounded-xl border border-dashed border-admin-border p-4">
                        <h5 className="text-[13px] font-medium text-admin-text">Add your own template</h5>
                        <select
                          value={addForm.event}
                          onChange={e => setAddForm({ ...addForm, event: e.target.value })}
                          className={inputClass}
                        >
                          <option value="">Select event...</option>
                          {Array.from(new Set(setupData.templates.map(t => t.event))).map(ev => (
                            <option key={ev} value={ev}>{setupData.templates.find(t => t.event === ev)?.eventLabel || ev}</option>
                          ))}
                        </select>
                        <input
                          value={addForm.label}
                          onChange={e => setAddForm({ ...addForm, label: e.target.value })}
                          className={inputClass}
                          placeholder="Template title (e.g. My Welcome Message)"
                        />
                        <textarea
                          value={addForm.body}
                          onChange={e => setAddForm({ ...addForm, body: e.target.value })}
                          className={`${inputClass} h-24 resize-y`}
                          placeholder="Message body — use {{1}}, {{2}} for variables (e.g. Hi {{1}}, thanks for contacting us!)"
                        />
                        <div className="flex gap-2">
                          <select
                            value={addForm.headerType}
                            onChange={e => setAddForm({ ...addForm, headerType: e.target.value })}
                            className={inputClass}
                          >
                            <option value="none">No header</option>
                            <option value="text">Text header</option>
                            <option value="image">Image header</option>
                          </select>
                          {addForm.headerType === 'text' && (
                            <input
                              value={addForm.headerText}
                              onChange={e => setAddForm({ ...addForm, headerText: e.target.value })}
                              className={inputClass}
                              placeholder="Header text (e.g. Order Update)"
                            />
                          )}
                          {addForm.headerType === 'image' && (
                            <input
                              value={addForm.headerImage}
                              onChange={e => setAddForm({ ...addForm, headerImage: e.target.value })}
                              className={inputClass}
                              placeholder="Public image URL (jpg/png)"
                            />
                          )}
                        </div>
                        {addForm.buttons.map((b, i) => (
                          <div key={i} className="flex gap-2">
                            <select
                              value={b.type}
                              onChange={e => setAddForm({ ...addForm, buttons: addForm.buttons.map((x, j) => j === i ? { ...x, type: e.target.value } : x) })}
                              className={inputClass}
                            >
                              <option value="quick_reply">Quick reply</option>
                              <option value="url">URL button</option>
                            </select>
                            <input
                              value={b.text}
                              onChange={e => setAddForm({ ...addForm, buttons: addForm.buttons.map((x, j) => j === i ? { ...x, text: e.target.value } : x) })}
                              className={inputClass}
                              placeholder="Button text (max 25 chars)"
                              maxLength={25}
                            />
                            {b.type === 'url' && (
                              <input
                                value={b.url}
                                onChange={e => setAddForm({ ...addForm, buttons: addForm.buttons.map((x, j) => j === i ? { ...x, url: e.target.value } : x) })}
                                className={inputClass}
                                placeholder="https://..."
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => setAddForm({ ...addForm, buttons: addForm.buttons.filter((_, j) => j !== i) })}
                              className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-2 py-1.5 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {addForm.buttons.length < 3 && (
                          <button
                            type="button"
                            onClick={() => setAddForm({ ...addForm, buttons: [...addForm.buttons, { type: 'quick_reply', text: '', url: '' }] })}
                            className="text-[12px] font-semibold text-[#005bd3] hover:underline"
                          >
                            + Add button
                          </button>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddTemplate(showAuto)}
                            disabled={savingTpl}
                            className={primaryBtn}
                          >
                            {savingTpl ? 'Adding...' : 'Add Template'}
                          </button>
                          <button type="button" onClick={() => setShowAddForm(false)} className={secondaryBtn}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-admin-border py-2 text-[13px] text-admin-text-secondary hover:bg-[#f6f6f7]"
                      >
                        <Plus className="h-4 w-4" /> Add your own template
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="shrink-0 border-t border-admin-border p-4">
                <button type="button" onClick={() => setShowAuto(null)} className={`w-full ${secondaryBtn}`}>Close</button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}
