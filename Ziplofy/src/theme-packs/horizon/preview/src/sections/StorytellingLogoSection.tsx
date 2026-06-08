import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import {
  readStorytellingLogoLayout,
  scopedStorytellingLogoCss,
  storytellingLogoJustify,
  storytellingLogoSizeVars,
} from '../lib/storytellingLogoStyles';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

function logoFontFamily(
  role: string,
  fonts: { fontHeading: string; fontBody: string }
): string {
  if (role === 'body' || role === 'subheading') return fonts.fontBody;
  return fonts.fontHeading;
}

function logoFontStyle(role: string): CSSProperties {
  if (role === 'accent') return { fontStyle: 'italic' };
  if (role === 'subheading') return { fontWeight: 600 };
  if (role === 'body') return { fontWeight: 400 };
  return { fontWeight: 700 };
}

export function StorytellingLogoSection({
  sectionId = 'storytelling_logo',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontHeading, fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(
    () => readStorytellingLogoLayout(config, settingsBase),
    [config, settingsBase]
  );

  const logoText = cfgString(config, `${settingsBase}.logoText`);
  const logoImageUrl = cfgString(config, `${settingsBase}.logoImageUrl`, '');
  const logoLinkUrl = cfgString(config, `${settingsBase}.logoLinkUrl`, '/');

  const scheme = style.scheme;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `ziplofy-storytelling-logo-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const sizeVars = storytellingLogoSizeVars(style);
  const justify = storytellingLogoJustify(style.layoutAlignment);

  const shell: CSSProperties = {
    position: 'relative',
    background: scheme.background,
    color: scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    ...sizeVars,
  };

  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: justify,
    textAlign: style.layoutAlignment,
    boxSizing: 'border-box',
  };

  const logoBox: CSSProperties = {
    width: style.sizeUnit === 'percent' ? `var(--logo-width, ${style.percentWidth}%)` : 'auto',
    maxWidth: '100%',
    maxHeight:
      style.sizeUnit === 'pixel'
        ? `calc(var(--logo-height, ${style.pixelHeight}px) + 0px)`
        : undefined,
    fontSize: style.sizeUnit === 'pixel' ? `var(--logo-height, ${style.pixelHeight}px)` : undefined,
    lineHeight: 1.05,
    fontFamily: logoFontFamily(style.logoFont, { fontHeading, fontBody }),
    ...logoFontStyle(style.logoFont),
    color: scheme.color,
  };

  const logoMark = logoImageUrl ? (
    <EditorField fieldPath={`${settingsBase}.logoImageUrl`} label="Logo image" as="span" style={logoBox}>
      <img
        src={logoImageUrl}
        alt={logoText || 'Store logo'}
        style={{
          display: 'block',
          width: style.sizeUnit === 'percent' ? '100%' : 'auto',
          maxWidth: '100%',
          maxHeight: style.sizeUnit === 'pixel' ? style.pixelHeight : 120,
          objectFit: 'contain',
        }}
      />
    </EditorField>
  ) : (
    <EditorField fieldPath={`${settingsBase}.logoText`} label="Logo text" as="span" style={logoBox}>
      {logoText}
    </EditorField>
  );

  const logoContent =
    logoLinkUrl && logoLinkUrl !== '#' ? (
      <Link to={logoLinkUrl} style={{ display: 'inline-flex', textDecoration: 'none', color: 'inherit' }}>
        {logoMark}
      </Link>
    ) : (
      logoMark
    );

  const scopedCss = scopedStorytellingLogoCss(sectionId, style.customCss);

  return (
    <EditorSection nodeId={editorNodeId} label="Logo">
      <section className={scopeClass} style={shell} data-section-type="storytelling-logo">
        {scopedCss ? <style>{scopedCss}</style> : null}
        <div style={stage}>{logoContent}</div>
      </section>
    </EditorSection>
  );
}
