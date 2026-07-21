import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import {
  footerColorScheme,
  footerGap,
  footerPadding,
  footerSectionWidth,
  scopedFooterCss,
} from '../lib/footerStyles';
import { readNewsletterBlockStyle } from '../lib/newsletterStyles';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = { sectionId?: string };

function NewsletterSubmit({
  label,
  display,
  style,
  colors,
  fontFamily,
  borderRadius,
}: {
  label: string;
  display: 'text' | 'arrow';
  style: 'link' | 'button';
  colors: { color: string; background: string; border: string };
  fontFamily: string;
  borderRadius: number;
}) {
  const content = display === 'arrow' ? '→' : label;

  if (style === 'link') {
    return (
      <button
        type="submit"
        aria-label={display === 'arrow' ? label : undefined}
        style={{
          flexShrink: 0,
          border: 'none',
          background: 'transparent',
          color: colors.color,
          fontFamily,
          fontSize: display === 'arrow' ? 20 : 15,
          fontWeight: 600,
          cursor: 'pointer',
          padding: '8px 14px',
          textDecoration: display === 'text' ? 'underline' : 'none',
          lineHeight: 1,
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <button
      type="submit"
      aria-label={display === 'arrow' ? label : undefined}
      style={{
        flexShrink: 0,
        border: 'none',
        borderRadius,
        background: colors.color,
        color: colors.background,
        fontFamily,
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        padding: '12px 24px',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {content}
    </button>
  );
}

export function Footer({ sectionId = 'footer' }: Props) {
  const config = useThemeConfig();
  const { fontHeading, fontBody, text, background, primary } = useThemeColors();
  const [email, setEmail] = useState('');

  const settingsBase = `sections.${sectionId}.settings`;
  const newsletterBase = `sections.${sectionId}.blocks.newsletter.settings`;

  const sectionStyle = useMemo(() => {
    const scheme = footerColorScheme(config, settingsBase, {
      background: '#f6f6f7',
      color: '#111827',
      border: '#e5e7eb',
    });
    const widthMode = footerSectionWidth(config, settingsBase);
    const gap = footerGap(config, settingsBase);
    const { paddingTop, paddingBottom } = footerPadding(config, settingsBase);
    const customCss = cfgString(config, `${settingsBase}.customCss`, '');

    return {
      scheme,
      widthMode,
      gap,
      paddingTop,
      paddingBottom,
      customCss,
    };
  }, [config, settingsBase]);

  const newsletterStyle = useMemo(
    () =>
      readNewsletterBlockStyle(
        config,
        newsletterBase,
        sectionStyle.scheme,
        { fontHeading, fontBody },
        { text, background, primary }
      ),
    [config, newsletterBase, sectionStyle.scheme, fontHeading, fontBody, text, background, primary]
  );

  const title = cfgString(config, `${newsletterBase}.title`);
  const subtitle = cfgString(config, `${newsletterBase}.subtitle`);
  const placeholder = cfgString(config, `${newsletterBase}.placeholder`);
  const buttonLabel = cfgString(config, `${newsletterBase}.buttonLabel`);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  const innerMaxWidth = sectionStyle.widthMode === 'full' ? '100%' : layout.maxWidth;
  const horizontalPad = sectionStyle.widthMode === 'full' ? 24 : layout.padX;
  const pillRadius = newsletterStyle.input.borderRadius;
  const mutedText = 'rgba(55, 65, 81, 0.9)';

  const row: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
    width: '100%',
    flexWrap: 'wrap',
  };

  const copyColumn: CSSProperties = {
    flex: '1 1 260px',
    minWidth: 0,
  };

  const formRow: CSSProperties = {
    flex: '0 1 440px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 280,
    width: '100%',
    maxWidth: 440,
  };

  const inputFieldStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    fontFamily: newsletterStyle.input.fontFamily,
    fontSize: newsletterStyle.input.fontSize,
    fontWeight: newsletterStyle.input.fontWeight,
    lineHeight: newsletterStyle.input.lineHeight,
    color: newsletterStyle.input.color,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: '12px 20px',
    width: '100%',
    boxSizing: 'border-box',
  };

  const inputPill: CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    border:
      newsletterStyle.input.borderStyle === 'none'
        ? 'none'
        : `${newsletterStyle.input.borderWidth}px solid ${newsletterStyle.input.borderColor}`,
    borderRadius: pillRadius,
    background: '#ffffff',
  };

  const integratedPill: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
    border:
      newsletterStyle.input.borderStyle === 'none'
        ? 'none'
        : `${newsletterStyle.input.borderWidth}px solid ${newsletterStyle.input.borderColor}`,
    borderRadius: pillRadius,
    background: '#ffffff',
  };

  const showCopy = Boolean(title.trim() || subtitle.trim());

  return (
    <EditorSection
      sectionId={sectionId}
      label="Footer"
      style={{
        marginTop: 64,
        background: sectionStyle.scheme.background || '#f6f6f7',
        color: sectionStyle.scheme.color,
        borderTop: `1px solid ${sectionStyle.scheme.border}`,
        fontFamily: fontBody,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
        paddingLeft: horizontalPad,
        paddingRight: horizontalPad,
        boxSizing: 'border-box',
      }}
    >
      {sectionStyle.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: scopedFooterCss(sectionId, sectionStyle.customCss) }} />
      ) : null}
      <div
        style={{
          maxWidth: innerMaxWidth,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <EditorBlock nodeId={`layout:${sectionId}:block:newsletter`} label="Email signup">
          <div style={row}>
            {showCopy ? (
              <div style={copyColumn}>
                {title.trim() ? (
                  <EditorField
                    fieldPath={`${newsletterBase}.title`}
                    label="Heading"
                    as="h2"
                    style={{
                      margin: 0,
                      fontFamily: newsletterStyle.heading.fontFamily,
                      fontSize: newsletterStyle.heading.fontSize,
                      fontWeight: newsletterStyle.heading.fontWeight,
                      lineHeight: newsletterStyle.heading.lineHeight,
                      color: newsletterStyle.heading.color,
                    }}
                  >
                    {title}
                  </EditorField>
                ) : null}
                {subtitle.trim() ? (
                  <EditorField
                    fieldPath={`${newsletterBase}.subtitle`}
                    label="Subtext"
                    as="p"
                    style={{
                      margin: title.trim() ? '8px 0 0' : 0,
                      fontFamily: fontBody,
                      fontSize: 15,
                      fontWeight: 400,
                      lineHeight: 1.5,
                      color: mutedText,
                      maxWidth: 360,
                    }}
                  >
                    {subtitle}
                  </EditorField>
                ) : null}
              </div>
            ) : null}

            <form
              onSubmit={onSubmit}
              style={{
                ...formRow,
                ...(showCopy ? {} : { flex: '1 1 100%', maxWidth: '100%' }),
              }}
            >
              {newsletterStyle.submit.integrated ? (
                <EditorField fieldPath={`${newsletterBase}.placeholder`} label="Email placeholder" as="span">
                  <div style={integratedPill}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={placeholder}
                      style={inputFieldStyle}
                      aria-label={placeholder}
                    />
                    <EditorField fieldPath={`${newsletterBase}.buttonLabel`} label="Button label">
                      <NewsletterSubmit
                        label={buttonLabel}
                        display={newsletterStyle.submit.display}
                        style={newsletterStyle.submit.style}
                        colors={newsletterStyle.colors}
                        fontFamily={fontBody}
                        borderRadius={pillRadius}
                      />
                    </EditorField>
                  </div>
                </EditorField>
              ) : (
                <>
                  <EditorField fieldPath={`${newsletterBase}.placeholder`} label="Email placeholder" as="span">
                    <div style={inputPill}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={placeholder}
                        style={inputFieldStyle}
                        aria-label={placeholder}
                      />
                    </div>
                  </EditorField>
                  <EditorField fieldPath={`${newsletterBase}.buttonLabel`} label="Button label">
                    <NewsletterSubmit
                      label={buttonLabel}
                      display={newsletterStyle.submit.display}
                      style={newsletterStyle.submit.style}
                      colors={{
                        color: '#111827',
                        background: '#ffffff',
                        border: sectionStyle.scheme.border,
                      }}
                      fontFamily={fontBody}
                      borderRadius={pillRadius}
                    />
                  </EditorField>
                </>
              )}
            </form>
          </div>
        </EditorBlock>
      </div>
    </EditorSection>
  );
}
