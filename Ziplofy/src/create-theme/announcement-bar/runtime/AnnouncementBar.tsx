import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  useThemeConfig,
  useThemeEditorPreview,
  usePreviewHighlightNodeId,
  layoutBlockIdFromHighlightNodeId,
} from '@render-store/sdk';
import {
  announcementColorScheme,
  announcementDividerPx,
  announcementPadding,
  announcementRotateSec,
  announcementSectionWidth,
  scopedAnnouncementCss,
} from './announcementBarStyles';
import {
  readAnnouncementBlockTypography,
  typographyToStyle,
} from './announcementBlockTypography';
import { cfgBool, cfgString } from '../../runtime/shared/config';
import {
  combineResponsiveCss,
  scopedAnnouncementMobileCss,
  sectionScopeClass,
} from '../../runtime/shared/responsive';
import { layoutBlockOrder } from '../../runtime/shared/structureOrder';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { useThemeColors } from '../../runtime/shared/tokens';

type Props = { sectionId?: string };

type AnnouncementSlide = {
  blockId: string;
  text: string;
  link: string;
  typography: ReturnType<typeof readAnnouncementBlockTypography>;
};

function collectSlides(
  config: Record<string, unknown> | null,
  base: string,
  blockOrder: string[],
  themeFonts: { fontHeading: string; fontBody: string }
): AnnouncementSlide[] {
  const out: AnnouncementSlide[] = [];
  for (const blockId of blockOrder) {
    const settingsBase = `${base}.blocks.${blockId}.settings`;
    const text = cfgString(config, `${settingsBase}.text`, '').trim();
    if (!text) continue;
    out.push({
      blockId,
      text,
      link: cfgString(config, `${settingsBase}.link`, '').trim(),
      typography: readAnnouncementBlockTypography(config, settingsBase, themeFonts),
    });
  }
  if (!out.length) {
    const legacy = cfgString(config, `${base}.settings.message`, '').trim();
    if (legacy) {
      out.push({
        blockId: 'announcement',
        text: legacy,
        link: cfgString(config, `${base}.settings.linkHref`, '').trim(),
        typography: readAnnouncementBlockTypography(
          config,
          `${base}.blocks.announcement.settings`,
          themeFonts
        ),
      });
    }
  }
  return out;
}

export function AnnouncementBar({ sectionId = 'announcement_bar' }: Props) {
  const config = useThemeConfig();
  const themeColors = useThemeColors();
  const isEditorPreview = useThemeEditorPreview();
  const highlightNodeId = usePreviewHighlightNodeId();
  const focusedBlockId = layoutBlockIdFromHighlightNodeId(highlightNodeId, sectionId);

  const fallbackScheme = {
    background: themeColors.primary,
    color: themeColors.background,
    linkColor: themeColors.background,
  };
  const base = `sections.${sectionId}`;
  const settingsBase = `${base}.settings`;
  const enabled = cfgBool(config, `${settingsBase}.enabled`, true);
  const blockOrder = layoutBlockOrder(config, sectionId, ['announcement']);
  const slides = useMemo(
    () =>
      collectSlides(config, base, blockOrder, {
        fontHeading: themeColors.fontHeading,
        fontBody: themeColors.fontBody,
      }),
    [config, base, blockOrder, themeColors.fontHeading, themeColors.fontBody]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const rotateSec = announcementRotateSec(config, settingsBase);

  useEffect(() => {
    setActiveIndex(0);
  }, [sectionId, slides.map((s) => `${s.blockId}\u0000${s.text}`).join('\u0001')]);

  useEffect(() => {
    if (!focusedBlockId || !slides.length) return;
    const idx = slides.findIndex((s) => s.blockId === focusedBlockId);
    if (idx >= 0) setActiveIndex(idx);
  }, [focusedBlockId, slides]);

  useEffect(() => {
    if (isEditorPreview || slides.length <= 1 || rotateSec <= 0) return;
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, rotateSec * 1000);
    return () => window.clearInterval(timer);
  }, [isEditorPreview, slides.length, rotateSec]);

  const displayIndex = useMemo(() => {
    if (focusedBlockId) {
      const idx = slides.findIndex((s) => s.blockId === focusedBlockId);
      if (idx >= 0) return idx;
    }
    return activeIndex;
  }, [focusedBlockId, slides, activeIndex]);

  const slide = slides[displayIndex] ?? slides[0];
  if (!enabled || !slides.length || !slide?.text) return null;

  const scheme = announcementColorScheme(config, settingsBase, fallbackScheme);
  const sectionWidth = announcementSectionWidth(config, settingsBase);
  const { paddingTop, paddingBottom } = announcementPadding(config, settingsBase);
  const dividerPx = announcementDividerPx(config, settingsBase);
  const customCss = cfgString(config, `${settingsBase}.customCss`, '');
  const scopedCss = scopedAnnouncementCss(sectionId, customCss);
  const shellClass = sectionScopeClass('ziplofy-announcement', sectionId);
  const responsiveCss = scopedAnnouncementMobileCss(shellClass);

  const renderSlide = (s: AnnouncementSlide, visible: boolean): ReactNode => {
    const textStyle = typographyToStyle(s.typography);
    const textPath = `${base}.blocks.${s.blockId}.settings.text`;
    const linkPath = `${base}.blocks.${s.blockId}.settings.link`;

    const messageEl = (
      <EditorField fieldPath={textPath} label="Text">
        <span className="ziplofy-announcement-message" style={textStyle}>
          {s.text}
        </span>
      </EditorField>
    );

    const content =
      s.link && s.link.startsWith('/') ? (
        <Link to={s.link} style={{ color: scheme.color, textDecoration: 'none' }}>
          {messageEl}
          <span
            data-ziplofy-node={`field:${linkPath}`}
            data-ziplofy-label="Link"
            data-ziplofy-kind="field"
            hidden
          >
            {s.link}
          </span>
        </Link>
      ) : s.link ? (
        <a href={s.link} style={{ color: scheme.color, textDecoration: 'none' }}>
          {messageEl}
        </a>
      ) : (
        messageEl
      );

    return (
      <div
        key={s.blockId}
        style={{
          display: visible ? 'block' : 'none',
        }}
        aria-hidden={!visible}
      >
        {blockOrder.includes(s.blockId) ? (
          <EditorBlock nodeId={`layout:${sectionId}:block:${s.blockId}`} label="Announcement">
            {content}
          </EditorBlock>
        ) : (
          <EditorField fieldPath={`${settingsBase}.message`} label="Announcement text">
            <span style={textStyle}>{s.text}</span>
          </EditorField>
        )}
      </div>
    );
  };

  const showAllInEditor = isEditorPreview && slides.length > 1 && !focusedBlockId;
  const editorSlide =
    isEditorPreview && focusedBlockId
      ? slides.find((s) => s.blockId === focusedBlockId) ?? slide
      : slide;

  return (
    <EditorSection
      sectionId={sectionId}
      label="Announcement bar"
      className={shellClass}
      style={{
        background: scheme.background,
        color: scheme.color,
        fontFamily: themeColors.fontBody,
        fontSize: 13,
        textAlign: 'center',
        paddingTop,
        paddingBottom,
        borderBottom: dividerPx > 0 ? `${dividerPx}px solid rgba(0,0,0,0.15)` : undefined,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {scopedCss ? <style>{scopedCss}</style> : null}
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      <div
        style={
          sectionWidth === 'page'
            ? { maxWidth: 1200, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }
            : { width: '100%', paddingLeft: 16, paddingRight: 16, boxSizing: 'border-box' }
        }
      >
        {showAllInEditor
          ? slides.map((s, i) => renderSlide(s, i === displayIndex))
          : renderSlide(editorSlide, true)}
      </div>
    </EditorSection>
  );
}
