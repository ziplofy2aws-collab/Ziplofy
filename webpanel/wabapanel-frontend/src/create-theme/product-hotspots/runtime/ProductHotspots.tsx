import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  getThemeConfigValue,
  useStorefront,
  useStorefrontProducts,
  useThemeConfig,
} from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { resolveThemePaletteColorSetting } from '../../settings/theme-color-palette.settings';
import {
  letterSpacingCss,
  lineHeightMultiplier,
  resolveThemeFontFamily,
  resolveThemeFontWeightAndStyle,
  resolveThemeTypographyStyle,
  themeFontsFromConfig,
} from '../../runtime/shared/themeTypographyRuntime';
import { useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import { combineResponsiveCss, sectionScopeClass } from '../../runtime/shared/responsive';
import { orderedIds } from '../../runtime/shared/structureOrder';
import type { SectionRuntimeProps } from '../../runtime/types';
import { richTextHasBlockMarkup } from '../../../utils/theme-editor-rich-text.util';
import { HotspotScene } from './HotspotScene';

function headingMaxWidthPx(mode: string): number | undefined {
  if (mode === 'narrow') return 360;
  if (mode === 'none') return undefined;
  return 520;
}

function textTransformFor(c: string): CSSProperties['textTransform'] {
  if (c === 'uppercase') return 'uppercase';
  if (c === 'lowercase') return 'lowercase';
  if (c === 'capitalize') return 'capitalize';
  return 'none';
}

const PLACEHOLDER_IMAGE_BG =
  'linear-gradient(160deg, #f0c48a 0%, #d97b4a 35%, #6b9e8a 70%, #2a4a5c 100%)';

type HotspotData = {
  id: string;
  positionX: number;
  positionY: number;
  productId: string;
  productTitle: string;
  price: string;
  productImageUrl: string;
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
  const { storeFrontMeta } = useStorefront();
  const { products, fetchProductsByStoreId } = useStorefrontProducts();
  const { fontBody, fontHeading } = useThemeColors();
  const { maxWidth } = useThemeLayout();
  const [activeId, setActiveId] = useState<string | null>(null);
  const popoverOpenUpwardRef = useRef<Record<string, boolean>>({});

  const sectionBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;
  const settingsBase = `${sectionBase}.settings`;
  const blocksBase = `${sectionBase}.blocks`;
  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const storeId = storeFrontMeta?.storeId ?? '';

  useEffect(() => {
    if (!storeId) return;
    void fetchProductsByStoreId({ storeId, page: 1, limit: 48 });
  }, [storeId, fetchProductsByStoreId]);

  const heading = cfgString(config, `${settingsBase}.heading`, 'Shop the look');
  const headingWidth = cfgString(config, `${settingsBase}.headingWidth`, 'fit');
  const headingMaxWidth = cfgString(config, `${settingsBase}.headingMaxWidth`, 'normal');
  const headingTypographyPreset = cfgString(
    config,
    `${settingsBase}.headingTypographyPreset`,
    'heading-4'
  );
  const headingFont = cfgString(config, `${settingsBase}.headingFont`, 'heading');
  const headingFontSize = cfgString(config, `${settingsBase}.headingFontSize`, 'default');
  const headingLineHeight = cfgString(config, `${settingsBase}.headingLineHeight`, 'normal');
  const headingLetterSpacing = cfgString(config, `${settingsBase}.headingLetterSpacing`, 'normal');
  const headingTextCase = cfgString(config, `${settingsBase}.headingTextCase`, 'default');
  const headingWrap = cfgString(config, `${settingsBase}.headingWrap`, 'pretty');
  const headingColorRaw = cfgString(config, `${settingsBase}.headingColor`, 'default');
  const headingBackgroundEnabled = cfgBool(
    config,
    `${settingsBase}.headingBackgroundEnabled`,
    false
  );
  const headingPaddingTop = cfgNumber(config, `${settingsBase}.headingPaddingTop`, 0);
  const headingPaddingBottom = cfgNumber(config, `${settingsBase}.headingPaddingBottom`, 0);
  const headingPaddingLeft = cfgNumber(config, `${settingsBase}.headingPaddingLeft`, 0);
  const headingPaddingRight = cfgNumber(config, `${settingsBase}.headingPaddingRight`, 0);
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
  const fonts = themeFontsFromConfig(config);

  const headingNormalizedPreset =
    headingTypographyPreset === 'body' ? 'paragraph' : headingTypographyPreset;
  let headingTypo: CSSProperties;
  if (headingNormalizedPreset === 'default') {
    headingTypo = { fontFamily: fontHeading, fontSize: 28, fontWeight: 700, lineHeight: 1.25 };
  } else if (headingNormalizedPreset === 'custom') {
    const weightStyle = resolveThemeFontWeightAndStyle(headingFont);
    const sizePx =
      headingFontSize && headingFontSize !== 'default'
        ? Number.parseInt(headingFontSize, 10)
        : NaN;
    headingTypo = {
      fontFamily: resolveThemeFontFamily(headingFont, fonts),
      fontSize: Number.isFinite(sizePx) ? `${sizePx}px` : 28,
      fontWeight: weightStyle.fontWeight ?? 700,
      fontStyle: weightStyle.fontStyle,
      lineHeight: lineHeightMultiplier(headingLineHeight),
      letterSpacing: letterSpacingCss(headingLetterSpacing),
      textTransform: textTransformFor(headingTextCase),
      textWrap:
        headingWrap === 'balance'
          ? 'balance'
          : headingWrap === 'nowrap'
            ? 'nowrap'
            : 'pretty',
    };
  } else {
    const t = resolveThemeTypographyStyle(config, headingNormalizedPreset, fonts);
    headingTypo = {
      fontFamily: t.fontFamily,
      fontSize: `${t.fontSize}px`,
      fontWeight: t.fontWeight,
      fontStyle: t.fontStyle,
      lineHeight: t.lineHeight,
      letterSpacing: t.letterSpacing,
      textTransform: t.textTransform,
    };
  }

  const headingColor =
    headingColorRaw === '' || headingColorRaw === 'default'
      ? scheme.color
      : resolveThemePaletteColorSetting(config, headingColorRaw, 1, scheme.color);

  const headingStyle: CSSProperties = {
    margin: '0 0 20px',
    ...headingTypo,
    width: headingWidth === 'fill' ? '100%' : 'fit-content',
    maxWidth: headingMaxWidthPx(headingMaxWidth),
    color: headingColor,
    background: headingBackgroundEnabled ? 'rgba(0,0,0,0.04)' : undefined,
    borderRadius: headingBackgroundEnabled ? 8 : undefined,
    paddingTop: headingPaddingTop || undefined,
    paddingBottom: headingPaddingBottom || undefined,
    paddingLeft: headingPaddingLeft || undefined,
    paddingRight: headingPaddingRight || undefined,
    boxSizing: 'border-box',
  };

  const blockOrder = orderedIds(config, `${sectionBase}.block_order`, blocksBase, []);

  const hotspots: HotspotData[] = useMemo(() => {
    const blocksMap = getThemeConfigValue(config, blocksBase) as
      | Record<string, { enabled?: boolean; settings?: Record<string, unknown> }>
      | null
      | undefined;
    if (!blocksMap || typeof blocksMap !== 'object') return [];
    const ids = (blockOrder.length ? blockOrder : Object.keys(blocksMap)).filter((id) => {
      const block = blocksMap[id];
      return Boolean(block) && block?.enabled !== false;
    });
    return ids.map((id) => {
      const s = blocksMap[id]?.settings ?? {};
      const productId = String(s.productId ?? '');
      const cachedImage = String(s.productImageUrl ?? '');
      const liveProduct = productId
        ? products.find((p) => p._id === productId) ?? null
        : null;
      return {
        id,
        positionX: Number(s.positionX ?? 50),
        positionY: Number(s.positionY ?? 50),
        productId,
        productTitle: String(s.productTitle || liveProduct?.title || 'Product title'),
        price: String(
          s.price ||
            (typeof liveProduct?.price === 'number'
              ? `Rs. ${liveProduct.price.toFixed(2)}`
              : '') ||
            'Rs. 19.99'
        ),
        productImageUrl: cachedImage || liveProduct?.imageUrls?.[0] || '',
      };
    });
  }, [config, blocksBase, blockOrder, products]);

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
          as={richTextHasBlockMarkup(heading) ? 'div' : 'h2'}
          style={headingStyle}
        >
          <ThemeEditorRichTextContent html={heading} />
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
            if (isActive && popoverOpenUpwardRef.current[hotspot.id] === undefined) {
              popoverOpenUpwardRef.current[hotspot.id] = hotspot.positionY > 65;
            }
            if (!isActive) {
              delete popoverOpenUpwardRef.current[hotspot.id];
            }
            const openUpward =
              popoverOpenUpwardRef.current[hotspot.id] ?? hotspot.positionY > 65;

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
              alignItems: 'stretch',
              gap: 10,
              minWidth: 220,
              maxWidth: 280,
              padding: 10,
              borderRadius: 16,
              background: '#ffffff',
              color: '#111827',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              pointerEvents: 'none',
              zIndex: 5,
              textAlign: 'left',
            };

            const showSoldOut = !hotspot.productId;

            return (
              <EditorBlock
                key={hotspot.id}
                nodeId={blockNodeId}
                label="Hotspot"
                style={{
                  position: 'absolute',
                  left: `${hotspot.positionX}%`,
                  top: `${hotspot.positionY}%`,
                  transform: 'translate3d(-50%, -50%, 0)',
                  zIndex: isActive ? 12 : 10,
                  transition: 'left 90ms linear, top 90ms linear',
                  willChange: 'left, top',
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
                      {hotspot.productImageUrl ? (
                        <img
                          src={hotspot.productImageUrl}
                          alt=""
                          style={{
                            width: 72,
                            height: 72,
                            flexShrink: 0,
                            borderRadius: 8,
                            objectFit: 'cover',
                            background: '#f3f4f6',
                          }}
                        />
                      ) : (
                        <span
                          aria-hidden
                          style={{
                            width: 72,
                            height: 72,
                            flexShrink: 0,
                            borderRadius: 8,
                            background: PLACEHOLDER_IMAGE_BG,
                          }}
                        />
                      )}
                      <span
                        style={{
                          display: 'flex',
                          minWidth: 0,
                          flex: 1,
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          paddingTop: 2,
                          paddingBottom: 2,
                        }}
                      >
                        <span>
                          <span
                            style={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: 13,
                              fontWeight: 600,
                              lineHeight: 1.25,
                              color: '#111827',
                            }}
                          >
                            {hotspot.productTitle}
                          </span>
                          {hotspot.price ? (
                            <span
                              style={{
                                display: 'block',
                                marginTop: 2,
                                fontSize: 12,
                                color: '#1f2937',
                              }}
                            >
                              {hotspot.price}
                            </span>
                          ) : null}
                        </span>
                        {showSoldOut ? (
                          <span
                            style={{
                              alignSelf: 'flex-end',
                              borderRadius: 4,
                              background: '#e8e8e8',
                              padding: '4px 8px',
                              fontSize: 9,
                              fontWeight: 600,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                              color: '#4b5563',
                            }}
                          >
                            Sold out
                          </span>
                        ) : null}
                      </span>
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
