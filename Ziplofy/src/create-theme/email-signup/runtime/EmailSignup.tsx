import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { readEmailSignupLayout, scopedEmailSignupCss } from './emailSignupStyles';

function ArrowIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 10h12M12 6l4 4-4 4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmailSignup({
  sectionId = 'email_signup',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const [email, setEmail] = useState('');

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readEmailSignupLayout(config, settingsBase), [config, settingsBase]);

  const title = cfgString(config, `${settingsBase}.title`, 'Subscribe to our emails');
  const subtitle = cfgString(
    config,
    `${settingsBase}.subtitle`,
    'Be the first to know about new collections and special offers.'
  );
  const placeholder = cfgString(config, `${settingsBase}.placeholder`, 'Email address');

  const scheme = style.colorScheme;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;

  const textAlign =
    style.alignment === 'left' ? 'left' : style.alignment === 'right' ? 'right' : 'center';

  const justifyContent =
    style.position === 'top' ? 'flex-start' : style.position === 'bottom' ? 'flex-end' : 'center';

  const sectionShell: CSSProperties = {
    position: 'relative',
    background: scheme.background,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    border: style.borderStyle === 'solid' ? `1px solid ${scheme.border}` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: 'hidden',
    ...(style.minHeight != null ? { minHeight: style.minHeight } : {}),
  };

  const innerFlex: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    minHeight:
      style.minHeight != null ? style.minHeight - style.paddingTop - style.paddingBottom : undefined,
    display: 'flex',
    flexDirection: style.direction === 'horizontal' ? 'row' : 'column',
    alignItems:
      style.direction === 'horizontal'
        ? 'center'
        : style.alignment === 'left'
          ? 'flex-start'
          : style.alignment === 'right'
            ? 'flex-end'
            : 'center',
    justifyContent,
    gap: style.gap,
    textAlign,
  };

  const headingStyle: CSSProperties = {
    margin: 0,
    flex: style.direction === 'horizontal' ? '0 0 auto' : undefined,
    fontFamily: fontHeading,
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.15,
    color: scheme.color,
    textAlign,
  };

  const subtitleStyle: CSSProperties = {
    margin: 0,
    maxWidth: 520,
    fontFamily: fontBody,
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
    color: scheme.subtitleColor,
    textAlign,
  };

  const formShell: CSSProperties = {
    width: '100%',
    maxWidth: 480,
    marginTop: style.direction === 'vertical' ? 16 : 0,
    marginLeft: style.alignment === 'right' ? 'auto' : undefined,
    marginRight: style.alignment === 'left' ? 'auto' : undefined,
    flex: style.direction === 'horizontal' ? '1 1 320px' : undefined,
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  const scopedCss = scopedEmailSignupCss(sectionId, style.customCss);

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Email signup"
      style={sectionShell}
    >
      {style.backgroundMedia === 'image' && style.backgroundImageUrl ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${style.backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
      ) : null}
      {style.backgroundOverlay && style.backgroundMedia === 'image' ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 1,
          }}
        />
      ) : null}
      {scopedCss ? <style>{scopedCss}</style> : null}
      <div style={{ ...innerFlex, position: 'relative', zIndex: 2 }}>
        <EditorField fieldPath={`${settingsBase}.title`} label="Heading" as="h2" style={headingStyle}>
          {title}
        </EditorField>

        <EditorField
          fieldPath={`${settingsBase}.subtitle`}
          label="Subheading"
          as="p"
          style={subtitleStyle}
        >
          {subtitle}
        </EditorField>

        <form onSubmit={onSubmit} style={formShell}>
          <EditorField
            fieldPath={`${settingsBase}.placeholder`}
            label="Email field"
            as="span"
            style={{ display: 'block' }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: 48,
                border: `1px solid ${scheme.inputBorder}`,
                borderRadius: 9999,
                background: scheme.inputBg,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: fontBody,
                  fontSize: 15,
                  lineHeight: 1.4,
                  color: scheme.color,
                  padding: '0 16px',
                }}
              />
              <button
                type="submit"
                aria-label="Subscribe"
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  marginRight: 4,
                  border: 'none',
                  borderRadius: '50%',
                  background: 'transparent',
                  color: scheme.buttonColor,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <ArrowIcon color={scheme.buttonColor} />
              </button>
            </div>
          </EditorField>
        </form>
      </div>
    </EditorSection>
  );
}
