import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { ImageCompareSlider } from '../components/ImageCompareSlider';
import {
  alignItemsForPosition,
  imageCompareMinHeight,
  justifyContentForAlignment,
  readImageCompareLayout,
  scopedImageCompareCss,
} from '../lib/imageCompareStyles';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

const buttonBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 22px',
  borderRadius: 999,
  border: '1px solid currentColor',
  fontSize: 14,
  fontWeight: 500,
  textDecoration: 'none',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export function ImageCompareSection({
  sectionId = 'image_compare',
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

  const style = useMemo(() => readImageCompareLayout(config, settingsBase), [config, settingsBase]);

  const heading = cfgString(config, `${settingsBase}.heading`);
  const subheading = cfgString(config, `${settingsBase}.subheading`);
  const button1Label = cfgString(config, `${settingsBase}.button1Label`);
  const button1Url = cfgString(config, `${settingsBase}.button1Url`);
  const button2Label = cfgString(config, `${settingsBase}.button2Label`);
  const button2Url = cfgString(config, `${settingsBase}.button2Url`);
  const imageBeforeUrl = cfgString(config, `${settingsBase}.imageBeforeUrl`, '');
  const imageAfterUrl = cfgString(config, `${settingsBase}.imageAfterUrl`, '');

  const scheme = style.scheme;
  const panelMinHeight = imageCompareMinHeight(style.height);
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const isHorizontal = style.direction === 'horizontal';

  const shell: CSSProperties = {
    position: 'relative',
    background: scheme.background,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    border:
      style.borderStyle === 'solid' ? `1px solid ${scheme.muted}33` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: 'hidden',
  };

  const innerGrid: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: isHorizontal ? '1fr 1fr' : '1fr',
    gridTemplateRows: isHorizontal ? undefined : 'auto auto',
    gap: style.layoutGap,
    minHeight: panelMinHeight,
    width: '100%',
    alignItems: alignItemsForPosition(style.position),
    justifyContent: justifyContentForAlignment(style.layoutAlignment),
  };

  const mobileStackClass =
    style.verticalOnMobile && isHorizontal
      ? `ziplofy-image-compare-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`
      : '';

  const contentPanel: CSSProperties = {
    background: scheme.contentPanel,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    textAlign: 'left',
    padding: '48px 56px',
    minHeight: isHorizontal ? panelMinHeight : undefined,
    boxSizing: 'border-box',
  };

  const comparePanel: CSSProperties = {
    background: scheme.comparePanel,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    minHeight: isHorizontal ? panelMinHeight : 280,
    boxSizing: 'border-box',
  };

  const headingStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontHeading,
    fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
    fontWeight: 700,
    lineHeight: 1.15,
    color: scheme.color,
  };

  const subheadingStyle: CSSProperties = {
    margin: '14px 0 0',
    fontSize: 16,
    lineHeight: 1.5,
    color: scheme.muted,
    maxWidth: 400,
  };

  const buttonsRow: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 28,
  };

  const contentColumn: ReactNode = (
    <div style={contentPanel}>
      <EditorField fieldPath={`${settingsBase}.heading`} label="Heading" as="h2" style={headingStyle}>
        {heading}
      </EditorField>
      <EditorField fieldPath={`${settingsBase}.subheading`} label="Subheading" as="p" style={subheadingStyle}>
        {subheading}
      </EditorField>
      <div style={buttonsRow}>
        <EditorField fieldPath={`${settingsBase}.button1Label`} label="Button" as="span">
          {button1Url ? (
            <Link to={button1Url} style={buttonBase}>
              {button1Label}
            </Link>
          ) : (
            <span style={buttonBase}>{button1Label}</span>
          )}
        </EditorField>
        <EditorField fieldPath={`${settingsBase}.button2Label`} label="Button" as="span">
          {button2Url ? (
            <Link to={button2Url} style={buttonBase}>
              {button2Label}
            </Link>
          ) : (
            <span style={buttonBase}>{button2Label}</span>
          )}
        </EditorField>
      </div>
    </div>
  );

  const compareColumn: ReactNode = (
    <div style={comparePanel}>
      <div style={{ width: '100%' }}>
        <ImageCompareSlider
          beforeUrl={imageBeforeUrl || undefined}
          afterUrl={imageAfterUrl || undefined}
          minHeight={panelMinHeight - 64}
        />
      </div>
    </div>
  );

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl
      ? style.backgroundImageUrl
      : null;

  return (
    <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Image compare" style={shell}>
      {bgImage ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {style.backgroundOverlay ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.12)',
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {style.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: scopedImageCompareCss(sectionId, style.customCss) }} />
      ) : null}
      {mobileStackClass ? (
        <style>{`
          @media (max-width: 749px) {
            .${mobileStackClass} {
              grid-template-columns: 1fr !important;
              grid-template-rows: auto auto !important;
            }
          }
        `}</style>
      ) : null}
      <div className={mobileStackClass || undefined} style={{ ...innerGrid, position: 'relative', zIndex: 1 }}>
        {style.compareFirst ? (
          <>
            {compareColumn}
            {contentColumn}
          </>
        ) : (
          <>
            {contentColumn}
            {compareColumn}
          </>
        )}
      </div>
    </EditorSection>
  );
}
