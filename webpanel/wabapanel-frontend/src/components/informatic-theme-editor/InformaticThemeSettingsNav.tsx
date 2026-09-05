'use client';

import { useEffect, useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getConfigPath, setConfigPath } from '@/lib/informatic-theme/load-static-pack';
import { InformaticImageField } from '@/components/store-media/InformaticImageField';
import { useAuthStore } from '@/stores/authStore';
import {
  INFORMATIC_DEFAULT_BODY_FONT,
  INFORMATIC_DEFAULT_HEADING_FONT,
  INFORMATIC_GOOGLE_FONT_OPTIONS,
} from '@/lib/informatic-theme/informatic-font-options';
import { InformaticFontPicker } from './InformaticFontPicker';
import { ensureInformaticFooterSocialBlock } from '@/lib/informatic-theme/informatic-footer.util';

export const LOGO_DEFAULT_PATH = 'settings.logo.defaultUrl';
export const LOGO_FAVICON_PATH = 'settings.logo.faviconUrl';
export const LOGO_DESKTOP_HEIGHT_PATH = 'settings.logo.desktopHeight';
export const LOGO_MOBILE_HEIGHT_PATH = 'settings.logo.mobileHeight';
export const LOGO_DESKTOP_HEIGHT_DEFAULT = 36;
export const LOGO_MOBILE_HEIGHT_DEFAULT = 28;
export const LOGO_HEIGHT_MIN = 12;
export const LOGO_HEIGHT_MAX = 120;

const COLOR_PATHS = [
  'settings.colors.background',
  'settings.colors.text',
  'settings.colors.accent',
  'settings.colors.primary',
  'settings.colors.surface',
  'settings.colors.muted',
] as const;

const COLOR_DEFAULTS = ['#ffffff', '#0f172a', '#2563eb', '#0f172a', '#f8fafc', '#64748b'] as const;

const SETTINGS_SECTIONS = [
  { id: 'logo-favicon', label: 'Logo and favicon' },
  { id: 'colors', label: 'Color palette' },
  { id: 'typography', label: 'Typography' },
  { id: 'whatsapp-widget', label: 'WhatsApp widget' },
  { id: 'email-smtp', label: 'Email SMTP' },
] as const;

const inputClass =
  'w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-gray-900 outline-none focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3]';
const textareaClass = inputClass + ' resize-none';

function readBool(config: Record<string, unknown>, path: string, fallback = false): boolean {
  const v = getConfigPath(config, path);
  if (v == null) return fallback;
  return Boolean(v);
}

function TextSettingField({
  label,
  desc,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  desc?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[13px] font-medium text-gray-800">{label}</label>
      {desc ? <p className="text-[12px] leading-relaxed text-gray-500">{desc}</p> : null}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
        autoComplete="off"
      />
    </div>
  );
}

function TextAreaSettingField({
  label,
  desc,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  desc?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[13px] font-medium text-gray-800">{label}</label>
      {desc ? <p className="text-[12px] leading-relaxed text-gray-500">{desc}</p> : null}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={textareaClass}
      />
    </div>
  );
}

function ToggleSettingField({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className="block text-[13px] font-medium text-gray-800">{label}</span>
        {desc ? <p className="mt-0.5 text-[12px] leading-relaxed text-gray-500">{desc}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function readString(config: Record<string, unknown>, path: string, fallback = ''): string {
  const v = getConfigPath(config, path);
  return v == null || v === '' ? fallback : String(v);
}

function readNumber(config: Record<string, unknown>, path: string, fallback: number): number {
  const n = Number(getConfigPath(config, path));
  return Number.isFinite(n) ? n : fallback;
}

function LogoHeightField({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const clamp = (next: number) =>
    Math.min(LOGO_HEIGHT_MAX, Math.max(LOGO_HEIGHT_MIN, Math.round(next)));
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitDraft = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || draft.trim() === '') {
      setDraft(String(value));
      return;
    }
    const clamped = clamp(parsed);
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <span className="shrink-0 text-[13px] text-gray-800">{label}</span>
        <div className="flex min-w-0 items-center gap-2">
          <input
            type="range"
            min={LOGO_HEIGHT_MIN}
            max={LOGO_HEIGHT_MAX}
            step={1}
            value={value}
            onChange={(e) => onChange(clamp(Number(e.target.value)))}
            className="h-1.5 min-w-0 flex-1 cursor-pointer accent-gray-900"
            aria-label={label}
          />
          <div className="flex shrink-0 items-center rounded-lg border border-[#c9cccf] bg-white shadow-sm">
            <input
              type="text"
              inputMode="numeric"
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
              onBlur={commitDraft}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitDraft();
                }
              }}
              className="w-12 border-0 bg-transparent px-2 py-1.5 text-center text-[13px] text-gray-900 focus:outline-none"
              aria-label={`${label} in pixels`}
            />
            <span className="border-l border-[#e1e1e1] px-2 text-[12px] text-gray-500">px</span>
          </div>
        </div>
      </div>
      {helper ? <p className="text-[12px] leading-relaxed text-gray-600">{helper}</p> : null}
    </div>
  );
}

function ColorPalettePanel({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
}) {
  const colors = COLOR_PATHS.map((path, i) => readString(config, path, COLOR_DEFAULTS[i]));

  return (
    <div className="space-y-2">
      <p className="text-[12px] leading-relaxed text-gray-500">
        Add swatches for the theme. The first color is used as background, the second as text, and
        the third as the brand accent when present.
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {colors.map((color, index) => {
          const isWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff';
          return (
            <label
              key={COLOR_PATHS[index]}
              className={`relative h-9 w-9 cursor-pointer overflow-hidden rounded-lg border shadow-sm ${
                isWhite ? 'border-[#e1e3e5] bg-white' : 'border-[#e1e3e5]'
              }`}
              title={color}
            >
              <span className="absolute inset-0" style={{ background: isWhite ? '#fff' : color }} />
              <input
                type="color"
                value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : COLOR_DEFAULTS[index]}
                onChange={(e) => onChange(COLOR_PATHS[index], e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label={`Edit color ${COLOR_PATHS[index]}`}
              />
            </label>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2 text-[11px] text-gray-500">
        <span>1 Background</span>
        <span>2 Text</span>
        <span>3 Accent</span>
        <span>4 Primary</span>
        <span>5 Surface</span>
        <span>6 Muted</span>
      </div>
    </div>
  );
}

function TypographyPanel({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
}) {
  const heading = readString(config, 'settings.typography.fontFamily', INFORMATIC_DEFAULT_HEADING_FONT);
  const body = readString(config, 'settings.typography.fontFamilyBody', INFORMATIC_DEFAULT_BODY_FONT);

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-relaxed text-gray-500">
        Pick heading and body fonts — each option previews in its own typeface. Search across{' '}
        {INFORMATIC_GOOGLE_FONT_OPTIONS.length + 10}+ fonts.
      </p>
      <div className="space-y-1">
        <span className="block text-[13px] font-medium text-gray-800">Heading</span>
        <InformaticFontPicker
          value={heading}
          onChange={(family) => onChange('settings.typography.fontFamily', family)}
          ariaLabel="Select heading font"
        />
      </div>
      <div className="space-y-1">
        <span className="block text-[13px] font-medium text-gray-800">Body</span>
        <InformaticFontPicker
          value={body}
          onChange={(family) => onChange('settings.typography.fontFamilyBody', family)}
          ariaLabel="Select body font"
        />
      </div>
    </div>
  );
}

function LogoFaviconPanel({
  config,
  onChange,
  storeId,
}: {
  config: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
  storeId: string | null;
}) {
  return (
    <div className="space-y-5">
      <InformaticImageField
        label="Default logo"
        value={readString(config, LOGO_DEFAULT_PATH)}
        onChange={(url) => onChange(LOGO_DEFAULT_PATH, url)}
        storeId={storeId}
        allowUrlPaste
      />
      <LogoHeightField
        label="Desktop height"
        helper="Only affects header logo"
        value={readNumber(config, LOGO_DESKTOP_HEIGHT_PATH, LOGO_DESKTOP_HEIGHT_DEFAULT)}
        onChange={(n) => onChange(LOGO_DESKTOP_HEIGHT_PATH, n)}
      />
      <LogoHeightField
        label="Mobile height"
        helper="Only affects header logo"
        value={readNumber(config, LOGO_MOBILE_HEIGHT_PATH, LOGO_MOBILE_HEIGHT_DEFAULT)}
        onChange={(n) => onChange(LOGO_MOBILE_HEIGHT_PATH, n)}
      />
      <InformaticImageField
        label="Favicon"
        value={readString(config, LOGO_FAVICON_PATH)}
        helper="Shown in the browser tab on your live storefront and in the editor preview"
        onChange={(url) => onChange(LOGO_FAVICON_PATH, url)}
        storeId={storeId}
        allowUrlPaste
      />
    </div>
  );
}

function sanitizeWhatsappPhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

function WhatsAppWidgetPanel({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
}) {
  const currentWorkspace = useAuthStore((s) => s.currentWorkspace);
  const enabled = readBool(config, 'settings.whatsappWidget.enabled');
  const phone = readString(config, 'settings.whatsappWidget.phone');
  const contactPhone = readString(config, 'settings.contact.phone');
  const workspacePhone = sanitizeWhatsappPhone(
    String(currentWorkspace?.whatsapp?.phoneNumber || currentWorkspace?.whatsapp?.displayPhoneNumber || '')
  );

  useEffect(() => {
    if (!enabled || phone.trim()) return;
    const fallback = workspacePhone || sanitizeWhatsappPhone(contactPhone);
    if (fallback) {
      onChange('settings.whatsappWidget.phone', fallback);
    }
  }, [enabled, phone, workspacePhone, contactPhone, onChange]);

  const handleEnabledChange = (next: boolean) => {
    onChange('settings.whatsappWidget.enabled', next);
    if (next && !readString(config, 'settings.whatsappWidget.phone').trim()) {
      const fallback = workspacePhone || sanitizeWhatsappPhone(contactPhone);
      if (fallback) {
        onChange('settings.whatsappWidget.phone', fallback);
      }
    }
  };

  const missingPhone = enabled && !sanitizeWhatsappPhone(phone);

  return (
    <div className="space-y-4">
      <p className="text-[12px] leading-relaxed text-gray-500">
        A floating WhatsApp button in the corner of your storefront. Visitors tap it to chat on
        WhatsApp.
      </p>
      <ToggleSettingField
        label="Show WhatsApp button on website"
        desc="Turn the floating button on or off"
        checked={enabled}
        onChange={handleEnabledChange}
      />
      {missingPhone ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          Add a WhatsApp number below (with country code, digits only). The button stays hidden until
          a number is set.
          {workspacePhone ? ' Your connected WhatsApp number can be used automatically.' : null}
        </p>
      ) : null}
      <TextSettingField
        label="WhatsApp number"
        desc="With country code, digits only (no + or spaces). Example: 919782005500"
        value={phone}
        onChange={(v) => onChange('settings.whatsappWidget.phone', v.replace(/\D/g, ''))}
        placeholder={workspacePhone || '919782005500'}
      />
      <TextAreaSettingField
        label="Pre-filled message"
        desc="Text auto-filled in WhatsApp when a visitor opens the chat"
        value={readString(config, 'settings.whatsappWidget.message', 'Hi! I have a question about your website.')}
        onChange={(v) => onChange('settings.whatsappWidget.message', v)}
        rows={2}
        placeholder="Hi! I have a question about your website."
      />
      <TextSettingField
        label="Button label (optional)"
        desc="Small text shown next to the button when hovered"
        value={readString(config, 'settings.whatsappWidget.greeting', 'Need help? Chat with us')}
        onChange={(v) => onChange('settings.whatsappWidget.greeting', v)}
        placeholder="Need help? Chat with us"
      />
    </div>
  );
}

function EmailSmtpPanel({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[12px] leading-relaxed text-gray-500">
        Outgoing mail server for contact form notifications and storefront emails.
      </p>
      <TextSettingField
        label="SMTP host"
        value={readString(config, 'settings.email.host')}
        onChange={(v) => onChange('settings.email.host', v)}
        placeholder="smtp.gmail.com"
      />
      <div className="grid grid-cols-2 gap-3">
        <TextSettingField
          label="SMTP port"
          value={readString(config, 'settings.email.port', '587')}
          onChange={(v) => onChange('settings.email.port', v)}
          placeholder="587"
        />
        <div className="space-y-1">
          <label className="block text-[13px] font-medium text-gray-800">Encryption</label>
          <select
            value={readString(config, 'settings.email.encryption', 'tls')}
            onChange={(e) => onChange('settings.email.encryption', e.target.value)}
            className={inputClass}
          >
            <option value="tls">TLS (Port 587)</option>
            <option value="ssl">SSL (Port 465)</option>
            <option value="none">None (Port 25)</option>
          </select>
        </div>
      </div>
      <TextSettingField
        label="Username"
        value={readString(config, 'settings.email.user')}
        onChange={(v) => onChange('settings.email.user', v)}
        placeholder="your@email.com"
      />
      <TextSettingField
        label="Password"
        desc="Leave blank to keep the current password when saving to the server"
        value={readString(config, 'settings.email.password')}
        onChange={(v) => onChange('settings.email.password', v)}
        type="password"
        placeholder="App password or SMTP password"
      />
      <TextSettingField
        label="From email"
        value={readString(config, 'settings.email.from')}
        onChange={(v) => onChange('settings.email.from', v)}
        placeholder="noreply@yourdomain.com"
      />
      <TextSettingField
        label="From name"
        value={readString(config, 'settings.email.fromName')}
        onChange={(v) => onChange('settings.email.fromName', v)}
        placeholder="Your brand name"
      />
    </div>
  );
}

function renderSettingsPanel(
  id: string,
  config: Record<string, unknown>,
  onChange: (path: string, value: unknown) => void,
  onFieldChange: (path: string, value: unknown) => void,
  storeId: string | null
) {
  switch (id) {
    case 'logo-favicon':
      return <LogoFaviconPanel config={config} onChange={onFieldChange} storeId={storeId} />;
    case 'colors':
      return <ColorPalettePanel config={config} onChange={onChange} />;
    case 'typography':
      return <TypographyPanel config={config} onChange={onChange} />;
    case 'whatsapp-widget':
      return <WhatsAppWidgetPanel config={config} onChange={onChange} />;
    case 'email-smtp':
      return <EmailSmtpPanel config={config} onChange={onChange} />;
    default:
      return null;
  }
}

type Props = {
  config: Record<string, unknown>;
  defaultConfig: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
  onReplaceConfig: (next: Record<string, unknown>) => void;
  storeId?: string | null;
};

/**
 * Catalog-style Theme settings: Logo and favicon, Color palette, Typography.
 */
export function InformaticThemeSettingsNav({
  config,
  defaultConfig,
  onChange,
  onReplaceConfig,
  storeId = null,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const navId = useId();

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onResetToDefaults = () => {
    const next = structuredClone(defaultConfig) as Record<string, unknown>;
    onReplaceConfig(next);
  };

  // Keep header logo in sync with theme settings
  const onFieldChange = (path: string, value: unknown) => {
    onChange(path, value);
    if (path === LOGO_DEFAULT_PATH) {
      onChange('sections.header.blocks.logo.settings.imageUrl', value);
      onChange('sections.header.settings.defaultLogoUrl', value);
    }
  };

  return (
    <nav className="pb-2" aria-label="Theme settings" id={navId}>
      <div className="border-b border-[#e1e1e1] px-3 py-3">
        <button
          type="button"
          onClick={onResetToDefaults}
          className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
        >
          Reset to defaults
        </button>
      </div>

      {SETTINGS_SECTIONS.map((item) => {
        const isOpen = expandedIds[item.id] === true;
        return (
          <div key={item.id} className="border-b border-[#e1e1e1]">
            <button
              type="button"
              onClick={() => toggleExpanded(item.id)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-3.5 text-left text-[15px] text-gray-900 transition-colors hover:bg-[#ededed] ${
                isOpen ? 'bg-[#f6f6f7]' : ''
              }`}
              aria-expanded={isOpen}
            >
              <span className="min-w-0 truncate font-normal">{item.label}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden
              />
            </button>
            {isOpen ? (
              <div className="border-t border-[#e1e1e1] bg-white px-3 py-4">
                {renderSettingsPanel(item.id, config, onChange, onFieldChange, storeId)}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

/** Ensure theme settings defaults exist on a config object. */
export function ensureInformaticThemeSettingsDefaults(
  config: Record<string, unknown>
): Record<string, unknown> {
  let next = config;
  const ensure = (path: string, value: unknown) => {
    if (getConfigPath(next, path) == null) {
      next = setConfigPath(next, path, value);
    }
  };
  ensure(LOGO_DEFAULT_PATH, '');
  ensure(LOGO_FAVICON_PATH, '');
  ensure(LOGO_DESKTOP_HEIGHT_PATH, LOGO_DESKTOP_HEIGHT_DEFAULT);
  ensure(LOGO_MOBILE_HEIGHT_PATH, LOGO_MOBILE_HEIGHT_DEFAULT);
  COLOR_PATHS.forEach((path, index) => {
    ensure(path, COLOR_DEFAULTS[index]);
  });
  ensure('settings.typography.fontFamily', INFORMATIC_DEFAULT_HEADING_FONT);
  ensure('settings.typography.fontFamilyBody', INFORMATIC_DEFAULT_BODY_FONT);
  ensure('settings.whatsappWidget.enabled', false);
  ensure('settings.whatsappWidget.phone', '');
  ensure('settings.whatsappWidget.message', 'Hi! I have a question about your website.');
  ensure('settings.whatsappWidget.greeting', 'Need help? Chat with us');
  ensure('settings.email.host', '');
  ensure('settings.email.port', '587');
  ensure('settings.email.encryption', 'tls');
  ensure('settings.email.user', '');
  ensure('settings.email.password', '');
  ensure('settings.email.from', '');
  ensure('settings.email.fromName', '');
  ensure('settings.contact.title', 'Contact Us');
  ensure('settings.contact.email', '');
  ensure('settings.contact.phone', '');
  ensure('settings.contact.address', '');
  return ensureInformaticFooterSocialBlock(next);
}

/** @deprecated use ensureInformaticThemeSettingsDefaults */
export const ensureInformaticLogoDefaults = ensureInformaticThemeSettingsDefaults;
