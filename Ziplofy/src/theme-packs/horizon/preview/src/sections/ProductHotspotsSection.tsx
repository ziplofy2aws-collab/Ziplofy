import { useMemo, useState, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import {
  readProductHotspots,
  readProductHotspotsLayout,
  sceneMinHeight,
  scopedProductHotspotsCss,
} from '../lib/productHotspotsStyles';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

function HotspotSceneArt() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(244,162,97,0.9), rgba(231,111,81,0.8), rgba(38,70,83,0.95))',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '45%',
          background: 'linear-gradient(to top, #1a3a4a, transparent)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '18%',
          height: 64,
          background: 'rgba(45,90,74,0.6)',
          clipPath:
            'polygon(0% 100%, 8% 40%, 22% 70%, 38% 30%, 55% 55%, 72% 25%, 88% 50%, 100% 35%, 100% 100%)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '18%',
          top: '52%',
          width: 56,
          height: 40,
          borderRadius: '999px 999px 0 0',
          background: 'rgba(61,41,20,0.7)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '22%',
          top: '48%',
          width: 40,
          height: 48,
          borderRadius: '999px 999px 0 0',
          background: 'rgba(92,61,30,0.8)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: '20%',
          top: '50%',
          width: 44,
          height: 44,
          borderRadius: '999px 999px 0 0',
          background: 'rgba(74,50,32,0.75)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '8%',
          width: 56,
          height: 56,
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        }}
      />
    </>
  );
}

export function ProductHotspotsSection({
  sectionId = 'product_hotspots',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const [activeId, setActiveId] = useState<string | null>(null);

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const layoutStyle = useMemo(
    () => readProductHotspotsLayout(config, settingsBase),
    [config, settingsBase]
  );

  const hotspots = useMemo(
    () => readProductHotspots(config, templateId, sectionId, placement),
    [config, templateId, sectionId, placement]
  );

  const scopeClass = `ziplofy-product-hotspots-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const customCss = scopedProductHotspotsCss(sectionId, layoutStyle.customCss);
  const minH = sceneMinHeight(layoutStyle.sectionHeight);

  const outerPad: CSSProperties = {
    paddingTop: layoutStyle.paddingTop,
    paddingBottom: layoutStyle.paddingBottom,
    background: layoutStyle.scheme.background,
    color: layoutStyle.scheme.color,
    fontFamily: fontBody,
  };

  const innerMax =
    layoutStyle.sectionWidth === 'full'
      ? { maxWidth: '100%', paddingLeft: 0, paddingRight: 0 }
      : { maxWidth: layout.contentMaxWidth, margin: '0 auto', paddingLeft: 24, paddingRight: 24 };

  const sceneStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: minH ? undefined : '4 / 3',
    minHeight: minH,
    borderRadius: 12,
    overflow: 'hidden',
    background: '#1e3a5f',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  };

  const headingPath = `${settingsBase}.heading`;

  return (
    <EditorSection sectionId={sectionId} label="Product hotspots" editorNodeId={editorNodeId} style={outerPad}>
      {customCss ? <style>{customCss}</style> : null}
      <div className={scopeClass} style={innerMax}>
        <EditorField fieldPath={headingPath} label="Heading" as="h2" style={{ margin: '0 0 20px', fontSize: 28, fontWeight: 700, fontFamily: fontHeading }}>
          {layoutStyle.heading}
        </EditorField>

        <div style={sceneStyle}>
          {layoutStyle.imageUrl ? (
            <img
              src={layoutStyle.imageUrl}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <HotspotSceneArt />
          )}
          {layoutStyle.mediaOverlay ? (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.35))',
              }}
            />
          ) : null}

          {hotspots.map((hotspot) => {
            const blockNodeId =
              placement === 'template'
                ? `template:${templateId}:${sectionId}:block:${hotspot.id}`
                : `layout:${sectionId}:block:${hotspot.id}`;
            const isActive = activeId === hotspot.id;

            const dotStyle: CSSProperties = {
              position: 'relative',
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid ${layoutStyle.innerColor}`,
              background: layoutStyle.hotspotColor,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 0 12px rgba(255,255,255,0.35)',
              cursor: 'pointer',
              padding: 0,
            };

            const popoverStyle: CSSProperties = {
              position: 'absolute',
              left: '50%',
              top: '100%',
              transform: 'translateX(-50%)',
              marginTop: layoutStyle.popoverGap,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.96)',
              color: '#111827',
              boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
              whiteSpace: 'nowrap',
              fontSize: 13,
              pointerEvents: 'none',
            };

            return (
              <EditorBlock
                key={hotspot.id}
                nodeId={blockNodeId}
                label="Hotspot"
                style={{
                  position: 'absolute',
                  left: `${hotspot.positionX}%`,
                  top: `${hotspot.positionY}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isActive ? 12 : 10,
                }}
              >
                <button
                  type="button"
                  aria-label={hotspot.productTitle}
                  style={dotStyle}
                  onMouseEnter={() => setActiveId(hotspot.id)}
                  onMouseLeave={() => setActiveId((id) => (id === hotspot.id ? null : id))}
                  onFocus={() => setActiveId(hotspot.id)}
                  onBlur={() => setActiveId((id) => (id === hotspot.id ? null : id))}
                >
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 8,
                      height: 8,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      background: layoutStyle.innerColor,
                    }}
                  />
                  {isActive ? (
                    <span style={popoverStyle}>
                      <span style={{ fontWeight: 600 }}>{hotspot.productTitle}</span>
                      <span style={{ color: '#6b7280', fontSize: 12 }}>{hotspot.price}</span>
                    </span>
                  ) : null}
                </button>
              </EditorBlock>
            );
          })}
        </div>
      </div>
    </EditorSection>
  );
}
