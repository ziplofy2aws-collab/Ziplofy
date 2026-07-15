import { Link } from 'react-router-dom';
import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import {
  readTextBlockLayoutStyle,
  readTextBlockStyle,
} from '../../runtime/shared/textBlockStyles';
import type { SectionRuntimeProps } from '../../runtime/types';
import {
  heroHeadingTypographyCss,
  readHeroHeadingStyle,
  readHeroHeadingText,
} from '../../hero/runtime/heroHeadingStyles';
import { readHeroButtonStyle } from '../../hero/runtime/heroButtonStyles';
import { richTextHasBlockMarkup } from '../../../utils/theme-editor-rich-text.util';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import {
  readRichTextLayout,
  richTextBackgroundImageCss,
  richTextContentAlign,
  richTextJustifyContent,
  richTextOverlayBackground,
} from '../../rich-text/runtime/richTextStyles';

/** Section height presets sized for 404 content (rich-text presets are too small to notice). */
const NOT_FOUND_HEIGHT_MIN: Record<string, number | undefined> = {
  auto: undefined,
  small: 420,
  medium: 560,
  large: 720,
};

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href.trim());
}

/** 404 page message — heading, subtext, and continue-shopping button. */
export function NotFoundMain({
  sectionId = 'not_found_main',
  templateId = '404',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { maxWidth } = useThemeLayout();
  const { text, background, primary, muted, fontHeading, fontBody, link, border } =
    useThemeColors();

  const base = secBase(templateId, sectionId);
  const settingsBase = `${base}.settings`;
  const blocksBase = `${base}.blocks`;
  const editorNodeId = `template:${templateId}:${sectionId}`;
  const themeFonts = useMemo(() => ({ fontHeading, fontBody }), [fontHeading, fontBody]);
  const messageSettingsBase = `${blocksBase}.message.settings`;

  const container = useMemo(() => readRichTextLayout(config, settingsBase), [config, settingsBase]);
  const sectionMinHeight = NOT_FOUND_HEIGHT_MIN[container.height] ?? NOT_FOUND_HEIGHT_MIN.auto;
  const stageMinHeight =
    sectionMinHeight != null
      ? Math.max(0, sectionMinHeight - container.paddingTop - container.paddingBottom)
      : undefined;

  const headingText =
    readHeroHeadingText(config, settingsBase, blocksBase, 'heading') ||
    cfgString(config, `${blocksBase}.heading.settings.text`, 'Page not found');

  const messageText = cfgString(
    config,
    `${messageSettingsBase}.text`,
    'The link may be incorrect, or the page has been removed.'
  );

  const buttonLabel = cfgString(
    config,
    `${blocksBase}.primary_button.settings.label`,
    'Continue shopping'
  );
  const buttonHref =
    cfgString(config, `${blocksBase}.primary_button.settings.href`, '/') || '/';

  const backgroundColorRaw = cfgString(config, `${settingsBase}.backgroundColor`, '');
  const sectionBackground =
    backgroundColorRaw === '' || backgroundColorRaw === 'default'
      ? container.scheme.background
      : resolveThemePaletteColorSetting(
          config,
          backgroundColorRaw,
          0,
          container.scheme.background
        );

  const textColorRaw = cfgString(config, `${settingsBase}.textColor`, '');
  const sectionTextColor =
    textColorRaw === '' || textColorRaw === 'default'
      ? container.scheme.color || text
      : resolveThemePaletteColorSetting(config, textColorRaw, 1, container.scheme.color || text);
  const sectionMutedColor =
    textColorRaw === '' || textColorRaw === 'default'
      ? container.scheme.muted || muted || sectionTextColor
      : sectionTextColor;

  const headingStyle = readHeroHeadingStyle(config, settingsBase, themeFonts, {
    text: sectionTextColor,
    heading: sectionTextColor,
    link: link || primary,
  });

  const messageLayout = useMemo(
    () =>
      readTextBlockLayoutStyle(config, messageSettingsBase, {
        width: 'fill',
        maxWidth: 'normal',
        alignment: 'center',
      }),
    [config, messageSettingsBase]
  );

  const messageStyle = useMemo(
    () =>
      readTextBlockStyle(
        config,
        messageSettingsBase,
        themeFonts,
        sectionMutedColor,
        {
          width: 'fill',
          maxWidth: 'normal',
          alignment: 'center',
          typographyPreset: 'paragraph',
        }
      ),
    [config, messageSettingsBase, themeFonts, sectionMutedColor]
  );

  const messageFieldStyle: CSSProperties = useMemo(
    () => ({
      margin: 0,
      display: 'block',
      ...messageLayout,
      width: messageStyle.width,
      maxWidth: messageStyle.maxWidth,
      textAlign: messageStyle.textAlign,
      boxSizing: 'border-box',
      background: messageStyle.background,
      borderRadius: messageStyle.borderRadius || undefined,
      paddingTop: messageStyle.paddingTop || undefined,
      paddingBottom: messageStyle.paddingBottom || undefined,
      paddingLeft: messageStyle.paddingLeft || undefined,
      paddingRight: messageStyle.paddingRight || undefined,
    }),
    [messageLayout, messageStyle]
  );

  const messageContentStyle: CSSProperties = useMemo(
    () => ({
      margin: 0,
      fontFamily: messageStyle.fontFamily,
      fontSize: messageStyle.fontSize,
      fontWeight: messageStyle.fontWeight,
      ...(messageStyle.fontStyle ? { fontStyle: messageStyle.fontStyle } : {}),
      lineHeight: messageStyle.lineHeight,
      ...(messageStyle.letterSpacing ? { letterSpacing: messageStyle.letterSpacing } : {}),
      ...(messageStyle.textTransform ? { textTransform: messageStyle.textTransform } : {}),
      ...(messageStyle.textWrap
        ? { textWrap: messageStyle.textWrap as CSSProperties['textWrap'] }
        : {}),
      color: messageStyle.color,
      textAlign: messageStyle.textAlign,
    }),
    [messageStyle]
  );

  const buttonStyle = readHeroButtonStyle(
    config,
    `${blocksBase}.primary_button.settings`,
    'primary',
    { primary, background, text: sectionTextColor, line: border }
  );

  const textAlign = richTextContentAlign(container.layoutAlignment);
  const horizontalPad = container.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = container.sectionWidth === 'full' ? '100%' : maxWidth;
  const isHorizontal = container.direction === 'horizontal';

  const shell: CSSProperties = {
    position: 'relative',
    background: sectionBackground,
    backgroundColor: sectionBackground,
    color: sectionTextColor,
    paddingTop: container.paddingTop,
    paddingBottom: container.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    width: '100%',
    ...(sectionMinHeight != null ? { minHeight: sectionMinHeight } : {}),
    border: container.borderStyle === 'solid' ? `1px solid ${container.scheme.muted}33` : undefined,
    borderRadius: container.cornerRadius > 0 ? container.cornerRadius : undefined,
    overflow: container.cornerRadius > 0 ? 'hidden' : undefined,
    fontFamily: fontBody,
  };

  const bgImage =
    container.backgroundMedia === 'image' && container.backgroundImageUrl
      ? container.backgroundImageUrl
      : null;
  const bgFit = richTextBackgroundImageCss(container.backgroundImagePosition);

  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    ...(stageMinHeight != null ? { minHeight: stageMinHeight } : {}),
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    flexWrap: isHorizontal ? 'wrap' : undefined,
    alignItems: isHorizontal
      ? richTextJustifyContent(container.position)
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
      : richTextJustifyContent(container.position),
    gap: container.layoutGap,
    textAlign,
    position: 'relative',
    zIndex: 2,
  };

  const buttonCss = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box' as const,
    width: buttonStyle.width,
    maxWidth: '100%',
    minHeight: 46,
    padding: buttonStyle.padding,
    borderRadius: buttonStyle.borderRadius,
    background: buttonStyle.background,
    color: buttonStyle.color,
    fontWeight: buttonStyle.fontWeight,
    fontSize: buttonStyle.fontSize,
    fontFamily: fontBody,
    textDecoration: 'none',
    border: buttonStyle.border,
    cursor: 'pointer',
    lineHeight: 1.2,
    textAlign: 'center' as const,
  };

  const buttonInner = (
    <EditorField
      fieldPath={`${blocksBase}.primary_button.settings.label`}
      label="Button label"
      as="span"
      style={{ color: 'inherit', fontWeight: 'inherit' }}
    >
      {buttonLabel}
    </EditorField>
  );

  const openInNewTab = buttonStyle.openInNewTab;
  const btnScopeId = `${editorNodeId.replace(/:/g, '-')}-primary_button`;
  const btnResponsiveCss =
    buttonStyle.width !== buttonStyle.mobileWidth
      ? `@media (max-width: 749px) { [data-not-found-btn="${btnScopeId}"] { width: ${buttonStyle.mobileWidth} !important; } }`
      : '';

  const messageTag = richTextHasBlockMarkup(messageText) ? 'div' : 'p';

  return (
    <EditorSection
      sectionId={sectionId}
      label="404"
      editorNodeId={editorNodeId}
      style={shell}
    >
      {btnResponsiveCss ? <style>{btnResponsiveCss}</style> : null}
      {bgImage ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundPosition: 'center',
            ...bgFit,
            zIndex: 0,
          }}
        />
      ) : null}
      {bgImage && container.backgroundOverlay ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: richTextOverlayBackground(
              container.overlayColor,
              container.overlayOpacity
            ),
            zIndex: 1,
          }}
        />
      ) : null}
      <div style={stage}>
        <EditorBlock nodeId={`${editorNodeId}:block:heading`} label="Text">
          <EditorField
            fieldPath={`${settingsBase}.title`}
            label="Heading"
            as="h1"
            style={{
              margin: 0,
              width: headingStyle.width,
              maxWidth: headingStyle.maxWidth,
              textAlign: headingStyle.textAlign ?? textAlign,
              color: headingStyle.color,
              background: headingStyle.background,
              borderRadius: headingStyle.borderRadius,
              paddingTop: headingStyle.paddingTop,
              paddingBottom: headingStyle.paddingBottom,
              paddingLeft: headingStyle.paddingLeft,
              paddingRight: headingStyle.paddingRight,
              boxSizing: 'border-box',
              ...heroHeadingTypographyCss(headingStyle),
            }}
          >
            <ThemeEditorRichTextContent html={headingText} />
          </EditorField>
        </EditorBlock>

        <EditorBlock nodeId={`${editorNodeId}:block:message`} label="Text">
          <EditorField
            fieldPath={`${messageSettingsBase}.text`}
            label="Message"
            as={messageTag}
            style={messageFieldStyle}
          >
            <ThemeEditorRichTextContent html={messageText} style={messageContentStyle} />
          </EditorField>
        </EditorBlock>

        <EditorBlock nodeId={`${editorNodeId}:block:primary_button`} label="Button">
          {isExternalHref(buttonHref) || openInNewTab ? (
            <a
              href={buttonHref}
              data-not-found-btn={btnScopeId}
              style={buttonCss}
              target={openInNewTab ? '_blank' : undefined}
              rel={openInNewTab ? 'noopener noreferrer' : undefined}
            >
              {buttonInner}
            </a>
          ) : (
            <Link to={buttonHref} data-not-found-btn={btnScopeId} style={buttonCss}>
              {buttonInner}
            </Link>
          )}
        </EditorBlock>
      </div>
    </EditorSection>
  );
}
