import { useMemo, useState, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { readFaqItems, readFaqLayout, scopedFaqCss } from '../lib/faqStyles';
import { layout } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

function Chevron({ open }: { open: boolean }) {
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

  const heading = cfgString(config, `${settingsBase}.heading`);
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    if (style.openFirstItem && items[0]) return new Set([items[0].id]);
    return new Set();
  });

  const scheme = style.scheme;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `ziplofy-faq-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const headingAlign = style.layoutAlignment;

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

  const headingStyle: CSSProperties = {
    margin: 0,
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    textAlign: headingAlign,
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
        <EditorField fieldPath={`${settingsBase}.heading`} label="Heading" as="h2" style={headingStyle}>
          {heading}
        </EditorField>

        <div
          role="list"
          style={{
            ...listStyle,
            borderTop: `1px solid ${scheme.border}`,
          }}
        >
          {items.map((item) => {
            const open = openIds.has(item.id);
            const blockNodeId =
              placement === 'template'
                ? `template:${templateId}:${sectionId}:block:${item.id}`
                : `layout:${sectionId}:block:${item.id}`;
            const questionPath = `${settingsBase.replace(/\.settings$/, '')}.blocks.${item.id}.settings.question`;
            const answerPath = `${settingsBase.replace(/\.settings$/, '')}.blocks.${item.id}.settings.answer`;

            return (
              <div
                key={item.id}
                role="listitem"
                data-ziplofy-node={blockNodeId}
                data-ziplofy-label={item.question}
                data-ziplofy-kind="block"
                style={{ borderBottom: `1px solid ${scheme.border}` }}
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
                  <EditorField
                    fieldPath={questionPath}
                    label="Question"
                    as="span"
                    style={{
                      fontSize: '1rem',
                      fontWeight: 400,
                      lineHeight: 1.4,
                      flex: 1,
                    }}
                  >
                    {item.question}
                  </EditorField>
                  <Chevron open={open} />
                </button>
                {open ? (
                  <div
                    style={{
                      paddingBottom: 20,
                      paddingRight: 32,
                      color: scheme.muted,
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                    }}
                  >
                    <EditorField fieldPath={answerPath} label="Answer" as="div">
                      {item.answer || 'Add an answer in the sidebar.'}
                    </EditorField>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </EditorSection>
  );
}
