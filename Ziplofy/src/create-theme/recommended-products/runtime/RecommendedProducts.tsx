import { useMemo, useRef, type CSSProperties } from 'react';
import { getThemeConfigValue, useThemeConfig } from '@render-store/sdk';
import { cfgBool, cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorField, EditorSection } from '../../runtime/shared/editorAttrs';
import { useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import { combineResponsiveCss, sectionScopeClass } from '../../runtime/shared/responsive';
import { orderedIds } from '../../runtime/shared/structureOrder';
import type { SectionRuntimeProps } from '../../runtime/types';
import { RecommendedProductCardArt } from './RecommendedProductCardArt';

type Scheme = { background: string; color: string; muted: string };

const SCHEMES: Record<string, Scheme> = {
  'scheme-1': { background: '#ffffff', color: '#111827', muted: '#6b7280' },
  'scheme-2': { background: '#f6f6f7', color: '#111827', muted: '#6b7280' },
  'scheme-3': { background: '#eef6fb', color: '#0f172a', muted: '#64748b' },
  'scheme-4': { background: '#f5f3ff', color: '#1e1b4b', muted: '#6b7280' },
};

type CardData = {
  id: string;
  shirtColor: string;
  withSun: boolean;
  productTitle: string;
  price: string;
};

function NavButton({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === 'prev' ? 'Previous' : 'Next'}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        border: 'none',
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '50%',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        color: '#111827',
        fontSize: 20,
        lineHeight: 1,
      }}
    >
      {dir === 'prev' ? '\u2190' : '\u2192'}
    </button>
  );
}

export function RecommendedProducts({
  sectionId,
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const { maxWidth } = useThemeLayout();
  const trackRef = useRef<HTMLDivElement>(null);

  const sectionBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}`
      : `sections.${sectionId}`;
  const settingsBase = `${sectionBase}.settings`;
  const blocksBase = `${sectionBase}.blocks`;
  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const heading = cfgString(config, `${settingsBase}.heading`, 'Related products');
  const schemeKey = cfgString(config, `${settingsBase}.colorScheme`, 'scheme-1');
  const cardStyle = cfgString(config, `${settingsBase}.cardStyle`, 'grid');
  const carouselOnMobile = cfgBool(config, `${settingsBase}.carouselOnMobile`, false);
  const productCount = Math.max(1, Math.min(12, cfgNumber(config, `${settingsBase}.productCount`, 4)));
  const columns = Math.max(1, Math.min(6, cfgNumber(config, `${settingsBase}.columns`, 4)));
  const mobileColumns = cfgString(config, `${settingsBase}.mobileColumns`, '2') === '1' ? 1 : 2;
  const hGap = Math.max(0, cfgNumber(config, `${settingsBase}.horizontalGap`, 12));
  const vGap = Math.max(0, cfgNumber(config, `${settingsBase}.verticalGap`, 24));
  const sectionWidth = cfgString(config, `${settingsBase}.sectionWidth`, 'page');
  const layoutGap = cfgNumber(config, `${settingsBase}.layoutGap`, 28);
  const paddingTop = cfgNumber(config, `${settingsBase}.paddingTop`, 48);
  const paddingBottom = cfgNumber(config, `${settingsBase}.paddingBottom`, 48);
  const customCss = cfgString(config, `${settingsBase}.customCss`, '');

  const scheme = SCHEMES[schemeKey] ?? SCHEMES['scheme-1'];
  const isCarousel = cardStyle === 'carousel';
  const isFullWidth = sectionWidth === 'full';

  const blockOrder = orderedIds(config, `${sectionBase}.block_order`, blocksBase, []);

  const cards: CardData[] = useMemo(() => {
    const blocksMap = getThemeConfigValue(config, blocksBase) as
      | Record<string, { settings?: Record<string, unknown> }>
      | null
      | undefined;
    if (!blocksMap || typeof blocksMap !== 'object') return [];

    const legacyIds = blockOrder.filter(
      (id) => id.startsWith('product_') && blocksMap[id] && id !== 'product_card'
    );
    if (legacyIds.length) {
      return legacyIds
        .slice(0, productCount)
        .map((id) => {
          const s = blocksMap[id]?.settings ?? {};
          return {
            id,
            shirtColor: String(s.shirtColor ?? '#d45454'),
            withSun: Boolean(s.withSun),
            productTitle: String(s.productTitle ?? 'Product title'),
            price: String(s.price ?? ''),
          };
        });
    }

    const demoColors = [
      { shirtColor: '#d45454', withSun: false },
      { shirtColor: '#5a9a6a', withSun: false },
      { shirtColor: '#4b5563', withSun: true },
      { shirtColor: '#d45454', withSun: false },
    ];
    return Array.from({ length: productCount }, (_, index) => ({
      id: `demo_${index + 1}`,
      shirtColor: demoColors[index % demoColors.length]!.shirtColor,
      withSun: demoColors[index % demoColors.length]!.withSun,
      productTitle: 'Product title',
      price: 'Rs. 19.99',
    }));
  }, [config, blocksBase, blockOrder, productCount]);

  const scopeClass = sectionScopeClass('recommended-products', sectionId);

  const layoutCss = useMemo(() => {
    const sel = `[data-ziplofy-section="${sectionId}"]`;
    return combineResponsiveCss(
      `${sel} .rp-product-grid {
  display: ${isCarousel ? 'flex' : 'grid'};
  ${isCarousel
        ? 'flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;'
        : `grid-template-columns: repeat(${columns}, minmax(0, 1fr));`}
  column-gap: ${hGap}px;
  row-gap: ${vGap}px;
}`,
      `${sel} .rp-product-grid::-webkit-scrollbar { display: none; }`,
      isCarousel
        ? `${sel} .rp-product-grid > article { flex: 0 0 calc((100% - ${(columns - 1) * hGap}px) / ${columns}); min-width: 0; scroll-snap-align: start; }`
        : '',
      `@media (max-width: 749px) {
  ${sel} .rp-product-grid {
    ${carouselOnMobile || isCarousel
        ? 'display: flex; flex-wrap: nowrap; overflow-x: auto; grid-template-columns: unset;'
        : `grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr));`}
  }
}`,
      customCss.trim() ? `.${scopeClass} { ${customCss} }` : ''
    );
  }, [sectionId, isCarousel, columns, hGap, vGap, mobileColumns, carouselOnMobile, customCss, scopeClass]);

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

  const scrollByPage = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <EditorSection
      sectionId={sectionId}
      label="Recommended products"
      editorNodeId={editorNodeId}
      className={scopeClass}
      style={outerStyle}
    >
      <style>{layoutCss}</style>
      <div style={innerStyle}>
        <EditorField
          fieldPath={`${settingsBase}.heading`}
          label="Heading"
          as="h2"
          style={{ margin: `0 0 ${layoutGap}px`, fontSize: 28, fontWeight: 700, fontFamily: fontHeading }}
        >
          {heading}
        </EditorField>

        <div style={{ position: 'relative' }}>
          {isCarousel ? (
            <div style={{ position: 'absolute', right: 0, top: -52, display: 'flex', gap: 8, zIndex: 2 }}>
              <NavButton dir="prev" onClick={() => scrollByPage(-1)} />
              <NavButton dir="next" onClick={() => scrollByPage(1)} />
            </div>
          ) : null}

          <div ref={trackRef} className="rp-product-grid">
            {cards.map((card) => {
              const blockBase = `${blocksBase}.${card.id}.settings`;
              const blockNodeId = `${editorNodeId}:block:${card.id}`;
              return (
                <EditorBlock key={card.id} nodeId={blockNodeId} label="Product card" style={{ margin: 0, minWidth: 0 }}>
                  <article style={{ margin: 0 }}>
                    <RecommendedProductCardArt shirtColor={card.shirtColor} withSun={card.withSun} />
                    <p style={{ margin: '10px 0 0', fontSize: 14, fontWeight: 500, color: scheme.color }}>
                      <EditorField fieldPath={`${blockBase}.productTitle`} label="Product title">
                        {card.productTitle}
                      </EditorField>
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: scheme.muted }}>
                      <EditorField fieldPath={`${blockBase}.price`} label="Price">
                        {card.price}
                      </EditorField>
                    </p>
                  </article>
                </EditorBlock>
              );
            })}
          </div>
        </div>
      </div>
    </EditorSection>
  );
}
