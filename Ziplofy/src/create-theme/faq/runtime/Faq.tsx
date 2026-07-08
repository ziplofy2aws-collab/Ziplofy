import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useThemeConfig, usePreviewDevice } from '@render-store/sdk';
import {
  heroHeadingTypographyCss,
  readHeroHeadingStyle,
} from '../../hero/runtime/heroHeadingStyles';
import { useThemeIconStrokeWidth } from '../../runtime/shared/themeIconsRuntime';
import type { SectionRuntimeProps } from '../../runtime/types';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import { richTextHasBlockMarkup } from '../../../utils/theme-editor-rich-text.util';
import {
  combineResponsiveCss,
  scopedFaqAccordionMobileCss,
  scopedMobileFlexStackCss,
  scopedMobileHorizontalPadCss,
} from '../../runtime/shared/responsive';
import {
  accordionQuestionTypography,
  readFaqAccordionStyle,
  readFaqAccordionTextColors,
  readFaqHeading,
  isFaqAccordionBlockEnabled,
  isFaqHeadingBlockEnabled,
  readFaqItems,
  readFaqLayout,
  readFaqSectionBlockOrder,
  readFaqTextBlockStyle,
  resolveFaqBorderCss,
  scopedFaqCss,
  faqLayoutFlexValue,
  faqPositionFlexValue,
  faqOverlayBackground,
} from './faqStyles';
import { FaqAccordionRowIcon } from './FaqAccordionRowIcon';

const LAYOUT = {
  padX: 24,
};

function AccordionIcon({
  kind,
  open,
  strokeWidth,
}: {
  kind: 'caret' | 'plus';
  open: boolean;
  strokeWidth: number;
}) {
  if (kind === 'plus') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        style={{ flexShrink: 0, transition: 'transform 0.2s ease' }}
      >
        <path
          d={open ? 'M4 8h8' : 'M8 4v8M4 8h8'}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      style={{
        flexShrink: 0,
        transform: open ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.2s ease',
      }}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function editorAttrs(
  editorNodeId: string,
  label: string,
  kind: 'section' | 'block' | 'field' = 'section',
  fieldPath?: string
): Record<string, string> {
  const attrs: Record<string, string> = {
    'data-codiic-node': editorNodeId,
    'data-codiic-label': label,
    'data-codiic-kind': kind,
  };
  if (fieldPath) attrs['data-codiic-field'] = fieldPath;
  return attrs;
}

export function Faq({ sectionId = 'faq_section', templateId = 'index', placement = 'template' }: SectionRuntimeProps) {
  const config = useThemeConfig();
  const previewDevice = usePreviewDevice();
  const { maxWidth: themePageMaxWidth } = useThemeLayout();
  const iconStroke = useThemeIconStrokeWidth();
  const { text: themeText, fontHeading, fontBody } = useThemeColors();
  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;
  const sectionBase = settingsBase.replace(/\.settings$/, '');

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readFaqLayout(config, settingsBase), [config, settingsBase]);
  const accordionSettingsBase = `${sectionBase}.blocks.accordion.settings`;
  const accordionStyle = useMemo(
    () => readFaqAccordionStyle(config, accordionSettingsBase),
    [config, accordionSettingsBase]
  );
  const questionTypography = useMemo(
    () => accordionQuestionTypography(config, accordionStyle.headingTypographyPreset, { fontHeading, fontBody }),
    [config, accordionStyle.headingTypographyPreset, fontHeading, fontBody]
  );
  const heading = useMemo(
    () => readFaqHeading(config, sectionBase, settingsBase),
    [config, sectionBase, settingsBase]
  );
  const editorMode = placement === 'template';
  const items = useMemo(
    () => readFaqItems(config, templateId, sectionId, placement, editorMode),
    [config, templateId, sectionId, placement, editorMode]
  );
  const sectionBlockOrder = useMemo(
    () => readFaqSectionBlockOrder(config, sectionBase),
    [config, sectionBase]
  );

  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const defaults = items.filter((item) => item.openByDefault).map((item) => item.id);
    if (defaults.length) return new Set(defaults);
    if (accordionStyle.openFirstItem && items[0]) return new Set([items[0].id]);
    return new Set();
  });

  useEffect(() => {
    if (!accordionStyle.openFirstItem || !items[0]) return;
    setOpenIds((prev) => {
      if (prev.has(items[0]!.id)) return prev;
      const next = new Set(prev);
      next.add(items[0]!.id);
      return next;
    });
  }, [accordionStyle.openFirstItem, items]);

  /** In the editor, reflect per-row "Open row by default" immediately in the accordion state. */
  useEffect(() => {
    if (!editorMode) return;
    setOpenIds((prev) => {
      const next = new Set(prev);
      for (const item of items) {
        if (item.openByDefault) next.add(item.id);
        else next.delete(item.id);
      }
      if (next.size === prev.size && [...next].every((id) => prev.has(id))) return prev;
      return next;
    });
  }, [editorMode, items]);

  const scheme = style.scheme;
  const isHorizontal = style.direction === 'horizontal';
  const stackOnMobile = isHorizontal && style.verticalOnMobile;
  const isMobileLayout = previewDevice === 'mobile' ? stackOnMobile : false;
  const textColors = useMemo(
    () => readFaqAccordionTextColors(config, accordionSettingsBase, scheme, themeText),
    [config, accordionSettingsBase, scheme, themeText]
  );
  const questionColor = textColors.question;
  const answerColor = textColors.answer;
  const dividerColor =
    !accordionStyle.dividerColor || accordionStyle.dividerColor === 'default'
      ? scheme.border
      : accordionStyle.dividerColor;
  const accordionBackground =
    !accordionStyle.backgroundColor || accordionStyle.backgroundColor === 'default'
      ? undefined
      : accordionStyle.backgroundColor;
  const accordionBorder = resolveFaqBorderCss(
    accordionStyle.borderStyle,
    accordionStyle.borderThickness,
    accordionStyle.borderOpacity,
    accordionStyle.borderColor,
    scheme.border
  );
  const horizontalPad =
    previewDevice === 'mobile'
      ? 16
      : style.sectionWidth === 'full'
        ? 24
        : LAYOUT.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : themePageMaxWidth;
  const scopeClass = `codiic-faq-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const shellClass = `${scopeClass}-shell`;
  const accordionScopeClass = `${scopeClass}-accordion`;
  const headingStyleTokens = useMemo(
    () =>
      readHeroHeadingStyle(config, settingsBase, { fontHeading, fontBody }, {
        text: scheme.color,
        heading: scheme.color,
        link: scheme.color,
      }),
    [config, settingsBase, fontHeading, fontBody, scheme.color]
  );

  const shell: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    background: scheme.background,
    color: scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    minHeight: style.minHeight,
    border: resolveFaqBorderCss(
      style.borderStyle,
      style.borderThickness,
      style.borderOpacity,
      style.borderColor,
      scheme.border
    ),
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: style.cornerRadius > 0 ? 'hidden' : undefined,
  };

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl ? style.backgroundImageUrl : null;
  const bgVideo =
    style.backgroundMedia === 'video' && style.backgroundVideoUrl.trim()
      ? style.backgroundVideoUrl.trim()
      : null;
  const hasBgMedia = Boolean(bgImage || bgVideo);
  const bgImageSize = style.backgroundImagePosition === 'fit' ? 'contain' : 'cover';

  const positionFlex = faqPositionFlexValue(style.position);
  const alignmentFlex = faqLayoutFlexValue(style.layoutAlignment);
  const useRow = isHorizontal && !isMobileLayout;
  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    flex: style.minHeight ? '1 1 auto' : undefined,
    display: 'flex',
    flexDirection: useRow ? 'row' : 'column',
    // Vertical: Alignment = cross axis (alignItems), Position = main axis (justifyContent).
    // Horizontal: Position = cross axis (alignItems), Alignment = main axis (justifyContent).
    alignItems: useRow ? positionFlex : isMobileLayout ? 'stretch' : alignmentFlex,
    justifyContent: useRow ? alignmentFlex : positionFlex,
    gap: style.layoutGap,
  };

  const headingFillWidth = headingStyleTokens.width === '100%';
  const headingContentStyle: CSSProperties = {
    ...heroHeadingTypographyCss(headingStyleTokens),
    color: headingStyleTokens.color,
    textAlign: headingStyleTokens.textAlign,
    background: headingStyleTokens.background,
    paddingTop: headingStyleTokens.paddingTop,
    paddingBottom: headingStyleTokens.paddingBottom,
    paddingLeft: headingStyleTokens.paddingLeft,
    paddingRight: headingStyleTokens.paddingRight,
    borderRadius: headingStyleTokens.borderRadius,
  };
  const headingStyle: CSSProperties = {
    margin: 0,
    width: isMobileLayout ? '100%' : isHorizontal ? '100%' : headingStyleTokens.width,
    maxWidth: isMobileLayout ? '100%' : headingStyleTokens.maxWidth,
    marginLeft: isMobileLayout ? undefined : headingStyleTokens.marginLeft,
    marginRight: isMobileLayout ? undefined : headingStyleTokens.marginRight,
    alignSelf: isMobileLayout ? 'stretch' : headingFillWidth ? 'stretch' : undefined,
    boxSizing: 'border-box',
    marginBottom: isHorizontal && !isMobileLayout ? 0 : isMobileLayout ? 0 : style.layoutGap,
    flex: isMobileLayout ? undefined : isHorizontal ? '0 0 38%' : undefined,
  };

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const customCss = scopedFaqCss(sectionId, style.customCss);
  const responsiveCss = combineResponsiveCss(
    previewDevice === 'mobile' ? '' : scopedMobileHorizontalPadCss(shellClass),
    stackOnMobile ? scopedMobileFlexStackCss(scopeClass) : '',
    scopedFaqAccordionMobileCss(accordionScopeClass),
  );
  const headingPath = `${settingsBase}.title`;
  const headingNodeId =
    placement === 'template'
      ? `template:${templateId}:${sectionId}:block:heading`
      : `layout:${sectionId}:block:heading`;
  const accordionNodeId =
    placement === 'template'
      ? `template:${templateId}:${sectionId}:block:accordion`
      : `layout:${sectionId}:block:accordion`;
  const showHeading = isFaqHeadingBlockEnabled(config, sectionBase);
  const showAccordion = isFaqAccordionBlockEnabled(config, sectionBase);

  const HeadingTag = richTextHasBlockMarkup(heading) ? 'div' : 'h2';
  const headingBlock = showHeading ? (
    <HeadingTag
      style={headingStyle}
      {...editorAttrs(headingNodeId, 'Heading', 'block', headingPath)}
    >
      <ThemeEditorRichTextContent html={heading} style={headingContentStyle} />
    </HeadingTag>
  ) : null;

  const accordionBlock = showAccordion ? (
    <div
      className={accordionScopeClass}
      role="list"
      style={{
        flex: 1,
        width: '100%',
        background: accordionBackground,
        borderTop: accordionStyle.dividers ? `1px solid ${dividerColor}` : undefined,
        border: accordionBorder,
        borderRadius: accordionStyle.cornerRadius > 0 ? accordionStyle.cornerRadius : undefined,
        overflow: accordionStyle.cornerRadius > 0 ? 'hidden' : undefined,
        paddingTop: accordionStyle.paddingTop,
        paddingBottom: accordionStyle.paddingBottom,
        paddingLeft: accordionStyle.paddingLeft,
        paddingRight: accordionStyle.paddingRight,
        boxSizing: 'border-box',
      }}
      {...editorAttrs(accordionNodeId, 'Accordion', 'block')}
    >
      {items.map((item, index) => {
        const open = openIds.has(item.id);
        const showAnswerContent = open || editorMode;
        const blockNodeId =
          placement === 'template'
            ? `template:${templateId}:${sectionId}:block:accordion:nested:${item.id}`
            : `layout:${sectionId}:block:accordion:nested:${item.id}`;
        const questionPath = `${sectionBase}.blocks.accordion.blocks.${item.id}.settings.heading`;
        const rowBorder =
          accordionStyle.dividers && index < items.length - 1
            ? `1px solid ${dividerColor}`
            : undefined;

        return (
          <div
            key={item.id}
            role="listitem"
            style={{ borderBottom: rowBorder }}
            {...editorAttrs(blockNodeId, item.question, 'block')}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={open}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                width: '100%',
                padding: '20px 0',
                border: 'none',
                background: 'transparent',
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                font: 'inherit',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flex: 1,
                }}
              >
                {item.rowImageIconUrl ? (
                  <img
                    src={item.rowImageIconUrl}
                    alt=""
                    style={{
                      width: item.rowIconWidth,
                      height: 'auto',
                      maxHeight: item.rowIconWidth,
                      objectFit: 'contain',
                      flexShrink: 0,
                      display: 'block',
                    }}
                  />
                ) : item.rowIcon && item.rowIcon !== 'none' ? (
                  <FaqAccordionRowIcon icon={item.rowIcon} size={item.rowIconWidth} />
                ) : null}
                <span
                  style={{
                    ...questionTypography,
                    color: questionColor,
                  }}
                  {...editorAttrs(blockNodeId, 'Heading', 'field', questionPath)}
                >
                  <ThemeEditorRichTextContent
                    html={item.question}
                    style={{ ...questionTypography, color: questionColor }}
                  />
                </span>
              </span>
              <AccordionIcon kind={accordionStyle.icon} open={open} strokeWidth={iconStroke} />
            </button>
            {showAnswerContent ? (
              <div
                style={{
                  paddingBottom: 20,
                  paddingRight: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  ...(!open && editorMode
                    ? { opacity: 0.72, borderLeft: `2px dashed ${scheme.border}` }
                    : undefined),
                }}
              >
                {item.textBlocks.map((textBlock) => {
                  const answerSettingsBase = `${sectionBase}.blocks.accordion.blocks.${item.id}.blocks.${textBlock.id}.settings`;
                  const answerPath = `${answerSettingsBase}.text`;
                  const textNodeId = `${blockNodeId}:nested:${textBlock.id}`;
                  const answerStyle = readFaqTextBlockStyle(
                    config,
                    answerSettingsBase,
                    { fontHeading, fontBody },
                    answerColor
                  );
                  return (
                    <div
                      key={textBlock.id}
                      style={answerStyle}
                      {...editorAttrs(textNodeId, 'Text', 'block')}
                    >
                          <div {...editorAttrs(textNodeId, 'Text', 'field', answerPath)}>
                            <ThemeEditorRichTextContent
                              html={textBlock.text || 'Add text in the sidebar.'}
                            />
                          </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  ) : null;

  const sectionBlocksById = {
    heading: headingBlock,
    accordion: accordionBlock,
  } as const;

  return (
    <section className={shellClass} style={shell} {...editorAttrs(editorNodeId, 'FAQ', 'section')}>
      {customCss ? <style>{customCss}</style> : null}
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      {bgImage ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: bgImageSize,
            backgroundPosition: 'center',
            backgroundRepeat: style.backgroundImagePosition === 'fit' ? 'no-repeat' : undefined,
            zIndex: 0,
          }}
        />
      ) : null}
      {bgVideo ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            zIndex: 0,
          }}
        />
      ) : null}
      {style.backgroundOverlay && hasBgMedia ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: faqOverlayBackground(style),
            zIndex: 1,
          }}
        />
      ) : null}
      <div className={scopeClass} style={{ ...stage, position: 'relative', zIndex: 2 }}>
        {sectionBlockOrder.map((blockId) => sectionBlocksById[blockId] ?? null)}
      </div>
    </section>
  );
}
