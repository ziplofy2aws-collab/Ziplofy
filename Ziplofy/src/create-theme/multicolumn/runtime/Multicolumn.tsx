import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout } from '../../runtime/shared/tokens';
import {
  combineResponsiveCss,
  scopedMobileHorizontalPadCss,
} from '../../runtime/shared/responsive';
import {
  alignContentForPosition,
  justifyItemsForAlignment,
  multicolumnMobileStackCss,
  readMulticolumnItems,
  readMulticolumnLayout,
  scopedMulticolumnCss,
} from './multicolumnStyles';

export function Multicolumn({
  sectionId = 'multicolumn_section',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readMulticolumnLayout(config, settingsBase), [config, settingsBase]);
  const items = useMemo(
    () => readMulticolumnItems(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const scheme = style.scheme;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const scopeClass = `ziplofy-multicolumn-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const colCount = Math.max(items.length, style.columns);
  const isHorizontal = style.direction === 'horizontal';
  const shellClass = `${scopeClass}-shell`;
  const mobileStackClass = isHorizontal
    ? `ziplofy-multicolumn-stack-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`
    : '';

  const shell: CSSProperties = {
    position: 'relative',
    background: scheme.background,
    color: scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    border: style.borderStyle === 'solid' ? `1px solid ${scheme.muted}33` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: style.cornerRadius > 0 ? 'hidden' : undefined,
  };

  const bgImage =
    style.backgroundMedia === 'image' && style.backgroundImageUrl
      ? style.backgroundImageUrl
      : null;

  const grid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isHorizontal ? `repeat(${colCount}, minmax(0, 1fr))` : '1fr',
    gap: style.layoutGap,
    width: '100%',
    justifyItems: justifyItemsForAlignment(style.layoutAlignment),
    alignContent: alignContentForPosition(style.position),
  };

  const columnStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 16,
  };

  const headingStyle: CSSProperties = {
    margin: 0,
    fontSize: '1.0625rem',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  };

  const textStyle: CSSProperties = {
    margin: 0,
    fontSize: '0.9375rem',
    lineHeight: 1.55,
    color: scheme.muted,
    maxWidth: 320,
  };

  const customCss = scopedMulticolumnCss(sectionId, style.customCss);
  const responsiveCss = combineResponsiveCss(
    scopedMobileHorizontalPadCss(shellClass),
    mobileStackClass ? multicolumnMobileStackCss(sectionId) : ''
  );
  const blocksBase = settingsBase.replace(/\.settings$/, '');

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={editorNodeId}
      label="Multicolumn"
      className={shellClass}
      style={shell}
    >
      {customCss ? <style>{customCss}</style> : null}
      {responsiveCss ? <style>{responsiveCss}</style> : null}
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

            return (
              <div
                key={item.id}
                data-ziplofy-node={blockNodeId}
                data-ziplofy-label={item.heading}
                data-ziplofy-kind="block"
                style={columnStyle}
              >
                <EditorField
                  fieldPath={`${blocksBase}.blocks.${item.id}.settings.heading`}
                  label="Heading"
                  as="h3"
                  style={headingStyle}
                >
                  {item.heading}
                </EditorField>
                <EditorField
                  fieldPath={`${blocksBase}.blocks.${item.id}.settings.text`}
                  label="Description"
                  as="p"
                  style={textStyle}
                >
                  {item.text || 'Add a description in the sidebar.'}
                </EditorField>
              </div>
            );
          })}
        </div>
      </div>
    </EditorSection>
  );
}
