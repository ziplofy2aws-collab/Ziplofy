import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import {
  pullQuoteContentAlign,
  pullQuoteJustifyContent,
  readPullQuoteLayout,
  scopedPullQuoteCss,
} from '../lib/pullQuoteStyles';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function PullQuoteSection({
  sectionId = 'pull_quote_section',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontHeading } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readPullQuoteLayout(config, settingsBase), [config, settingsBase]);

  const quote = cfgString(config, `${settingsBase}.quote`);
  const linkLabel = cfgString(config, `${settingsBase}.linkLabel`);
  const linkUrl = cfgString(config, `${settingsBase}.linkUrl`);

  const scheme = style.scheme;
  const textAlign = pullQuoteContentAlign(style.layoutAlignment);
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `ziplofy-pull-quote-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;

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

  const isHorizontal = style.direction === 'horizontal';
  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    minHeight: style.minHeightPx > 0 ? style.minHeightPx - style.paddingTop - style.paddingBottom : undefined,
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    flexWrap: isHorizontal ? 'wrap' : undefined,
    alignItems: isHorizontal
      ? pullQuoteJustifyContent(style.position)
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
      : pullQuoteJustifyContent(style.position),
    gap: style.layoutGap,
    textAlign,
    position: 'relative',
    zIndex: 2,
  };

  const quoteStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontHeading,
    fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
    maxWidth: 720,
  };

  const linkStyle: CSSProperties = {
    fontSize: '1rem',
    fontWeight: 500,
    color: 'inherit',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  };

  const customCss = scopedPullQuoteCss(sectionId, style.customCss);

  return (
    <EditorSection sectionId={sectionId} label="Pull quote" editorNodeId={editorNodeId} style={shell}>
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
        <EditorField fieldPath={`${settingsBase}.quote`} label="Quote" as="p" style={quoteStyle}>
          {quote}
        </EditorField>
        {linkLabel ? (
          <EditorField fieldPath={`${settingsBase}.linkLabel`} label="Link label" as="span">
            <Link to={linkUrl || '#'} style={linkStyle}>
              {linkLabel}
            </Link>
          </EditorField>
        ) : null}
      </div>
    </EditorSection>
  );
}
