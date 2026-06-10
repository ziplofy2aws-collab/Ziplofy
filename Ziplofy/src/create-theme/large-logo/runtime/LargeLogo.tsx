import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { LARGE_LOGO_BODY } from '../../../utils/hero-banner-variants.util';
import { readHeroStyle, scopedHeroCss } from '../../hero/runtime/heroStyles';
import {
  readTextBlockLayoutStyle,
  readTextBlockStyle,
} from '../../runtime/shared/textBlockStyles';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { richTextHasBlockMarkup } from '../../../utils/theme-editor-rich-text.util';
import {
  largeLogoImageStyle,
  largeLogoMarkStyle,
  readLargeLogoBlockLayout,
  scopedLargeLogoBlockMobileCss,
} from './largeLogoBlockStyles';
import { scopedLargeLogoMobileCss } from './largeLogoStyles';

type Props = {
  sectionId: string;
  placement?: 'layout' | 'template';
  templateId?: string;
};

function settingsBase(sectionId: string, placement: 'layout' | 'template', templateId: string): string {
  return placement === 'template'
    ? `templates.${templateId}.sections.${sectionId}.settings`
    : `sections.${sectionId}.settings`;
}

function blocksBase(sectionId: string, placement: 'layout' | 'template', templateId: string): string {
  return placement === 'template'
    ? `templates.${templateId}.sections.${sectionId}.blocks`
    : `sections.${sectionId}.blocks`;
}

function sectionNodeId(sectionId: string, placement: 'layout' | 'template', templateId: string): string {
  return placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;
}

function blockNodeId(
  sectionId: string,
  placement: 'layout' | 'template',
  templateId: string,
  blockId: string
): string {
  return `${sectionNodeId(sectionId, placement, templateId)}:block:${blockId}`;
}

function crossAxisAlign(textAlign: 'left' | 'center' | 'right'): string {
  return textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';
}

export function LargeLogo({
  sectionId,
  placement = 'template',
  templateId = 'index',
}: Props) {
  const config = useThemeConfig();
  const { fontHeading, fontBody, background, text } = useThemeColors();

  const settingsPath = settingsBase(sectionId, placement, templateId);
  const blocksPath = blocksBase(sectionId, placement, templateId);
  const shellClass = `ziplofy-large-logo-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const editorNodeId = sectionNodeId(sectionId, placement, templateId);

  const hero = useMemo(
    () => readHeroStyle(config, settingsPath, { background, color: text, muted: '#6b7280' }),
    [config, settingsPath, background, text]
  );

  const cornerText =
    cfgString(config, `${blocksPath}.text_2.settings.text`, '') ||
    cfgString(config, `${settingsPath}.subtitle`, LARGE_LOGO_BODY);
  const logoTitle =
    cfgString(config, `${blocksPath}.logo.settings.text`, '').trim() ||
    cfgString(config, `${settingsPath}.title`, 'My Store').trim() ||
    'My Store';
  const logoImageUrl =
    cfgString(config, `${blocksPath}.logo.settings.imageUrl`, '').trim() ||
    cfgString(config, `${settingsPath}.defaultLogoUrl`, '').trim();

  const isHorizontal = hero.contentDirection === 'row';
  const spreadVerticalBlocks = hero.contentColumnFill && !isHorizontal;
  const padTop = hero.paddingTop;
  const padBottom = hero.paddingBottom;
  const padX = 40;
  const sectionMinHeight = hero.minHeight;
  const contentMaxWidth =
    typeof hero.maxWidth === 'number' ? hero.maxWidth : hero.maxWidth === '100%' ? '100%' : layout.maxWidth;

  const backgroundMedia = cfgString(config, `${settingsPath}.backgroundMedia`, 'none');
  const backgroundImageUrl = cfgString(config, `${settingsPath}.backgroundImageUrl`, '');
  const hasBgImage = backgroundMedia === 'image' && Boolean(backgroundImageUrl.trim());
  const borderStyle = cfgString(config, `${settingsPath}.borderStyle`, 'none');
  const cornerRadius = cfgNumber(config, `${settingsPath}.cornerRadius`, 0);
  const sectionBorder = borderStyle === 'solid' ? `1px solid ${hero.scheme.muted}55` : undefined;

  const largeLogoOverlay =
    hero.mediaOverlay && hasBgImage
      ? hero.overlayStyle === 'gradient'
        ? hero.overlayGradientDirection === 'down'
          ? `linear-gradient(180deg, transparent 0%, ${hero.overlayColor} 100%)`
          : `linear-gradient(180deg, ${hero.overlayColor} 0%, transparent 100%)`
        : hero.overlayColor
      : undefined;

  const logoSettingsBase = `${blocksPath}.logo.settings`;
  const logoBlockLayout = useMemo(
    () => readLargeLogoBlockLayout(config, logoSettingsBase),
    [config, logoSettingsBase]
  );

  const scopedCss = scopedHeroCss(sectionId, hero.customCss);
  const responsiveCss = [
    scopedLargeLogoMobileCss(shellClass),
    scopedLargeLogoBlockMobileCss(shellClass, logoBlockLayout),
  ]
    .filter(Boolean)
    .join('\n');

  const titleAlign = hero.textAlign;
  const stageJustify = crossAxisAlign(titleAlign);

  const cornerTextBase = `${blocksPath}.text_2.settings`;
  const cornerTextLayout = useMemo(
    () => readTextBlockLayoutStyle(config, cornerTextBase),
    [config, cornerTextBase]
  );
  const cornerTextStyle = useMemo(
    () =>
      readTextBlockStyle(
        config,
        cornerTextBase,
        { fontHeading, fontBody },
        hero.scheme.color
      ),
    [config, cornerTextBase, fontHeading, fontBody, hero.scheme.color]
  );

  const inner = (
    <div
      className={shellClass}
      style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: contentMaxWidth,
        margin: '0 auto',
        minHeight: sectionMinHeight,
        padding: `${padTop}px ${padX}px ${padBottom}px`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        justifyContent: isHorizontal
          ? hero.contentJustify
          : spreadVerticalBlocks
            ? hero.contentColumnJustify
            : hero.sectionJustify,
        alignItems: isHorizontal ? hero.contentAlign : crossAxisAlign(titleAlign),
        gap: hero.gap,
        borderRadius: cornerRadius > 0 ? cornerRadius : undefined,
        border: sectionBorder,
        overflow: cornerRadius > 0 ? 'hidden' : undefined,
      }}
    >
      {cornerText.trim() ? (
        <EditorBlock nodeId={blockNodeId(sectionId, placement, templateId, 'text_2')} label="Text">
          <div
            className="ziplofy-large-logo-corner"
            style={{
              ...cornerTextLayout,
              flex: isHorizontal ? '0 1 300px' : undefined,
              boxSizing: 'border-box',
            }}
          >
            <EditorField
              fieldPath={`${blocksPath}.text_2.settings.text`}
              label="Text"
              as={richTextHasBlockMarkup(cornerText) ? 'div' : 'p'}
              style={{
                margin: 0,
                width: '100%',
                maxWidth: '100%',
                textAlign: cornerTextStyle.textAlign,
                boxSizing: 'border-box',
              }}
            >
              <ThemeEditorRichTextContent html={cornerText} style={cornerTextStyle} />
            </EditorField>
          </div>
        </EditorBlock>
      ) : null}
      <EditorBlock nodeId={blockNodeId(sectionId, placement, templateId, 'logo')} label="Logo">
        <div
          className="ziplofy-large-logo-stage"
          style={{
            flex: spreadVerticalBlocks || isHorizontal ? 1 : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: stageJustify,
            paddingTop: isHorizontal ? 0 : spreadVerticalBlocks ? 0 : 32,
            paddingBottom: isHorizontal ? 0 : spreadVerticalBlocks ? 0 : 24,
            minHeight: isHorizontal ? undefined : spreadVerticalBlocks ? 200 : 280,
            width: isHorizontal ? undefined : '100%',
          }}
        >
          {logoImageUrl ? (
            <EditorField
              fieldPath={`${blocksPath}.logo.settings.imageUrl`}
              label="Image"
              as="div"
            >
              <img
                src={logoImageUrl}
                alt={logoTitle}
                className="ziplofy-large-logo-mark"
                style={{
                  ...largeLogoImageStyle(logoBlockLayout),
                  margin:
                    titleAlign === 'center'
                      ? '0 auto'
                      : titleAlign === 'right'
                        ? '0 0 0 auto'
                        : undefined,
                }}
              />
            </EditorField>
          ) : (
            <EditorField
              fieldPath={`${blocksPath}.logo.settings.text`}
              label="Text"
              as="h1"
              className="ziplofy-large-logo-mark"
              style={largeLogoMarkStyle(
                logoBlockLayout,
                { fontHeading, fontBody },
                hero.scheme.color,
                titleAlign
              )}
            >
              {logoTitle}
            </EditorField>
          )}
        </div>
      </EditorBlock>
    </div>
  );

  const body = hero.sectionLink ? (
    <Link
      to={hero.sectionLink}
      target={hero.sectionLinkNewTab ? '_blank' : undefined}
      rel={hero.sectionLinkNewTab ? 'noopener noreferrer' : undefined}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
    >
      {inner}
    </Link>
  ) : (
    inner
  );

  return (
    <>
      {scopedCss ? <style>{scopedCss}</style> : null}
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      <EditorSection
        sectionId={sectionId}
        editorNodeId={editorNodeId}
        label="Large logo"
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          minHeight: sectionMinHeight,
          padding: 0,
          background: hero.scheme.background,
          fontFamily: fontBody,
          color: hero.scheme.color,
          boxSizing: 'border-box',
        }}
      >
        {hasBgImage ? (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: `center/cover url(${backgroundImageUrl}) no-repeat`,
            }}
          />
        ) : null}
        {largeLogoOverlay ? (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: largeLogoOverlay,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        ) : null}
        {body}
      </EditorSection>
    </>
  );
}
