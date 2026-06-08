import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { StackedTealShirtsIllustration } from '../components/ProductHighlightArt';
import {
  alignItemsForPosition,
  imageWithTextMinHeight,
  justifyContentForAlignment,
  readImageWithTextLayout,
  scopedImageWithTextCss,
} from '../lib/imageWithTextStyles';
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
  padding: '12px 28px',
  borderRadius: 999,
  background: '#111827',
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 500,
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  marginTop: 28,
};

export function ImageWithTextSection({
  sectionId = 'image_with_text',
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

  const style = useMemo(() => readImageWithTextLayout(config, settingsBase), [config, settingsBase]);

  const imageUrl = cfgString(config, `${settingsBase}.imageUrl`, '');
  const heading = cfgString(config, `${settingsBase}.heading`);
  const description = cfgString(
    config,
    `${settingsBase}.description`,
    'Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations.'
  );
  const buttonLabel = cfgString(
    config,
    `${settingsBase}.buttonLabel`,
    cfgString(config, `${settingsBase}.linkLabel`)
  );
  const buttonUrl = cfgString(
    config,
    `${settingsBase}.buttonUrl`,
    cfgString(config, `${settingsBase}.linkUrl`)
  );

  const scheme = style.scheme;
  const panelMinHeight = imageWithTextMinHeight(style.height);
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
    border: style.borderStyle === 'solid' ? `1px solid ${scheme.muted}33` : undefined,
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
      ? `ziplofy-image-with-text-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`
      : '';

  const imagePanel: CSSProperties = {
    background: scheme.imagePanel,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    minHeight: isHorizontal ? panelMinHeight : 280,
    boxSizing: 'border-box',
  };

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

  const headingStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontHeading,
    fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
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

  const imageColumn: ReactNode = (
    <div style={imagePanel}>
      <EditorField fieldPath={`${settingsBase}.imageUrl`} label="Image" as="span">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <StackedTealShirtsIllustration />
        )}
      </EditorField>
    </div>
  );

  const contentColumn: ReactNode = (
    <div style={contentPanel}>
      <EditorField fieldPath={`${settingsBase}.heading`} label="Heading" as="h2" style={headingStyle}>
        {heading}
      </EditorField>
      <EditorField fieldPath={`${settingsBase}.description`} label="Description" as="p" style={bodyStyle}>
        {description}
      </EditorField>
      <EditorField fieldPath={`${settingsBase}.buttonLabel`} label="Button" as="span">
        {buttonUrl ? (
          <Link to={buttonUrl} style={buttonBase}>
            {buttonLabel}
          </Link>
        ) : (
          <span style={buttonBase}>{buttonLabel}</span>
        )}
      </EditorField>
    </div>
  );

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl ? style.backgroundImageUrl : null;

  return (
    <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Image with text" style={shell}>
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
        <style dangerouslySetInnerHTML={{ __html: scopedImageWithTextCss(sectionId, style.customCss) }} />
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
        {style.imageFirst ? (
          <>
            {imageColumn}
            {contentColumn}
          </>
        ) : (
          <>
            {contentColumn}
            {imageColumn}
          </>
        )}
      </div>
    </EditorSection>
  );
}
