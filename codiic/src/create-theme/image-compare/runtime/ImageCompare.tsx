import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorField, EditorSection, EditorBlock } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeLayout, useThemeColors } from '../../runtime/shared/tokens';
import { ImageCompareSlider } from './ImageCompareSlider';
import {
  imageCompareContentMobileCss,
  readImageCompareContentStyle,
} from './imageCompareContentStyles';
import {
  imageCompareNestedGroupMobileCss,
  readImageCompareButtonStyle,
  readImageCompareHeadingStyle,
  readImageCompareNestedGroupStyle,
  readImageCompareSubheadingStyle,
} from './imageCompareBlockStyles';
import {
  alignItemsForPosition,
  readImageCompareLayout,
  resolveImageCompareBorderCss,
  scopedImageCompareCss,
} from './imageCompareStyles';
import {
  imageCompareSliderMobileCss,
  readImageCompareSliderStyle,
} from './imageCompareSliderStyles';
import { atMobileBreakpoint } from '../../runtime/shared/responsive';

export function ImageCompare({
  sectionId = 'image_compare',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const { maxWidth } = useThemeLayout();
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
  const sectionHeightPx = style.heightPx;
  const fixedHeight = Boolean(sectionHeightPx);
  const isHorizontal = style.direction === 'horizontal';

  const contentStyle = useMemo(
    () =>
      readImageCompareContentStyle(
        config,
        settingsBase,
        scheme,
        sectionId,
        sectionHeightPx,
        isHorizontal,
        style.position,
        style.layoutAlignment
      ),
    [
      config,
      settingsBase,
      scheme,
      sectionId,
      sectionHeightPx,
      isHorizontal,
      style.position,
      style.layoutAlignment,
    ]
  );

  const textGroupStyle = useMemo(
    () =>
      readImageCompareNestedGroupStyle(config, settingsBase, 'textGroup', scheme, sectionId, {
        direction: 'vertical',
        layoutAlignment: 'center',
        layoutGap: 12,
      }),
    [config, settingsBase, scheme, sectionId]
  );

  const buttonsGroupStyle = useMemo(
    () =>
      readImageCompareNestedGroupStyle(config, settingsBase, 'buttonsGroup', scheme, sectionId, {
        direction: 'horizontal',
        layoutAlignment: 'center',
        layoutGap: 12,
      }),
    [config, settingsBase, scheme, sectionId]
  );

  const headingStyle = useMemo(
    () => ({
      ...readImageCompareHeadingStyle(config, settingsBase, scheme, fontHeading),
      textAlign: contentStyle.textAlign,
      // Section Alignment moves the whole text+buttons cluster; don't pin blocks to the left.
      alignSelf: 'stretch' as const,
    }),
    [config, settingsBase, scheme, fontHeading, contentStyle.textAlign]
  );

  const subheadingStyle = useMemo(
    () => ({
      ...readImageCompareSubheadingStyle(config, settingsBase, scheme, fontBody),
      textAlign: contentStyle.textAlign,
      alignSelf: 'stretch' as const,
    }),
    [config, settingsBase, scheme, fontBody, contentStyle.textAlign]
  );

  const button1Style = useMemo(
    () =>
      readImageCompareButtonStyle(config, settingsBase, scheme, sectionId, 'button1', fontBody),
    [config, settingsBase, scheme, sectionId, fontBody]
  );

  const button2Style = useMemo(
    () =>
      readImageCompareButtonStyle(config, settingsBase, scheme, sectionId, 'button2', fontBody),
    [config, settingsBase, scheme, sectionId, fontBody]
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
  const button2Url = cfgString(config, `${settingsBase}.button2Url`, '/collections/all');

  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : maxWidth;

  const shell: CSSProperties = {
    position: 'relative',
    background: style.backgroundColor,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    border: resolveImageCompareBorderCss(
      config,
      {
        borderStyle: style.borderStyle,
        borderThickness: style.borderThickness,
        borderOpacity: style.borderOpacity,
        borderColor: style.borderColor,
      },
      scheme.muted
    ),
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: 'hidden',
  };

  const innerGrid: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: isHorizontal ? '1fr 1fr' : '1fr',
    gridTemplateRows: isHorizontal
      ? fixedHeight
        ? '1fr'
        : undefined
      : 'auto auto',
    gap: style.layoutGap,
    height: fixedHeight && isHorizontal ? sectionHeightPx : undefined,
    minHeight: fixedHeight ? sectionHeightPx : undefined,
    width: '100%',
    // Stretch so Position / Alignment can place content inside the taller media column.
    alignItems: isHorizontal ? 'stretch' : alignItemsForPosition(style.position),
  };

  const mobileStackClass =
    style.verticalOnMobile && isHorizontal
      ? `codiic-image-compare-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`
      : '';

  const wrapGroupBg = (
    group: typeof textGroupStyle,
    children: ReactNode
  ): ReactNode => (
    <>
      {group.bgImage ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${group.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {group.showOverlay ? (
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
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'inherit',
          flexWrap: 'inherit',
          alignItems: 'inherit',
          justifyContent: 'inherit',
          gap: 'inherit',
        }}
      >
        {children}
      </div>
    </>
  );

  const textGroupInner = wrapGroupBg(
    textGroupStyle,
    <>
      <EditorBlock
        nodeId={`${editorNodeId}:block:content:nested:text:nested:heading`}
        label="Heading"
        style={{ width: '100%', maxWidth: '100%' }}
      >
        <EditorField
          fieldPath={`${settingsBase}.heading`}
          label="Heading"
          as="div"
          style={headingStyle}
        >
          <ThemeEditorRichTextContent html={heading} style={headingStyle} inheritTypography />
        </EditorField>
      </EditorBlock>
      <EditorBlock
        nodeId={`${editorNodeId}:block:content:nested:text:nested:subheading`}
        label="Subheading"
        style={{ width: '100%', maxWidth: '100%' }}
      >
        <EditorField
          fieldPath={`${settingsBase}.subheading`}
          label="Subheading"
          as="div"
          style={subheadingStyle}
        >
          <ThemeEditorRichTextContent
            html={subheading}
            style={subheadingStyle}
            inheritTypography
          />
        </EditorField>
      </EditorBlock>
    </>
  );

  const textGroupShell = (
    <EditorBlock
      nodeId={`${editorNodeId}:block:content:nested:text`}
      label="Text"
      className={textGroupStyle.mobileClass || undefined}
      style={{
        ...textGroupStyle.shell,
        // Shrink-wrap with the buttons so section Alignment shifts the whole stack.
        width: 'fit-content',
        maxWidth: '100%',
        alignItems: 'stretch',
        textAlign: contentStyle.textAlign,
      }}
    >
      {textGroupInner}
    </EditorBlock>
  );

  const textGroupColumn: ReactNode = textGroupStyle.linkUrl ? (
    <Link
      to={textGroupStyle.linkUrl}
      target={textGroupStyle.openInNewTab ? '_blank' : undefined}
      rel={textGroupStyle.openInNewTab ? 'noopener noreferrer' : undefined}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: 'fit-content', maxWidth: '100%' }}
    >
      {textGroupShell}
    </Link>
  ) : (
    textGroupShell
  );

  const buttonsGroupInner = wrapGroupBg(
    buttonsGroupStyle,
    <>
      <EditorBlock
        nodeId={`${editorNodeId}:block:content:nested:buttons:nested:button_1`}
        label="Button"
      >
        <EditorField fieldPath={`${settingsBase}.button1Label`} label="Button" as="span">
          {button1Url ? (
            <Link
              to={button1Url}
              target={button1Style.openInNewTab ? '_blank' : undefined}
              rel={button1Style.openInNewTab ? 'noopener noreferrer' : undefined}
              className={button1Style.mobileClass}
              style={button1Style.style}
            >
              {button1Label}
            </Link>
          ) : (
            <span className={button1Style.mobileClass} style={button1Style.style}>
              {button1Label}
            </span>
          )}
        </EditorField>
      </EditorBlock>
      <EditorBlock
        nodeId={`${editorNodeId}:block:content:nested:buttons:nested:button_2`}
        label="Button"
      >
        <EditorField fieldPath={`${settingsBase}.button2Label`} label="Button" as="span">
          {button2Url ? (
            <Link
              to={button2Url}
              target={button2Style.openInNewTab ? '_blank' : undefined}
              rel={button2Style.openInNewTab ? 'noopener noreferrer' : undefined}
              className={button2Style.mobileClass}
              style={button2Style.style}
            >
              {button2Label}
            </Link>
          ) : (
            <span className={button2Style.mobileClass} style={button2Style.style}>
              {button2Label}
            </span>
          )}
        </EditorField>
      </EditorBlock>
    </>
  );

  const buttonsGroupShell = (
    <EditorBlock
      nodeId={`${editorNodeId}:block:content:nested:buttons`}
      label="Buttons"
      className={buttonsGroupStyle.mobileClass || undefined}
      style={{
        ...buttonsGroupStyle.shell,
        // Keep buttons grouped; section Alignment moves the whole content cluster.
        width: 'fit-content',
        maxWidth: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      {buttonsGroupInner}
    </EditorBlock>
  );

  const buttonsGroupColumn: ReactNode = buttonsGroupStyle.linkUrl ? (
    <Link
      to={buttonsGroupStyle.linkUrl}
      target={buttonsGroupStyle.openInNewTab ? '_blank' : undefined}
      rel={buttonsGroupStyle.openInNewTab ? 'noopener noreferrer' : undefined}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: 'fit-content', maxWidth: '100%' }}
    >
      {buttonsGroupShell}
    </Link>
  ) : (
    buttonsGroupShell
  );

  const contentCluster: ReactNode = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: 'fit-content',
        maxWidth: '100%',
        // Keep heading / subheading / buttons sharing one edge; parent Alignment moves this block.
        alignItems: 'flex-start',
      }}
    >
      {textGroupColumn}
      {buttonsGroupColumn}
    </div>
  );

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
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: contentStyle.alignItems,
          justifyContent: contentStyle.stackJustify,
        }}
      >
        {contentStyle.stackJustify === 'space-between' ? (
          <>
            <div
              style={{
                width: 'fit-content',
                maxWidth: '100%',
                alignSelf: contentStyle.alignItems,
              }}
            >
              {textGroupColumn}
            </div>
            <div
              style={{
                width: 'fit-content',
                maxWidth: '100%',
                alignSelf: contentStyle.alignItems,
              }}
            >
              {buttonsGroupColumn}
            </div>
          </>
        ) : (
          contentCluster
        )}
      </div>
    </>
  );

  const contentShell = (
    <EditorBlock
      nodeId={`${editorNodeId}:block:content`}
      label="Content"
      className={contentStyle.mobileClass || undefined}
      style={{
        ...contentStyle.shell,
        ...(isHorizontal ? { height: '100%', minHeight: 0 } : null),
      }}
    >
      {contentInner}
    </EditorBlock>
  );

  const columnWrapStyle: CSSProperties = isHorizontal
    ? { height: '100%', minHeight: 0, display: 'block' }
    : {};

  const contentColumn: ReactNode = contentStyle.linkUrl ? (
    <Link
      to={contentStyle.linkUrl}
      target={contentStyle.openInNewTab ? '_blank' : undefined}
      rel={contentStyle.openInNewTab ? 'noopener noreferrer' : undefined}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', ...columnWrapStyle }}
    >
      {contentShell}
    </Link>
  ) : columnWrapStyle.height ? (
    <div style={columnWrapStyle}>{contentShell}</div>
  ) : (
    contentShell
  );

  const comparePanel: CSSProperties = {
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${sliderStyle.paddingTop}px ${sliderStyle.paddingRight}px ${sliderStyle.paddingBottom}px ${sliderStyle.paddingLeft}px`,
    height: isHorizontal ? '100%' : undefined,
    minHeight: fixedHeight
      ? isHorizontal
        ? 0
        : sectionHeightPx
      : isHorizontal
        ? undefined
        : 280,
    boxSizing: 'border-box',
  };

  const compareColumn: ReactNode = (
    <div style={columnWrapStyle.height ? columnWrapStyle : undefined}>
      <EditorBlock
        nodeId={`${editorNodeId}:block:comparison_slider`}
        label="Comparison slider"
        style={comparePanel}
      >
        <ImageCompareSlider
          beforeUrl={sliderStyle.beforeUrl || undefined}
          afterUrl={sliderStyle.afterUrl || undefined}
          direction={sliderStyle.direction}
          textOnImages={sliderStyle.textOnImages}
          sliderColor={sliderStyle.sliderColor}
          sliderInnerColor={sliderStyle.sliderInnerColor}
          wrapStyle={{
            ...sliderStyle.wrap,
            maxWidth: '100%',
            // Explicit height kills CSS aspect-ratio — only fill the column in Adapt mode.
            ...(fixedHeight && !sliderStyle.aspectRatio
              ? {
                  height: isHorizontal ? '100%' : sectionHeightPx,
                  minHeight: Math.max(0, (sectionHeightPx ?? 0) - 64),
                }
              : sliderStyle.aspectRatio
                ? {
                    height: 'auto',
                    minHeight: undefined,
                    maxHeight: fixedHeight && isHorizontal ? '100%' : undefined,
                  }
                : null),
          }}
          mobileClass={sliderStyle.mobileClass}
          paddingTop={0}
          paddingBottom={0}
          paddingLeft={0}
          paddingRight={0}
          minHeight={
            sliderStyle.aspectRatio
              ? undefined
              : fixedHeight
                ? Math.max(160, (sectionHeightPx ?? 280) - 64)
                : 280
          }
        />
      </EditorBlock>
    </div>
  );

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl ? style.backgroundImageUrl : null;
  const scopedCss = scopedImageCompareCss(sectionId, style.customCss);
  const mobileCss = [
    mobileStackClass
      ? atMobileBreakpoint(
          [
            `.${mobileStackClass} { grid-template-columns: 1fr !important; grid-template-rows: auto auto !important; height: auto !important; }`,
            fixedHeight && sectionHeightPx
              ? `.${mobileStackClass} > * { height: auto !important; min-height: ${sectionHeightPx}px !important; }`
              : '',
          ]
            .filter(Boolean)
            .join(' ')
        )
      : '',
    imageCompareSliderMobileCss(sliderStyle.mobileClass, sliderStyle.mobileWidthCss),
    imageCompareContentMobileCss(contentStyle.mobileClass, contentStyle.mobileWidthCss),
    imageCompareNestedGroupMobileCss(textGroupStyle.mobileClass, textGroupStyle.mobileWidthCss),
    imageCompareNestedGroupMobileCss(
      buttonsGroupStyle.mobileClass,
      buttonsGroupStyle.mobileWidthCss
    ),
    button1Style.mobileCss,
    button2Style.mobileCss,
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
            opacity: style.backgroundColor === 'transparent' ? 1 : 0.35,
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
      <div
        className={mobileStackClass || undefined}
        style={{ ...innerGrid, position: 'relative', zIndex: 1 }}
      >
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
