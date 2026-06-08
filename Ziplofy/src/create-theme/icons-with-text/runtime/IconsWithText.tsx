import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { IconGlyph } from './IconGlyph';
import {
  alignContentForPosition,
  columnTypography,
  iconsWithTextMobileStackCss,
  justifyItemsForAlignment,
  readIconWithTextItems,
  readIconsWithTextLayout,
  scopedIconsWithTextCss,
} from './iconsWithTextStyles';

function editorAttrs(
  editorNodeId: string,
  label: string,
  kind: 'section' | 'block' | 'field' = 'section',
  fieldPath?: string
): Record<string, string> {
  const attrs: Record<string, string> = {
    'data-ziplofy-node': editorNodeId,
    'data-ziplofy-label': label,
    'data-ziplofy-kind': kind,
  };
  if (fieldPath) attrs['data-ziplofy-field'] = fieldPath;
  return attrs;
}

export function IconsWithText({
  sectionId = 'icons_with_text',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();
  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;
  const sectionBase = settingsBase.replace(/\.settings$/, '');
  const blocksBase = sectionBase;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readIconsWithTextLayout(config, settingsBase), [config, settingsBase]);
  const items = useMemo(
    () => readIconWithTextItems(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const scheme = style.scheme;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `ziplofy-icons-with-text-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const colCount = Math.max(items.length, style.columns);
  const isHorizontal = style.direction === 'horizontal';
  const mobileStackClass =
    style.verticalOnMobile && isHorizontal
      ? `ziplofy-icons-with-text-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`
      : '';
  const typo = columnTypography(fontBody);

  const columnAlign =
    style.layoutAlignment === 'center' || style.layoutAlignment === 'right'
      ? style.layoutAlignment
      : 'left';

  const shell: CSSProperties = {
    position: 'relative',
    background: scheme.background,
    color: scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    minHeight: style.minHeightPx > 0 ? style.minHeightPx : undefined,
    border: style.borderStyle === 'solid' ? `1px solid rgba(17, 24, 39, 0.12)` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: style.cornerRadius > 0 ? 'hidden' : undefined,
  };

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl ? style.backgroundImageUrl : null;

  const grid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isHorizontal ? `repeat(${colCount}, minmax(0, 1fr))` : '1fr',
    gap: style.layoutGap,
    width: '100%',
    justifyItems: justifyItemsForAlignment(style.layoutAlignment),
    alignContent: alignContentForPosition(style.position),
    minHeight: style.minHeightPx > 0 ? style.minHeightPx : undefined,
  };

  const columnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems:
      style.layoutAlignment === 'right'
        ? 'flex-end'
        : style.layoutAlignment === 'center'
          ? 'center'
          : 'flex-start',
    textAlign: columnAlign,
    gap: 10,
    color: scheme.color,
  };

  const customCss = scopedIconsWithTextCss(sectionId, style.customCss);
  const mobileCss = mobileStackClass ? iconsWithTextMobileStackCss(sectionId) : '';

  return (
    <section style={shell} {...editorAttrs(editorNodeId, 'Icons with text', 'section')}>
      {customCss ? <style>{customCss}</style> : null}
      {mobileCss ? <style>{mobileCss}</style> : null}
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
      <div
        className={scopeClass}
        style={{
          maxWidth: innerMaxWidth,
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className={mobileStackClass || undefined} style={grid}>
          {items.map((item) => {
            const blockNodeId =
              placement === 'template'
                ? `template:${templateId}:${sectionId}:block:${item.id}`
                : `layout:${sectionId}:block:${item.id}`;
            const iconPath = `${blocksBase}.blocks.${item.id}.settings.icon`;
            const headingPath = `${blocksBase}.blocks.${item.id}.settings.heading`;
            const textPath = `${blocksBase}.blocks.${item.id}.settings.text`;

            return (
              <div
                key={item.id}
                style={columnStyle}
                {...editorAttrs(blockNodeId, item.heading, 'block')}
              >
                <span {...editorAttrs(blockNodeId, 'Icon', 'field', iconPath)}>
                  <IconGlyph icon={item.icon} />
                </span>
                <h3
                  style={typo.heading}
                  {...editorAttrs(blockNodeId, 'Heading', 'field', headingPath)}
                >
                  {item.heading}
                </h3>
                <p
                  style={{ ...typo.text, color: scheme.color }}
                  {...editorAttrs(blockNodeId, 'Description', 'field', textPath)}
                >
                  {item.text || 'Add a description in the sidebar.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
