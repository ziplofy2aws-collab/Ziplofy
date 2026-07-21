import { type FormEvent, useMemo, useState } from 'react';
import {
  isThemeEditorPreview,
  useOptionalStorefrontAccess,
  useStorefront,
  useThemeConfig,
  useThemeEditorPreview,
} from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import {
  resolveThemeLogoHeights,
  resolveThemeLogoUrls,
} from '../../runtime/shared/resolveThemeLogo';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import type { SectionRuntimeProps } from '../../runtime/types';

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

function contrastOn(bg: string): string {
  const hex = bg.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#ffffff';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#111827' : '#ffffff';
}

/**
 * Store password gate — unlock form when the store is password-protected.
 * Editable blocks: logo, text, password input, button.
 */
export function PasswordMain({
  sectionId = 'password_main',
  templateId = 'password',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const isEditorPreview = useThemeEditorPreview() || isThemeEditorPreview();
  const { maxWidth, padX } = useThemeLayout();
  const { text, background, primary, muted, border, fontHeading, fontBody } = useThemeColors();
  const { storeFrontMeta } = useStorefront();
  const access = useOptionalStorefrontAccess();
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const base = secBase(templateId, sectionId);
  const editorNodeId = `template:${templateId}:${sectionId}`;
  const logoUrl = useMemo(() => resolveThemeLogoUrls(config).defaultUrl, [config]);
  const logoHeights = useMemo(() => resolveThemeLogoHeights(config), [config]);

  const logoText =
    cfgString(config, `${base}.blocks.logo.settings.text`, '').trim() ||
    cfgString(config, `${base}.settings.title`, '').trim() ||
    storeFrontMeta?.name ||
    'Store';

  const configMessage =
    cfgString(config, `${base}.blocks.text.settings.message`, '') ||
    cfgString(config, `${base}.settings.message`, '');
  const message =
    configMessage.trim() ||
    access?.messageToYourVisitors?.trim() ||
    'This store is password protected. Enter the password to continue shopping.';

  const passwordLabel =
    cfgString(config, `${base}.blocks.password_field.settings.label`, '') ||
    cfgString(config, `${base}.settings.passwordLabel`, 'Password');
  const passwordPlaceholder =
    cfgString(config, `${base}.blocks.password_field.settings.placeholder`, '') ||
    cfgString(config, `${base}.settings.passwordPlaceholder`, 'Enter store password');
  const submitLabel =
    cfgString(config, `${base}.blocks.primary_button.settings.label`, '') ||
    cfgString(config, `${base}.settings.submitLabel`, 'Enter');
  const submittingLabel =
    cfgString(config, `${base}.blocks.primary_button.settings.loadingLabel`, '') ||
    cfgString(config, `${base}.settings.submittingLabel`, 'Checking…');

  const verifying = access?.verifying ?? false;
  const error = localError || access?.error || null;
  const buttonBg = primary || '#111827';
  const buttonFg = contrastOn(buttonBg);
  const canSubmit = Boolean(password.trim()) && !verifying;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    if (!password.trim() || verifying) return;
    if (isEditorPreview || !access) {
      setLocalError('Password unlock is disabled in the theme editor preview.');
      return;
    }
    const ok = await access.verifyPassword(password.trim());
    if (!ok) setPassword('');
  };

  return (
    <EditorSection
      sectionId={sectionId}
      label="Password"
      editorNodeId={editorNodeId}
      style={{
        background,
        color: text,
        fontFamily: fontBody,
        padding: `48px ${padX}px 24px`,
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: Math.min(440, maxWidth || 1200),
          margin: '0 auto',
          width: '100%',
        }}
      >
        <EditorBlock nodeId={`${editorNodeId}:block:logo`} label="Logo">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={logoText}
                className="codiic-password-logo-img"
                style={{
                  height: logoHeights.desktop,
                  maxHeight: logoHeights.desktop,
                  width: 'auto',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  display: 'inline-block',
                }}
              />
            ) : (
              <EditorField
                fieldPath={`${base}.blocks.logo.settings.text`}
                label="Store name"
                as="h1"
                style={{
                  margin: 0,
                  fontFamily: fontHeading,
                  fontSize: 'clamp(1.5rem, 2.4vw, 1.85rem)',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: text,
                }}
              >
                {logoText}
              </EditorField>
            )}
          </div>
        </EditorBlock>

        <EditorBlock nodeId={`${editorNodeId}:block:text`} label="Text">
          <div
            style={{
              marginBottom: 28,
              textAlign: 'center',
              fontSize: 14,
              lineHeight: 1.6,
              color: muted || text,
              opacity: 0.92,
            }}
          >
            <EditorField
              fieldPath={`${base}.blocks.text.settings.message`}
              label="Message"
              as="div"
            >
              <ThemeEditorRichTextContent html={message} />
            </EditorField>
          </div>
        </EditorBlock>

        <form onSubmit={(e) => void handleSubmit(e)} style={{ display: 'grid', gap: 14 }}>
          <EditorBlock nodeId={`${editorNodeId}:block:password_field`} label="Password input">
            <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 500, color: text }}>
              <EditorField
                fieldPath={`${base}.blocks.password_field.settings.label`}
                label="Label"
                as="span"
              >
                {passwordLabel}
              </EditorField>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setLocalError(null);
                  setPassword(e.target.value);
                }}
                autoComplete="current-password"
                placeholder={passwordPlaceholder}
                disabled={verifying}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: 10,
                  border: `1px solid ${border || 'rgba(17,24,39,0.16)'}`,
                  padding: '12px 14px',
                  fontSize: 14,
                  fontFamily: fontBody,
                  color: text,
                  background: '#fff',
                  outline: 'none',
                }}
              />
            </label>
          </EditorBlock>

          {error ? (
            <p style={{ margin: 0, fontSize: 13, color: '#dc2626' }} role="alert">
              {error}
            </p>
          ) : null}

          <EditorBlock nodeId={`${editorNodeId}:block:primary_button`} label="Button">
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: '100%',
                minHeight: 46,
                border: 'none',
                borderRadius: 10,
                background: canSubmit ? buttonBg : '#d1d5db',
                color: canSubmit ? buttonFg : '#6b7280',
                fontWeight: 600,
                fontSize: 14,
                fontFamily: fontBody,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              <EditorField
                fieldPath={`${base}.blocks.primary_button.settings.label`}
                label="Button label"
                as="span"
                style={{ color: 'inherit', fontWeight: 600 }}
              >
                {verifying ? submittingLabel : submitLabel}
              </EditorField>
            </button>
          </EditorBlock>
        </form>

        <div
          style={{
            marginTop: 28,
            borderTop: `1px solid ${border || layout.line}`,
            paddingTop: 8,
          }}
          aria-hidden
        />
      </div>
    </EditorSection>
  );
}
