import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorField, EditorSection, EditorBlock } from '../../runtime/shared/editorAttrs';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { ImageCompareSlider } from './ImageCompareSlider';
import {
  imageCompareContentMobileCss,
  readImageCompareContentStyle,
} from './imageCompareContentStyles';
import {
  alignItemsForPosition,
  imageCompareMinHeight,
  justifyContentForAlignment,
  readImageCompareLayout,
  scopedImageCompareCss,
} from './imageCompareStyles';
import {
  imageCompareSliderMobileCss,
  readImageCompareSliderStyle,
} from './imageCompareSliderStyles';

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

export function ImageCompare({
  sectionId = 'image_compare',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(
    () => readImageCompareLayout(config, settingsBase),
    [config, settingsBase]
  );

  const sliderStyle = useMemo(
    () => readImageCompareSliderStyle(config, settingsBase, style.scheme, sectionId),
    [config, settingsBase, style.scheme, sectionId]
  );

  const scheme = style.scheme;
  const panelMinHeight = imageCompareMinHeight(style.height);
  const isHorizontal = style.direction === 'horizontal';

  const contentStyle = useMemo(
    () => readImageCompareContentStyle(config, settingsBase, scheme, sectionId, panelMinHeight, isHorizontal),
    [config, settingsBase, scheme, sectionId, panelMinHeight, isHorizontal]
  );

  const heading = cfgString(config, `${settingsBase}.heading`, 'Find your perfect fit');
  const subheading = cfgString(
    config,
    `${settingsBase}.subheading`,
    'Discover the best of both worlds'
  );
  const button1Label = cfgString(config, `${settingsBase}.button1Label`, 'View all');
  const button1Url = cfgString(config, `${settingsBase}.button1Url`, '/collections');
  const button2Label = cfgString(config, `${settingsBase}.button2Label`, 'Shop now');
  const button2Url = cfgString(config, `${settingsBase}.button2Url`, '/products');

  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;

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
      ? `ziplofy-image-compare-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`
      : '';

  const mutedColor = contentStyle.shell.color === scheme.color ? scheme.muted : '#4b5563';

  const headingStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontHeading,
    fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
    fontWeight: 700,
    lineHeight: 1.15,
    color: 'inherit',
  };

  const subheadingStyle: CSSProperties = {
    margin: '14px 0 0',
    fontSize: 16,
    lineHeight: 1.5,
    color: mutedColor,
    maxWidth: 400,
  };

  const buttonsRow: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 28,
    justifyContent:
      contentStyle.shell.textAlign === 'center'
        ? 'center'
        : contentStyle.shell.textAlign === 'right'
          ? 'flex-end'
          : 'flex-start',
  };

  const contentInner: ReactNode = (
    <>
      {contentStyle.bgImage ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${contentStyle.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {contentStyle.showOverlay ? (
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
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
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
    </>
  );

  const contentShell = (
    <EditorBlock
      nodeId={`${editorNodeId}:block:content`}
      label="Content"
      className={contentStyle.mobileClass || undefined}
      style={contentStyle.shell}
    >
      {contentInner}
    </EditorBlock>
  );

  const contentColumn: ReactNode =
    contentStyle.linkUrl ? (
      <Link
        to={contentStyle.linkUrl}
        target={contentStyle.openInNewTab ? '_blank' : undefined}
        rel={contentStyle.openInNewTab ? 'noopener noreferrer' : undefined}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        {contentShell}
      </Link>
    ) : (
      contentShell
    );

  const comparePanel: CSSProperties = {
    background: sliderStyle.inheritColorScheme ? scheme.comparePanel : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${sliderStyle.paddingTop}px ${sliderStyle.paddingRight}px ${sliderStyle.paddingBottom}px ${sliderStyle.paddingLeft}px`,
    minHeight: isHorizontal ? panelMinHeight : 280,
    boxSizing: 'border-box',
  };

  const compareColumn: ReactNode = (
    <EditorBlock nodeId={`${editorNodeId}:block:comparison_slider`} label="Comparison slider" style={comparePanel}>
      <ImageCompareSlider
        beforeUrl={sliderStyle.beforeUrl || undefined}
        afterUrl={sliderStyle.afterUrl || undefined}
        direction={sliderStyle.direction}
        textOnImages={sliderStyle.textOnImages}
        wrapStyle={sliderStyle.wrap}
        mobileClass={sliderStyle.mobileClass}
        paddingTop={0}
        paddingBottom={0}
        paddingLeft={0}
        paddingRight={0}
        minHeight={panelMinHeight - 64}
      />
    </EditorBlock>
  );

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl ? style.backgroundImageUrl : null;
  const scopedCss = scopedImageCompareCss(sectionId, style.customCss);
  const mobileCss = [
    mobileStackClass
      ? `@media (max-width: 749px) { .${mobileStackClass} { grid-template-columns: 1fr !important; grid-template-rows: auto auto !important; } }`
      : '',
    imageCompareSliderMobileCss(sliderStyle.mobileClass, sliderStyle.mobileWidthCss),
    imageCompareContentMobileCss(contentStyle.mobileClass, contentStyle.mobileWidthCss),
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Image compare"
      style={shell}
    >
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
      {scopedCss ? <style>{scopedCss}</style> : null}
      {mobileCss ? <style>{mobileCss}</style> : null}
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
