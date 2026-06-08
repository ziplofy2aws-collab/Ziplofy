import { useMemo, useState, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { heroHeadingTypographyCss, readHeroHeadingStyle } from '../lib/heroHeadingStyles';
import {
  accordionQuestionTypography,
  isFaqAccordionBlockEnabled,
  isFaqHeadingBlockEnabled,
  readFaqAccordionStyle,
  readFaqHeading,
  readFaqItems,
  readFaqLayout,
  readFaqTextBlockStyle,
  scopedFaqCss,
} from '../lib/faqStyles';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

function AccordionIcon({ kind, open }: { kind: 'caret' | 'plus'; open: boolean }) {
  if (kind === 'plus') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden style={{ flexShrink: 0 }}>
        <path
          d={open ? 'M4 8h8' : 'M8 4v8M4 8h8'}
          stroke="currentColor"
          strokeWidth="1.5"
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
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FaqSection({
  sectionId = 'faq_section',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { text: themeText, fontHeading, fontBody } = useThemeColors();
  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readFaqLayout(config, settingsBase), [config, settingsBase]);
  const items = useMemo(
    () => readFaqItems(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const sectionBase = settingsBase.replace(/\.settings$/, '');
  const accordionSettingsBase = `${sectionBase}.blocks.accordion.settings`;
  const accordionStyle = useMemo(
    () => readFaqAccordionStyle(config, accordionSettingsBase),
    [config, accordionSettingsBase]
  );
  const questionTypography = useMemo(
    () => accordionQuestionTypography(accordionStyle.headingTypographyPreset, { fontHeading, fontBody }),
    [accordionStyle.headingTypographyPreset, fontHeading, fontBody]
  );
  const heading = useMemo(
    () => readFaqHeading(config, sectionBase, settingsBase),
    [config, sectionBase, settingsBase]
  );
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const defaults = items.filter((item) => item.openByDefault).map((item) => item.id);
    if (defaults.length) return new Set(defaults);
    if (accordionStyle.openFirstItem && items[0]) return new Set([items[0].id]);
    return new Set();
  });

  const scheme = style.scheme;
  const questionColor = accordionStyle.inheritColorScheme ? scheme.color : themeText;
  const answerColor = accordionStyle.inheritColorScheme ? scheme.muted : themeText;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `ziplofy-faq-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
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
    background:
      style.backgroundMedia === 'image' && style.backgroundImageUrl
        ? scheme.background
        : scheme.background,
    color: scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    minHeight: style.minHeightPx > 0 ? style.minHeightPx : undefined,
    border:
      style.borderStyle === 'solid' ? `1px solid ${scheme.border}` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: style.cornerRadius > 0 ? 'hidden' : undefined,
  };

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl
      ? style.backgroundImageUrl
      : null;

  const stage: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: style.direction === 'horizontal' ? 'row' : 'column',
    alignItems:
      style.position === 'top'
        ? 'flex-start'
        : style.position === 'bottom'
          ? 'flex-end'
          : 'center',
    gap: style.layoutGap,
  };

  const headingFillWidth = headingStyleTokens.width === '100%';
  const headingStyle: CSSProperties = {
    margin: 0,
    width: headingStyleTokens.width,
    maxWidth: headingStyleTokens.maxWidth,
    marginLeft: headingStyleTokens.marginLeft,
    marginRight: headingStyleTokens.marginRight,
    alignSelf: headingFillWidth ? 'stretch' : undefined,
    boxSizing: 'border-box',
    ...heroHeadingTypographyCss(headingStyleTokens),
    color: headingStyleTokens.color,
    textAlign: headingStyleTokens.textAlign ?? style.layoutAlignment,
    background: headingStyleTokens.background,
    paddingTop: headingStyleTokens.paddingTop,
    paddingBottom: headingStyleTokens.paddingBottom,
    paddingLeft: headingStyleTokens.paddingLeft,
    paddingRight: headingStyleTokens.paddingRight,
    borderRadius: headingStyleTokens.borderRadius,
    marginBottom: style.direction === 'horizontal' ? 0 : style.layoutGap,
    flex: style.direction === 'horizontal' ? '0 0 38%' : undefined,
  };

  const listStyle: CSSProperties = {
    flex: 1,
    width: '100%',
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
  const showHeading = isFaqHeadingBlockEnabled(config, sectionBase);
  const showAccordion = isFaqAccordionBlockEnabled(config, sectionBase);
  const accordionNodeId =
    placement === 'template'
      ? `template:${templateId}:${sectionId}:block:accordion`
      : `layout:${sectionId}:block:accordion`;

  return (
    <EditorSection sectionId={sectionId} label="FAQ" editorNodeId={editorNodeId} style={shell}>
      {customCss ? <style>{customCss}</style> : null}
      {bgImage ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
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
            background: 'rgba(0,0,0,0.35)',
            zIndex: 1,
          }}
        />
      ) : null}
      <div className={scopeClass} style={{ ...stage, position: 'relative', zIndex: 2 }}>
        {showHeading ? (
          <EditorBlock
            nodeId={
              placement === 'template'
                ? `template:${templateId}:${sectionId}:block:heading`
                : `layout:${sectionId}:block:heading`
            }
            label="Heading"
          >
            <EditorField
              fieldPath={`${settingsBase}.title`}
              label="Heading"
              as="h2"
              style={headingStyle}
            >
              {heading}
            </EditorField>
          </EditorBlock>
        ) : null}

        {showAccordion ? (
        <div
          role="list"
          data-ziplofy-node={accordionNodeId}
          data-ziplofy-label="Accordion"
          data-ziplofy-kind="block"
          style={{
            ...listStyle,
            borderTop: accordionStyle.dividers ? `1px solid ${scheme.border}` : undefined,
            border:
              accordionStyle.borderStyle === 'solid' ? `1px solid ${scheme.border}` : undefined,
            borderRadius: accordionStyle.cornerRadius > 0 ? accordionStyle.cornerRadius : undefined,
            overflow: accordionStyle.cornerRadius > 0 ? 'hidden' : undefined,
            paddingTop: accordionStyle.paddingTop,
            paddingBottom: accordionStyle.paddingBottom,
            paddingLeft: accordionStyle.paddingLeft,
            paddingRight: accordionStyle.paddingRight,
            boxSizing: 'border-box',
          }}
        >
          {items.map((item, index) => {
            const open = openIds.has(item.id);
            const rowBorder =
              accordionStyle.dividers && index < items.length - 1
                ? `1px solid ${scheme.border}`
                : undefined;
            const blockNodeId =
              placement === 'template'
                ? `template:${templateId}:${sectionId}:block:accordion:nested:${item.id}`
                : `layout:${sectionId}:block:accordion:nested:${item.id}`;
            const questionPath = `${sectionBase}.blocks.accordion.blocks.${item.id}.settings.heading`;

            return (
              <div
                key={item.id}
                role="listitem"
                data-ziplofy-node={blockNodeId}
                data-ziplofy-label={item.question}
                data-ziplofy-kind="block"
                style={{ borderBottom: rowBorder }}
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    {item.rowImageIconUrl ? (
                      <img
                        src={item.rowImageIconUrl}
                        alt=""
                        style={{
                          width: item.rowIconWidth,
                          height: item.rowIconWidth,
                          objectFit: 'contain',
                          flexShrink: 0,
                        }}
                      />
                    ) : null}
                    <EditorField
                      fieldPath={questionPath}
                      label="Heading"
                      as="span"
                      style={{
                        ...questionTypography,
                        color: questionColor,
                      }}
                    >
                      {item.question}
                    </EditorField>
                  </span>
                  <AccordionIcon kind={accordionStyle.icon} open={open} />
                </button>
                {open ? (
                  <div
                    style={{
                      paddingBottom: 20,
                      paddingRight: 32,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
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
                        <div key={textBlock.id} style={answerStyle}>
                          <div
                            data-ziplofy-node={textNodeId}
                            data-ziplofy-label="Text"
                            data-ziplofy-kind="block"
                          >
                            <EditorField fieldPath={answerPath} label="Text" as="div">
                              {textBlock.text || 'Add text in the sidebar.'}
                            </EditorField>
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
        ) : null}
      </div>
    </EditorSection>
  );
}
