import { useMemo, useState, type CSSProperties } from 'react';
import { getThemeConfigValue, useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import { combineResponsiveCss, sectionScopeClass } from '../../runtime/shared/responsive';
import { orderedIds } from '../../runtime/shared/structureOrder';
import type { SectionRuntimeProps } from '../../runtime/types';
import { HotspotScene } from './HotspotScene';

type HotspotData = {
  id: string;
  positionX: number;
  positionY: number;
  productTitle: string;
  price: string;
};

const SCHEMES: Record<string, { background: string; color: string }> = {
  'scheme-1': { background: '#ffffff', color: '#111827' },
  'scheme-2': { background: '#f6f6f7', color: '#111827' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b' },
};

function sceneMinHeight(height: string): string | undefined {
  if (height === 'small') return '320px';
  if (height === 'medium') return '420px';
  if (height === 'large') return '520px';
  return undefined;
}

export function ProductHotspots({
  sectionId,
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const { maxWidth } = useThemeLayout();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sectionBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;
  const settingsBase = `${sectionBase}.settings`;
  const blocksBase = `${sectionBase}.blocks`;
  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const heading = cfgString(config, `${settingsBase}.heading`, 'Shop the look');
  const imageUrl = cfgString(config, `${settingsBase}.imageUrl`, '');
  const mediaOverlay = cfgBool(config, `${settingsBase}.mediaOverlay`, false);
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const sectionHeight = cfgString(config, `${settingsBase}.sectionHeight`, 'auto');
  const hotspotColor = cfgString(config, `${settingsBase}.hotspotColor`, '#FFFFFF57');
  const innerColor = cfgString(config, `${settingsBase}.innerColor`, '#FFFFFF');
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const popoverGap = cfgNumber(config, `${settingsBase}.popoverGap`, 8);
  const paddingTop = cfgNumber(config, `${settingsBase}.paddingTop`, 40);
  const paddingBottom = cfgNumber(config, `${settingsBase}.paddingBottom`, 40);
  const customCss = cfgString(config, `${settingsBase}.customCss`, '');

  const scheme = SCHEMES[schemeKey] ?? SCHEMES['scheme-1'];
  const isFullWidth = sectionWidth === 'full';
  const minH = sceneMinHeight(sectionHeight);

  const blockOrder = orderedIds(config, `${sectionBase}.block_order`, blocksBase, []);

  const hotspots: HotspotData[] = useMemo(() => {
    const blocksMap = getThemeConfigValue(config, blocksBase) as
      | Record<string, { settings?: Record<string, unknown> }>
      | null
      | undefined;
    if (!blocksMap || typeof blocksMap !== 'object') return [];
    const ids = blockOrder.length ? blockOrder : Object.keys(blocksMap);
    return ids
      .filter((id) => blocksMap[id])
      .map((id) => {
        const s = blocksMap[id]?.settings ?? {};
        return {
          id,
          positionX: Number(s.positionX ?? 50),
          positionY: Number(s.positionY ?? 50),
          productTitle: String(s.productTitle ?? 'Product title'),
          price: String(s.price ?? ''),
        };
      });
  }, [config, blocksBase, blockOrder]);

  const scopeClass = sectionScopeClass('product-hotspots', sectionId);
  const scopedCss = customCss.trim()
    ? combineResponsiveCss(`.${scopeClass} { ${customCss} }`)
    : '';

  const outerStyle: CSSProperties = {
    paddingTop,
    paddingBottom,
    background: scheme.background,
    color: scheme.color,
    fontFamily: fontBody,
  };

  const innerStyle: CSSProperties = isFullWidth
    ? { maxWidth: '100%', paddingLeft: 0, paddingRight: 0 }
    : { maxWidth, margin: '0 auto', paddingLeft: 24, paddingRight: 24 };

  const sceneStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio: minH ? undefined : '16 / 7',
    minHeight: minH,
    borderRadius: 12,
    overflow: 'hidden',
    background: '#1e3a5f',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  };

  return (
    <EditorSection
      sectionId={sectionId}
      label="Product hotspots"
      editorNodeId={editorNodeId}
      className={scopeClass}
      style={outerStyle}
    >
      {scopedCss ? <style>{scopedCss}</style> : null}
      <div style={innerStyle}>
        <EditorField
          fieldPath={`${settingsBase}.heading`}
          label="Heading"
          as="h2"
          style={{ margin: '0 0 20px', fontSize: 28, fontWeight: 700, fontFamily: fontHeading }}
        >
          {heading}
        </EditorField>

        <div style={sceneStyle}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <HotspotScene />
          )}
          {mediaOverlay ? (
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
            const blockNodeId = `${editorNodeId}:block:${hotspot.id}`;
            const isActive = activeId === hotspot.id;
            const openUpward = hotspot.positionY > 65;

            const dotStyle: CSSProperties = {
              position: 'relative',
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: `2px solid ${innerColor}`,
              background: hotspotColor,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 0 12px rgba(255,255,255,0.45)',
              cursor: 'pointer',
              padding: 0,
              backdropFilter: 'blur(2px)',
            };

            const popoverStyle: CSSProperties = {
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              [openUpward ? 'bottom' : 'top']: '100%',
              [openUpward ? 'marginBottom' : 'marginTop']: popoverGap,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.98)',
              color: '#111827',
              boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
              whiteSpace: 'nowrap',
              fontSize: 13,
              pointerEvents: 'none',
              zIndex: 5,
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
                      width: 10,
                      height: 10,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      background: innerColor,
                    }}
                  />
                  {isActive ? (
                    <span style={popoverStyle}>
                      <span style={{ fontWeight: 600 }}>{hotspot.productTitle}</span>
                      {hotspot.price ? (
                        <span style={{ color: '#6b7280', fontSize: 12 }}>{hotspot.price}</span>
                      ) : null}
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
