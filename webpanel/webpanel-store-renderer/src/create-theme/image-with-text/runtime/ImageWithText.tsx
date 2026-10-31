import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeLayout, useThemeColors } from '../../runtime/shared/tokens';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { StackedTealShirtsIllustration } from '../../product-highlight/runtime/FeaturedProductArt';
import { atMobileBreakpoint } from '../../runtime/shared/responsive';
import {
  imageWithTextImageMobileCss,
  readImageWithTextBodyStyle,
  readImageWithTextButtonStyle,
  readImageWithTextHeadingStyle,
  readImageWithTextImageStyle,
} from './imageWithTextBlockStyles';
import {
  imageWithTextContentMobileCss,
  readImageWithTextContentStyle,
} from './imageWithTextContentStyles';
import {
  alignItemsForPosition,
  readImageWithTextLayout,
  resolveImageWithTextBorderCss,
  scopedImageWithTextCss,
} from './imageWithTextStyles';

export function ImageWithText({
  sectionId = 'image_with_text',
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
    () => readImageWithTextLayout(config, settingsBase),
    [config, settingsBase]
  );

  const scheme = style.scheme;
  const sectionHeightPx = style.heightPx;
  const fixedHeight = Boolean(sectionHeightPx);
  const isHorizontal = style.direction === 'horizontal';

  const contentStyle = useMemo(
    () =>
      readImageWithTextContentStyle(
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

  const imageStyle = useMemo(
    () =>
      readImageWithTextImageStyle(
        config,
        settingsBase,
        scheme,
        sectionId,
        sectionHeightPx,
        isHorizontal
      ),
    [config, settingsBase, scheme, sectionId, sectionHeightPx, isHorizontal]
  );

  const headingStyle = useMemo(() => {
    const base = readImageWithTextHeadingStyle(config, settingsBase, scheme, fontHeading);
    return { ...base, textAlign: contentStyle.textAlign };
  }, [config, settingsBase, scheme, fontHeading, contentStyle.textAlign]);

  const bodyStyle = useMemo(() => {
    const base = readImageWithTextBodyStyle(config, settingsBase, scheme, fontBody);
    return { ...base, textAlign: contentStyle.textAlign };
  }, [config, settingsBase, scheme, fontBody, contentStyle.textAlign]);

  const buttonStyle = useMemo(
    () => readImageWithTextButtonStyle(config, settingsBase, scheme, sectionId, fontBody),
    [config, settingsBase, scheme, sectionId, fontBody]
  );

  const imageUrl = cfgString(config, `${settingsBase}.imageUrl`, '');
  const heading = cfgString(config, `${settingsBase}.heading`, 'Our signature product');
  const description = cfgString(
    config,
    `${settingsBase}.description`,
    'Made with care and unconditionally loved by our customers, this signature bestseller exceeds all expectations.'
  );
  const buttonLabel = cfgString(
    config,
    `${settingsBase}.buttonLabel`,
    cfgString(config, `${settingsBase}.linkLabel`, 'Shop now')
  );
  const buttonUrl = cfgString(
    config,
    `${settingsBase}.buttonUrl`,
    cfgString(config, `${settingsBase}.linkUrl`, '/collections/all')
  );

  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : maxWidth;
  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl ? style.backgroundImageUrl : null;
  // Background color only applies when there is no background image.
  const sectionBackground = bgImage
    ? 'transparent'
    : !style.backgroundColor || style.backgroundColor === 'default'
      ? scheme.background
      : resolveThemePaletteColorSetting(config, style.backgroundColor, 0, scheme.background);

  const shell: CSSProperties = {
    position: 'relative',
    background: sectionBackground,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    border: resolveImageWithTextBorderCss(config, style, scheme.color),
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
    // Fixed height options must constrain the row so columns stretch visibly.
    height: fixedHeight && isHorizontal ? sectionHeightPx : undefined,
    minHeight: fixedHeight ? sectionHeightPx : undefined,
    width: '100%',
    // Alignment is applied to the content column (text), not grid distribution —
    // 1fr/1fr columns already fill the row so justifyContent would be a no-op.
    alignItems: fixedHeight ? 'stretch' : alignItemsForPosition(style.position),
  };

  const contentBlockStyle: CSSProperties = {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: contentStyle.alignItems,
  };

  const buttonBlockStyle: CSSProperties = {
    ...contentBlockStyle,
    flexDirection: 'row',
    justifyContent: contentStyle.alignItems,
    alignItems: 'center',
  };

  const mobileStackClass =
    style.verticalOnMobile && isHorizontal
      ? `codiic-image-with-text-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`
      : '';

  const imageInner = (
    <EditorField
      fieldPath={`${settingsBase}.imageUrl`}
      label="Image"
      as="div"
      style={{
        ...imageStyle.media,
        background: imageUrl ? 'transparent' : imageStyle.media.background,
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" style={imageStyle.image} />
      ) : (
        <div style={imageStyle.placeholder}>
          <StackedTealShirtsIllustration />
        </div>
      )}
    </EditorField>
  );

  const imageShell = (
    <EditorBlock
      nodeId={`${editorNodeId}:block:image`}
      label="Image"
      style={imageStyle.panel}
    >
      {imageInner}
    </EditorBlock>
  );

  const columnWrapStyle: CSSProperties = {
    ...imageStyle.column,
    ...(fixedHeight && isHorizontal
      ? { height: '100%', minHeight: 0 }
      : null),
  };

  const imageColumn: ReactNode = imageStyle.linkUrl ? (
    <Link
      to={imageStyle.linkUrl}
      className={imageStyle.mobileClass || undefined}
      style={{ ...columnWrapStyle, textDecoration: 'none', color: 'inherit' }}
    >
      {imageShell}
    </Link>
  ) : (
    <div className={imageStyle.mobileClass || undefined} style={columnWrapStyle}>
      {imageShell}
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
      <EditorBlock
        nodeId={`${editorNodeId}:block:group:nested:heading`}
        label="Heading"
        style={contentBlockStyle}
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
        nodeId={`${editorNodeId}:block:group:nested:text`}
        label="Text"
        style={contentBlockStyle}
      >
        <EditorField
          fieldPath={`${settingsBase}.description`}
          label="Description"
          as="div"
          style={bodyStyle}
        >
          <ThemeEditorRichTextContent html={description} style={bodyStyle} inheritTypography />
        </EditorField>
      </EditorBlock>
      <EditorBlock
        nodeId={`${editorNodeId}:block:group:nested:button`}
        label="Button"
        style={buttonBlockStyle}
      >
        <EditorField fieldPath={`${settingsBase}.buttonLabel`} label="Button" as="span">
          {buttonUrl ? (
            <Link
              to={buttonUrl}
              target={buttonStyle.openInNewTab ? '_blank' : undefined}
              rel={buttonStyle.openInNewTab ? 'noopener noreferrer' : undefined}
              className={buttonStyle.mobileClass || undefined}
              style={buttonStyle.style}
            >
              {buttonLabel}
            </Link>
          ) : (
            <span className={buttonStyle.mobileClass || undefined} style={buttonStyle.style}>
              {buttonLabel}
            </span>
          )}
        </EditorField>
      </EditorBlock>
    </>
  );

  const contentShell = (
    <EditorBlock
      nodeId={`${editorNodeId}:block:group`}
      label="Group"
      className={contentStyle.mobileClass || undefined}
      style={contentStyle.shell}
    >
      {contentInner}
    </EditorBlock>
  );

  const contentColumn: ReactNode = contentStyle.linkUrl ? (
    <Link
      to={contentStyle.linkUrl}
      target={contentStyle.openInNewTab ? '_blank' : undefined}
      rel={contentStyle.openInNewTab ? 'noopener noreferrer' : undefined}
      style={{ ...columnWrapStyle, textDecoration: 'none', color: 'inherit' }}
    >
      {contentShell}
    </Link>
  ) : (
    <div style={columnWrapStyle}>{contentShell}</div>
  );

  const scopedCss = scopedImageWithTextCss(sectionId, style.customCss);
  const mobileCss = [
    mobileStackClass
      ? atMobileBreakpoint(
          [
            `.${mobileStackClass} { grid-template-columns: 1fr !important; grid-template-rows: auto auto !important; height: auto !important; min-height: 0 !important; }`,
            sectionHeightPx
              ? `.${mobileStackClass} .${imageStyle.mobileClass} { height: auto !important; min-height: ${sectionHeightPx}px !important; }`
              : '',
          ]
            .filter(Boolean)
            .join('\n')
        )
      : '',
    imageWithTextImageMobileCss(imageStyle.mobileClass, imageStyle.mobileWidthCss),
    imageWithTextContentMobileCss(contentStyle.mobileClass, contentStyle.mobileWidthCss),
    buttonStyle.mobileCss,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Image with text"
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
            pointerEvents: 'none',
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
            background: 'rgba(0,0,0,0.12)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ) : null}
      {scopedCss ? <style>{scopedCss}</style> : null}
      {mobileCss ? <style>{mobileCss}</style> : null}
      <div
        className={mobileStackClass || undefined}
        style={{ ...innerGrid, position: 'relative', zIndex: 1 }}
      >
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
