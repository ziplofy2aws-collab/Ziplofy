import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { readDividerStyle, scopedDividerCss } from './dividerStyles';
import { EditorSection } from '../../runtime/shared/editorAttrs';
import { layout, useThemeColors } from '../../runtime/shared/tokens';

type Props = {
  sectionId: string;
  /** `layout` = sections.{id}; `template` = templates.{page}.sections.{id} */
  placement?: 'layout' | 'template';
  templateId?: string;
};

export function Divider({ sectionId, placement = 'layout', templateId = 'index' }: Props) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const nodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readDividerStyle(config, settingsBase), [config, settingsBase]);

  const innerMaxWidth = style.widthMode === 'full' ? '100%' : layout.maxWidth;
  const horizontalPad = style.widthMode === 'full' ? 24 : layout.padX;
  const lineThickness = Math.max(style.thickness, 1);

  const shell: CSSProperties = {
    background: style.scheme.background,
    color: style.scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
  };

  const lineRow: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: lineThickness,
  };

  return (
    <EditorSection sectionId={sectionId} editorNodeId={nodeId} label="Divider" style={shell}>
      {style.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: scopedDividerCss(sectionId, style.customCss) }} />
      ) : null}
      <div style={lineRow}>
        <hr
          aria-hidden
          style={{
            width: `${style.lengthPercent}%`,
            maxWidth: '100%',
            margin: 0,
            border: 'none',
            borderTop: `${lineThickness}px solid ${style.scheme.border}`,
            flexShrink: 0,
          }}
        />
      </div>
    </EditorSection>
  );
}
