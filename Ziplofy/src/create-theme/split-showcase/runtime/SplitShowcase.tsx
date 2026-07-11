import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { useThemeColors } from '../../runtime/shared/tokens';
import { readHeroHeadingText } from '../../hero/runtime/heroHeadingStyles';
import { readHeroStyle, scopedHeroCss } from '../../hero/runtime/heroStyles';
import { splitShowcaseResponsiveCss } from './splitShowcaseStyles';
import { LayeredSlideshowSlideMedia } from '../../layered-slideshow/runtime/LayeredSlideshowArt';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';

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

const SPLIT_TEXT_PRESETS: Record<
  string,
  { fontSize: string; fontWeight: number; lineHeight: number }
> = {
  default: { fontSize: 'clamp(1.5rem, 2.45vw, 2rem)', fontWeight: 700, lineHeight: 1.1 },
  paragraph: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.55 },
  body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.55 },
  'heading-1': { fontSize: 'clamp(2.25rem, 5vw, 3.25rem)', fontWeight: 700, lineHeight: 1.1 },
  'heading-2': { fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.15 },
  'heading-3': { fontSize: 'clamp(1.5rem, 3.2vw, 2rem)', fontWeight: 700, lineHeight: 1.2 },
  'heading-4': { fontSize: 'clamp(1.25rem, 2.6vw, 1.625rem)', fontWeight: 600, lineHeight: 1.25 },
  'heading-5': { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3 },
  'heading-6': { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
};

function SplitShowcaseTile({
  imageUrl,
  peekVariant,
  title,
  textBase,
  groupBase,
  titleFieldPath,
  titleBlockNodeId,
  titleBlockLabel,
  buttonBlockId,
  blocksBase,
  sectionNodePrefix,
  showOverlay,
  fontHeading,
  fontBody,
}: {
  imageUrl: string;
  peekVariant: 'figure' | 'landscape';
  title: string;
  textBase: string;
  groupBase: string;
  titleFieldPath: string;
  titleBlockNodeId: string;
  titleBlockLabel: string;
  buttonBlockId: string;
  blocksBase: string;
  sectionNodePrefix: string;
  showOverlay: boolean;
  fontHeading: string;
  fontBody: string;
}) {
  const config = useThemeConfig();
  const buttonBase = `${blocksBase}.${buttonBlockId}.settings`;
  const label = cfgString(config, `${buttonBase}.label`, 'Shop now');
  const href = cfgString(config, `${buttonBase}.href`, '/collections/all');
  const buttonStyleMode = cfgString(config, `${buttonBase}.buttonStyle`, 'primary');
  const linkTextColorRaw = cfgString(config, `${buttonBase}.linkTextColor`, '');

  const groupBgMedia = cfgString(config, `${groupBase}.backgroundMedia`, 'none');
  const groupBgImage = cfgString(config, `${groupBase}.backgroundImageUrl`, '');
  const groupBgImagePosition = cfgString(config, `${groupBase}.backgroundImagePosition`, 'cover');
  const groupBgOverlay = cfgBool(config, `${groupBase}.backgroundOverlay`, false);
  const groupBorderStyle = cfgString(config, `${groupBase}.borderStyle`, 'none');
  const groupCornerRadius = cfgNumber(config, `${groupBase}.cornerRadius`, 0);
  const hasGroupImage = groupBgMedia === 'image' && groupBgImage.trim().length > 0;

  const hasImage = imageUrl.trim().length > 0;
  /** Dark text reads cleanly on the light illustration; white text suits a photo + overlay. */
  const onDarkMedia = (hasImage && showOverlay) || (hasGroupImage && groupBgOverlay);

  const tileStyle: CSSProperties = {
    position: 'relative',
    flex: '1 1 50%',
    minWidth: 0,
    minHeight: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: hasGroupImage ? undefined : '#f3efe6',
    backgroundImage: hasGroupImage ? `url(${groupBgImage})` : undefined,
    backgroundSize: hasGroupImage ? (groupBgImagePosition === 'fit' ? 'contain' : 'cover') : undefined,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    border: groupBorderStyle === 'solid' ? '1px solid rgba(0, 0, 0, 0.12)' : undefined,
    borderRadius: groupCornerRadius > 0 ? groupCornerRadius : undefined,
  };

  const preset = cfgString(config, `${textBase}.typographyPreset`, 'default');
  const presetStyle = SPLIT_TEXT_PRESETS[preset] ?? SPLIT_TEXT_PRESETS.default;
  const widthMode = cfgString(config, `${textBase}.width`, 'fit');
  const textColorRaw = cfgString(config, `${textBase}.textColor`, '');
  const bgEnabled = cfgBool(config, `${textBase}.backgroundEnabled`, false);
  const cornerRadius = cfgNumber(config, `${textBase}.cornerRadius`, 0);
  const padTop = cfgNumber(config, `${textBase}.paddingTop`, 0);
  const padBottom = cfgNumber(config, `${textBase}.paddingBottom`, 0);
  const padLeft = cfgNumber(config, `${textBase}.paddingLeft`, 0);
  const padRight = cfgNumber(config, `${textBase}.paddingRight`, 0);

  const defaultHeadingColor = onDarkMedia ? '#ffffff' : '#111827';
  const headingColor =
    textColorRaw === '' || textColorRaw === 'default'
      ? defaultHeadingColor
      : resolveThemePaletteColorSetting(config, textColorRaw, 1, defaultHeadingColor);

  const headingStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontHeading,
    fontSize: presetStyle.fontSize,
    fontWeight: presetStyle.fontWeight,
    lineHeight: presetStyle.lineHeight,
    letterSpacing: '-0.02em',
    color: headingColor,
    textAlign: 'center',
    textShadow: onDarkMedia ? '0 2px 16px rgba(0, 0, 0, 0.35)' : 'none',
    width: widthMode === 'fill' ? '100%' : 'fit-content',
    paddingTop: padTop || undefined,
    paddingBottom: padBottom || undefined,
    paddingLeft: padLeft || undefined,
    paddingRight: padRight || undefined,
    background: bgEnabled ? 'rgba(0, 0, 0, 0.04)' : undefined,
    borderRadius: bgEnabled && cornerRadius > 0 ? cornerRadius : bgEnabled ? 8 : undefined,
    boxSizing: 'border-box',
  };

  const linkColor =
    buttonStyleMode === 'link' && linkTextColorRaw && linkTextColorRaw !== 'default'
      ? resolveThemePaletteColorSetting(config, linkTextColorRaw, 1, defaultHeadingColor)
      : defaultHeadingColor;

  const linkStyle: CSSProperties = {
    fontFamily: fontBody,
    fontSize: 13,
    fontWeight: 500,
    color: linkColor,
    textDecoration: buttonStyleMode === 'link' ? 'underline' : 'none',
    textUnderlineOffset: 4,
  };

  return (
    <div className="split-showcase-tile" style={tileStyle}>
      <LayeredSlideshowSlideMedia
        imageUrl={hasImage ? imageUrl : undefined}
        peekVariant={peekVariant}
        figureWidth={peekVariant === 'figure' ? '118%' : '80%'}
        figureHeight={peekVariant === 'figure' ? '158%' : '112%'}
        figureMaxWidth={peekVariant === 'figure' ? 900 : 520}
      />
      {onDarkMedia ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.35)',
          }}
        />
      ) : null}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          width: '100%',
          height: '100%',
          padding: 0,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            transform: 'translateY(-50%)',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            padding: '0 24px',
            boxSizing: 'border-box',
          }}
        >
          {title.trim() ? (
            <EditorBlock nodeId={titleBlockNodeId} label={titleBlockLabel}>
              <EditorField fieldPath={titleFieldPath} label="Text" as="h2" style={headingStyle}>
                <ThemeEditorRichTextContent html={title} />
              </EditorField>
            </EditorBlock>
          ) : null}
        </div>
        {label.trim() ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: '8%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <EditorBlock
              nodeId={`${sectionNodePrefix}:block:${buttonBlockId}`}
              label="Button"
            >
              <Link to={href} style={linkStyle}>
                <EditorField fieldPath={`${buttonBase}.label`} label="Label">
                  {label}
                </EditorField>
              </Link>
            </EditorBlock>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SplitShowcase({
  sectionId,
  placement = 'template',
  templateId = 'index',
}: Props) {
  const config = useThemeConfig();
  const { fontHeading, fontBody, background, text } = useThemeColors();

  const settingsPath = settingsBase(sectionId, placement, templateId);
  const blocksPath = blocksBase(sectionId, placement, templateId);
  const sectionNodePrefix = sectionNodeId(sectionId, placement, templateId);

  const hero = useMemo(
    () => readHeroStyle(config, settingsPath, { background, color: text, muted: '#9ca3af' }),
    [config, settingsPath, background, text]
  );

  const leftTextBase = `${settingsPath}.group1Text.settings`;
  const rightTextBase = `${settingsPath}.group2Text.settings`;
  const leftTitle =
    cfgString(config, `${leftTextBase}.text`, '') ||
    readHeroHeadingText(config, settingsPath, blocksPath, 'heading') ||
    'New arrivals';
  const rightTitle =
    cfgString(config, `${rightTextBase}.text`, '') ||
    cfgString(config, `${blocksPath}.text_right.settings.text`, '') ||
    'Bestsellers';

  const backgroundColorSetting = cfgString(config, `${settingsPath}.backgroundColor`, '');
  const sectionBackground =
    backgroundColorSetting && backgroundColorSetting !== 'default'
      ? resolveThemePaletteColorSetting(config, backgroundColorSetting, 0, hero.scheme.background)
      : hero.scheme.background;

  const borderStyle = cfgString(config, `${settingsPath}.borderStyle`, 'none');
  const cornerRadiusRaw = Number(cfgString(config, `${settingsPath}.cornerRadius`, '0'));
  const cornerRadius = Number.isFinite(cornerRadiusRaw) ? cornerRadiusRaw : 0;
  const sectionBorder =
    borderStyle === 'solid' ? '1px solid rgba(0, 0, 0, 0.12)' : undefined;

  const scopedCss = scopedHeroCss(sectionId, hero.customCss);
  const responsiveCss = splitShowcaseResponsiveCss(sectionId, hero.verticalOnMobile);

  const sectionMinHeight =
    typeof hero.minHeight === 'number' ? hero.minHeight : hero.minHeight === '100vh' ? '100vh' : 680;

  return (
    <>
      {scopedCss ? <style>{scopedCss}</style> : null}
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      <EditorSection
        sectionId={sectionId}
        editorNodeId={sectionNodePrefix}
        label="Split showcase"
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          minHeight: sectionMinHeight,
          paddingTop: hero.paddingTop,
          paddingBottom: hero.paddingBottom,
          background: sectionBackground,
          border: sectionBorder,
          borderRadius: cornerRadius > 0 ? cornerRadius : undefined,
          fontFamily: fontBody,
          boxSizing: 'border-box',
        }}
      >
        <div
          className="split-showcase-grid"
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 0,
            width: '100%',
            minHeight:
              typeof sectionMinHeight === 'number'
                ? sectionMinHeight - hero.paddingTop - hero.paddingBottom
                : sectionMinHeight,
          }}
        >
          <SplitShowcaseTile
            imageUrl={hero.media1Url}
            peekVariant="figure"
            title={leftTitle}
            textBase={leftTextBase}
            groupBase={`${settingsPath}.group1Group`}
            titleFieldPath={`${leftTextBase}.text`}
            titleBlockNodeId={`${sectionNodePrefix}:group:group1:text`}
            titleBlockLabel="Text"
            buttonBlockId="primary_button"
            blocksBase={blocksPath}
            sectionNodePrefix={sectionNodePrefix}
            showOverlay={hero.mediaOverlay}
            fontHeading={fontHeading}
            fontBody={fontBody}
          />
          <SplitShowcaseTile
            imageUrl={hero.media2Url}
            peekVariant="landscape"
            title={rightTitle}
            textBase={rightTextBase}
            groupBase={`${settingsPath}.group2Group`}
            titleFieldPath={`${rightTextBase}.text`}
            titleBlockNodeId={`${sectionNodePrefix}:group:group2:text`}
            titleBlockLabel="Text"
            buttonBlockId="secondary_button"
            blocksBase={blocksPath}
            sectionNodePrefix={sectionNodePrefix}
            showOverlay={hero.mediaOverlay}
            fontHeading={fontHeading}
            fontBody={fontBody}
          />
        </div>
      </EditorSection>
    </>
  );
}
