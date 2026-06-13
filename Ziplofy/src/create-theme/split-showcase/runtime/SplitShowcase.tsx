import { useMemo, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { useThemeColors } from '../../runtime/shared/tokens';
import {
  SPLIT_SHOWCASE_IMAGE_LEFT,
  SPLIT_SHOWCASE_IMAGE_RIGHT,
} from '../../../utils/hero-banner-variants.util';
import { readHeroHeadingText } from '../../hero/runtime/heroHeadingStyles';
import { readHeroStyle, scopedHeroCss } from '../../hero/runtime/heroStyles';
import { splitShowcaseResponsiveCss } from './splitShowcaseStyles';

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

function SplitShowcaseTile({
  imageUrl,
  fallbackUrl,
  title,
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
  fallbackUrl: string;
  title: string;
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
  const href = cfgString(config, `${buttonBase}.href`, '/products');

  const tileStyle: CSSProperties = {
    position: 'relative',
    flex: '1 1 50%',
    minWidth: 0,
    minHeight: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const bgUrl = imageUrl.trim() || fallbackUrl;

  const headingStyle: CSSProperties = {
    margin: 0,
    fontFamily: fontHeading,
    fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    color: '#ffffff',
    textAlign: 'center',
    textShadow: '0 2px 16px rgba(0, 0, 0, 0.35)',
  };

  const linkStyle: CSSProperties = {
    fontFamily: fontBody,
    fontSize: 15,
    fontWeight: 500,
    color: '#ffffff',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    textDecorationColor: 'rgba(255, 255, 255, 0.9)',
  };

  return (
    <div className="split-showcase-tile" style={tileStyle}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: showOverlay ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.25)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
          padding: '32px 24px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {title.trim() ? (
            <EditorBlock nodeId={titleBlockNodeId} label={titleBlockLabel}>
              <EditorField fieldPath={titleFieldPath} label="Text" as="h2" style={headingStyle}>
                {title}
              </EditorField>
            </EditorBlock>
          ) : null}
        </div>
        {label.trim() ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
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

  const leftTitle = readHeroHeadingText(config, settingsPath, blocksPath, 'heading');
  const rightTitle =
    cfgString(config, `${blocksPath}.text_right.settings.text`, '') ||
    cfgString(config, `${settingsPath}.splitRightTitle`, 'Bestsellers');

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
          background: hero.scheme.background,
          fontFamily: fontBody,
          boxSizing: 'border-box',
        }}
      >
        <div
          className="split-showcase-grid"
          style={{
            display: 'flex',
            flexDirection: hero.contentDirection === 'row' ? 'row' : 'column',
            gap: hero.gap,
            width: '100%',
            minHeight:
              typeof sectionMinHeight === 'number'
                ? sectionMinHeight - hero.paddingTop - hero.paddingBottom
                : sectionMinHeight,
          }}
        >
          <SplitShowcaseTile
            imageUrl={hero.media1Url}
            fallbackUrl={SPLIT_SHOWCASE_IMAGE_LEFT}
            title={leftTitle}
            titleFieldPath={`${settingsPath}.title`}
            titleBlockNodeId={blockNodeId(sectionId, placement, templateId, 'heading')}
            titleBlockLabel="Heading"
            buttonBlockId="primary_button"
            blocksBase={blocksPath}
            sectionNodePrefix={sectionNodePrefix}
            showOverlay={hero.mediaOverlay}
            fontHeading={fontHeading}
            fontBody={fontBody}
          />
          <SplitShowcaseTile
            imageUrl={hero.media2Url}
            fallbackUrl={SPLIT_SHOWCASE_IMAGE_RIGHT}
            title={rightTitle}
            titleFieldPath={`${blocksPath}.text_right.settings.text`}
            titleBlockNodeId={blockNodeId(sectionId, placement, templateId, 'text_right')}
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
