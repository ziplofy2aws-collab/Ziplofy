import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { readCustomSectionStyle, scopedCustomSectionCss } from '../lib/customSectionStyles';
import { EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId: string;
  placement?: 'layout' | 'template';
  templateId?: string;
};

export function CustomSection({ sectionId, placement = 'template', templateId = 'index' }: Props) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const nodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readCustomSectionStyle(config, settingsBase), [config, settingsBase]);

  const scheme = style.colorScheme;
  const innerMaxWidth = style.sectionWidth === 'full' ? '100%' : layout.maxWidth;
  const horizontalPad = style.sectionWidth === 'full' ? 24 : layout.padX;

  const textAlign =
    style.alignment === 'left' ? 'left' : style.alignment === 'right' ? 'right' : 'center';

  const justifyContent =
    style.position === 'top' ? 'flex-start' : style.position === 'bottom' ? 'flex-end' : 'center';

  const sectionShell: CSSProperties = {
    position: 'relative',
    background: scheme.background,
    color: scheme.color,
    fontFamily: fontBody,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: horizontalPad,
    paddingRight: horizontalPad,
    boxSizing: 'border-box',
    border: style.borderStyle === 'solid' ? `1px solid ${scheme.border}` : undefined,
    borderRadius: style.cornerRadius > 0 ? style.cornerRadius : undefined,
    overflow: 'hidden',
    minHeight: style.minHeight,
  };

  const innerFlex: CSSProperties = {
    maxWidth: innerMaxWidth,
    margin: '0 auto',
    width: '100%',
    minHeight: Math.max(style.minHeight - style.paddingTop - style.paddingBottom, 80),
    display: 'flex',
    flexDirection: style.direction === 'horizontal' ? 'row' : 'column',
    alignItems: style.direction === 'horizontal' ? 'center' : undefined,
    justifyContent,
    gap: style.gap,
    textAlign,
  };

  const placeholder: CSSProperties = {
    flex: 1,
    width: '100%',
    minHeight: 80,
    marginLeft: style.alignment === 'right' ? 'auto' : undefined,
    marginRight: style.alignment === 'left' ? 'auto' : undefined,
    maxWidth: style.alignment === 'center' ? '100%' : undefined,
  };

  return (
    <EditorSection sectionId={sectionId} editorNodeId={nodeId} label="Custom section" style={sectionShell}>
      {style.backgroundMedia === 'image' && style.backgroundImageUrl ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${style.backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
      ) : null}
      {style.backgroundOverlay && style.backgroundMedia === 'image' ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 1,
          }}
        />
      ) : null}
      {style.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: scopedCustomSectionCss(sectionId, style.customCss) }} />
      ) : null}
      <div style={{ ...innerFlex, position: 'relative', zIndex: 2 }}>
        <div style={placeholder} aria-hidden />
      </div>
    </EditorSection>
  );
}
