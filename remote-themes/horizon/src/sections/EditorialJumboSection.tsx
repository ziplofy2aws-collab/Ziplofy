import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { StackedTealShirtsIllustration } from '../components/ProductHighlightArt';
import {
  jumboGridColumns,
  jumboMinHeight,
  readEditorialJumboLayout,
  scopedEditorialJumboCss,
} from '../lib/editorialJumboStyles';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

function headlineLines(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return ['UP', 'THE', 'ANTE'];
  if (trimmed.includes('\n')) {
    return trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  }
  return trimmed.split(/\s+/).filter(Boolean);
}

function readMediaPosition(config: Record<string, unknown> | null, settingsBase: string): string {
  const mediaPosition = cfgString(config, `${settingsBase}.mediaPosition`, '');
  if (mediaPosition === 'left' || mediaPosition === 'right') return mediaPosition;
  const textPosition = cfgString(config, `${settingsBase}.textPosition`, 'left');
  return textPosition === 'left' ? 'right' : 'left';
}

export function EditorialJumboSection({
  sectionId = 'editorial_jumbo',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readEditorialJumboLayout(config, settingsBase), [config, settingsBase]);

  const headline = cfgString(config, `${settingsBase}.headline`);
  const imageUrl = cfgString(config, `${settingsBase}.imageUrl`, '');
  const mediaPosition = readMediaPosition(config, settingsBase);

  const lines = headlineLines(headline);
  const scheme = style.scheme;
  const mediaOnLeft = mediaPosition !== 'right';
  const panelMinHeight = jumboMinHeight(style.mediaHeight);
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;

  let gridColumns = jumboGridColumns(style.mediaWidth);
  if (!mediaOnLeft) {
    const parts = gridColumns.split(' ');
    if (parts.length === 2) gridColumns = `${parts[1]} ${parts[0]}`;
  }

  const shell: CSSProperties = {
    background: scheme.background,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
  };

  const grid: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: gridColumns,
    minHeight: panelMinHeight,
    width: '100%',
    overflow: 'hidden',
  };

  const textPanel: CSSProperties = {
    background: scheme.textPanel,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '32px 40px 32px 32px',
    minHeight: panelMinHeight,
    boxSizing: 'border-box',
  };

  const mediaPanel: CSSProperties = {
    background: scheme.mediaPanel,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    minHeight: panelMinHeight,
    boxSizing: 'border-box',
  };

  const headlineStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontHeading,
    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
    fontWeight: 700,
    lineHeight: 0.95,
    letterSpacing: '-0.02em',
    textAlign: 'right',
    textTransform: 'uppercase',
    color: scheme.color,
    maxWidth: '100%',
  };

  const textColumn: ReactNode = (
    <div style={textPanel}>
      <EditorField fieldPath={`${settingsBase}.headline`} label="Headline" as="div" style={headlineStyle}>
        {lines.map((line, i) => (
          <span key={`${line}-${i}`} style={{ display: 'block' }}>
            {line}
          </span>
        ))}
      </EditorField>
    </div>
  );

  const mediaColumn: ReactNode = (
    <div style={mediaPanel}>
      <EditorField fieldPath={`${settingsBase}.imageUrl`} label="Image" as="span">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            style={{ maxWidth: '100%', maxHeight: panelMinHeight - 64, objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <StackedTealShirtsIllustration />
        )}
      </EditorField>
    </div>
  );

  return (
    <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Editorial: Jumbo text" style={shell}>
      {style.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: scopedEditorialJumboCss(sectionId, style.customCss) }} />
      ) : null}
      <div style={grid}>
        {mediaOnLeft ? (
          <>
            {mediaColumn}
            {textColumn}
          </>
        ) : (
          <>
            {textColumn}
            {mediaColumn}
          </>
        )}
      </div>
    </EditorSection>
  );
}
