import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { EditorField, EditorSection } from '../lib/editorAttrs';
import { readTextMarqueeLayout, scopedTextMarqueeCss } from '../lib/textMarqueeStyles';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

export function TextMarqueeSection({
  sectionId = 'text_marquee_section',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const style = useMemo(() => readTextMarqueeLayout(config, settingsBase), [config, settingsBase]);

  const text = cfgString(config, `${settingsBase}.text`);
  const scopeClass = `ziplofy-text-marquee-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const animName =
    style.motionDirection === 'reverse' ? 'ziplofy-marquee-reverse' : 'ziplofy-marquee-forward';

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
    animation: `${animName} 28s linear infinite`,
    gap: style.layoutGap,
    fontFamily: fontBody,
    fontSize: '1.125rem',
    fontWeight: 500,
    letterSpacing: '-0.01em',
    whiteSpace: 'nowrap',
  };

  const phraseStyle: CSSProperties = {
    flexShrink: 0,
    paddingRight: style.layoutGap,
  };

  const phrase = (
    <span style={phraseStyle}>
      <EditorField nodeId={editorNodeId} fieldPath={`${settingsBase}.text`} label="Text">
        {text}
      </EditorField>
    </span>
  );

  return (
    <EditorSection nodeId={editorNodeId} label="Marquee">
      <section className={scopeClass} style={shell} data-section-type="text-marquee">
        <style>
          {`
            @keyframes ziplofy-marquee-forward {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            @keyframes ziplofy-marquee-reverse {
              from { transform: translateX(-50%); }
              to { transform: translateX(0); }
            }
            ${scopedTextMarqueeCss(sectionId, style.customCss)}
          `}
        </style>
        <div className={`${scopeClass}__viewport`} style={{ overflow: 'hidden', width: '100%' }}>
          <div className={`${scopeClass}__track`} style={track}>
            {phrase}
            <span style={phraseStyle} aria-hidden>
              {text}
            </span>
          </div>
        </div>
      </section>
    </EditorSection>
  );
}
