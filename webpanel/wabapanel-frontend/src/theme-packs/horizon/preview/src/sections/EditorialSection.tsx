import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { TealFoldedShirtIllustration } from '../components/EditorialArt';
import {
  editorialGridColumns,
  editorialMinHeight,
  readEditorialLayout,
  scopedEditorialCss,
} from '../lib/editorialStyles';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function EditorialSection({
  sectionId = 'editorial',
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

  const style = useMemo(() => readEditorialLayout(config, settingsBase), [config, settingsBase]);

  const imageUrl = cfgString(config, `${settingsBase}.imageUrl`, '');
  const subheading = cfgString(config, `${settingsBase}.subheading`);
  const heading = cfgString(config, `${settingsBase}.heading`);
  const description = cfgString(
    config,
    `${settingsBase}.description`,
    'Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations.'
  );
  const linkLabel = cfgString(config, `${settingsBase}.linkLabel`);
  const linkUrl = cfgString(config, `${settingsBase}.linkUrl`);
  const mediaPosition = cfgString(config, `${settingsBase}.mediaPosition`, 'left');

  const scheme = style.scheme;
  const mediaOnLeft = mediaPosition !== 'right';
  const panelMinHeight = editorialMinHeight(style.mediaHeight);
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  let gridColumns = editorialGridColumns(style.mediaWidth);
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

  const mediaPanel: CSSProperties = {
    background: scheme.mediaPanel,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    minHeight: panelMinHeight,
  };

  const contentPanel: CSSProperties = {
    background: scheme.contentPanel,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    textAlign: 'left',
    padding: '40px 48px',
    minHeight: panelMinHeight,
  };

  const subheadingStyle: CSSProperties = {
    margin: 0,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.02em',
    color: scheme.muted,
    textTransform: 'none',
  };

  const headingStyle: CSSProperties = {
    margin: '12px 0 0',
    fontFamily: fontHeading,
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.15,
    color: scheme.color,
  };

  const bodyStyle: CSSProperties = {
    margin: '16px 0 0',
    fontSize: 15,
    lineHeight: 1.55,
    color: scheme.muted,
    maxWidth: 420,
  };

  const linkStyle: CSSProperties = {
    marginTop: 24,
    fontSize: 15,
    fontWeight: 500,
    color: scheme.color,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  };

  const mediaColumn: ReactNode = (
    <div style={mediaPanel}>
      <EditorField fieldPath={`${settingsBase}.imageUrl`} label="Image" as="span">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            style={{ maxWidth: '100%', maxHeight: 280, objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <TealFoldedShirtIllustration />
        )}
      </EditorField>
    </div>
  );

  const contentColumn: ReactNode = (
    <div style={contentPanel}>
      <EditorField fieldPath={`${settingsBase}.subheading`} label="Subheading" as="p" style={subheadingStyle}>
        {subheading}
      </EditorField>
      <EditorField fieldPath={`${settingsBase}.heading`} label="Heading" as="h2" style={headingStyle}>
        {heading}
      </EditorField>
      <EditorField fieldPath={`${settingsBase}.description`} label="Description" as="p" style={bodyStyle}>
        {description}
      </EditorField>
      <EditorField fieldPath={`${settingsBase}.linkLabel`} label="Link label" as="span">
        {linkUrl ? (
          <Link to={linkUrl} style={linkStyle}>
            {linkLabel}
          </Link>
        ) : (
          <span style={linkStyle}>{linkLabel}</span>
        )}
      </EditorField>
    </div>
  );

  return (
    <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Editorial" style={shell}>
      {style.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: scopedEditorialCss(sectionId, style.customCss) }} />
      ) : null}
      <div style={grid}>
        {mediaColumn}
        {contentColumn}
      </div>
    </EditorSection>
  );
}
