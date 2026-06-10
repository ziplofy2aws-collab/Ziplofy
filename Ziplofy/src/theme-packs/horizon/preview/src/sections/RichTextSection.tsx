import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import {
  readRichTextLayout,
  richTextContentAlign,
  richTextJustifyContent,
  scopedRichTextCss,
} from '../lib/richTextStyles';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function RichTextSection({
  sectionId = 'rich_text_section',
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

  const style = useMemo(() => readRichTextLayout(config, settingsBase), [config, settingsBase]);

  const DEFAULT_HEADING = 'New arrivals';
  const DEFAULT_TEXT =
    'We make things that work better and last longer. Our products solve real problems with clean design and honest materials.';

  const heading = cfgString(config, `${settingsBase}.heading`, DEFAULT_HEADING) || DEFAULT_HEADING;
  const text = cfgString(config, `${settingsBase}.text`, DEFAULT_TEXT) || DEFAULT_TEXT;
  const buttonLabel = cfgString(config, `${settingsBase}.buttonLabel`, 'Shop now');
  const buttonUrl = cfgString(config, `${settingsBase}.buttonUrl`, '/collections');

  const scheme = style.scheme;
  const textAlign = richTextContentAlign(style.layoutAlignment);
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `ziplofy-rich-text-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const isHorizontal = style.direction === 'horizontal';

  const shell: CSSProperties = {
    position: 'relative',
    background: scheme.background,
    color: scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    minHeight: style.minHeightPx > 0 ? style.minHeightPx : undefined,
    border: style.borderStyle === 'solid' ? `1px solid ${scheme.muted}33` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: style.cornerRadius > 0 ? 'hidden' : undefined,
  };

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl
      ? style.backgroundImageUrl
      : null;

  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    minHeight:
      style.minHeightPx > 0 ? style.minHeightPx - style.paddingTop - style.paddingBottom : undefined,
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    flexWrap: isHorizontal ? 'wrap' : undefined,
    alignItems: isHorizontal
      ? richTextJustifyContent(style.position)
      : textAlign === 'center'
        ? 'center'
        : textAlign === 'right'
          ? 'flex-end'
          : 'flex-start',
    justifyContent: isHorizontal
      ? textAlign === 'center'
        ? 'center'
        : textAlign === 'right'
          ? 'flex-end'
          : 'flex-start'
      : richTextJustifyContent(style.position),
    gap: style.layoutGap,
    textAlign,
    position: 'relative',
    zIndex: 2,
  };

  const headingStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontHeading,
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    color: scheme.color,
  };

  const bodyStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontBody,
    fontSize: '1rem',
    lineHeight: 1.55,
    maxWidth: 520,
    color: scheme.muted,
  };

  const buttonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 28px',
    borderRadius: 8,
    background: '#000000',
    color: '#ffffff',
    fontSize: '0.9375rem',
    fontWeight: 500,
    fontFamily: fontBody,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  const customCss = scopedRichTextCss(sectionId, style.customCss);

  return (
    <EditorSection sectionId={sectionId} label="Rich text" editorNodeId={editorNodeId} style={shell}>
      {customCss ? <style>{customCss}</style> : null}
      {bgImage ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
      ) : null}
      {style.backgroundOverlay && bgImage ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1,
          }}
        />
      ) : null}
      <div className={scopeClass} style={stage}>
        <EditorField fieldPath={`${settingsBase}.heading`} label="Heading" as="h2" style={headingStyle}>
          {heading}
        </EditorField>
        <EditorField fieldPath={`${settingsBase}.text`} label="Text" as="p" style={bodyStyle}>
          {text}
        </EditorField>
        {buttonLabel ? (
          <EditorField fieldPath={`${settingsBase}.buttonLabel`} label="Button label" as="span">
            <Link to={buttonUrl || '#'} style={buttonStyle}>
              {buttonLabel}
            </Link>
          </EditorField>
        ) : null}
      </div>
    </EditorSection>
  );
}
