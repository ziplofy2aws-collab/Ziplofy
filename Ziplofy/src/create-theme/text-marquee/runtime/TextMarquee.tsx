import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import type { SectionRuntimeProps } from '../../runtime/types';
import { layout, useThemeColors } from '../../runtime/shared/tokens';
import { scopedTextMarqueeMobileCss } from '../../runtime/shared/responsive';
import {
  readTextMarqueeLayout,
  scopedTextMarqueeCss,
  textMarqueeKeyframes,
} from './textMarqueeStyles';

const DEFAULT_TEXT = 'We make things that work better and last longer.';
const PHRASE_COPIES = 6;

function MarqueePhrases({
  text,
  gap,
  textPath,
  ariaHidden,
}: {
  text: string;
  gap: number;
  textPath: string;
  ariaHidden?: boolean;
}) {
  return (
    <>
      {Array.from({ length: PHRASE_COPIES }, (_, index) => (
        <span
          key={index}
          style={{ flexShrink: 0, paddingRight: gap }}
          aria-hidden={ariaHidden && index > 0 ? true : undefined}
        >
          {index === 0 && !ariaHidden ? (
            <EditorField fieldPath={textPath} label="Text">
              {text}
            </EditorField>
          ) : (
            text
          )}
        </span>
      ))}
    </>
  );
}

export function TextMarquee({
  sectionId = 'text_marquee_section',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readTextMarqueeLayout(config, settingsBase), [config, settingsBase]);
  const text = cfgString(config, `${settingsBase}.text`, DEFAULT_TEXT) || DEFAULT_TEXT;
  const scopeClass = `ziplofy-text-marquee-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const textPath = `${settingsBase}.text`;

  const shell: CSSProperties = {
    position: 'relative',
    background: style.scheme.background,
    color: style.scheme.color,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    paddingLeft: layout.padX,
    paddingRight: layout.padX,
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const track: CSSProperties = {
    display: 'flex',
    width: 'max-content',
    gap: style.layoutGap,
    fontFamily: fontBody,
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
    color: style.scheme.color,
  };

  const viewport: CSSProperties = {
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    minHeight: 32,
  };

  const customCss = scopedTextMarqueeCss(sectionId, style.customCss);
  const keyframes = textMarqueeKeyframes(scopeClass, style.motionDirection);
  const responsiveCss = scopedTextMarqueeMobileCss(scopeClass);

  return (
    <EditorSection sectionId={sectionId} editorNodeId={editorNodeId} label="Marquee">
      <section className={scopeClass} style={shell} data-section-type="text-marquee">
        <style>
          {keyframes}
          {responsiveCss}
          {customCss ? customCss : ''}
        </style>
        <div className={`${scopeClass}__viewport`} style={viewport}>
          <div className={`${scopeClass}__track`} style={track}>
            <MarqueePhrases text={text} gap={style.layoutGap} textPath={textPath} />
            <MarqueePhrases
              text={text}
              gap={style.layoutGap}
              textPath={textPath}
              ariaHidden
            />
          </div>
        </div>
      </section>
    </EditorSection>
  );
}
