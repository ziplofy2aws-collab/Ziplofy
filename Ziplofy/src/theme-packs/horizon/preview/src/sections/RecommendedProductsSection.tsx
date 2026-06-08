import { useMemo, useRef, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { RecommendedProductCardArt } from '../lib/RecommendedProductCardArt';
import {
  readRecommendedProductCards,
  readRecommendedProductsLayout,
  scopedRecommendedProductsCss,
} from '../lib/recommendedProductsStyles';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
  placement?: 'layout' | 'template';
};

function NavButton({
  label,
  onClick,
  background,
  shape,
}: {
  label: string;
  onClick: () => void;
  background: 'none' | 'circle' | 'square';
  shape: 'arrows' | 'chevron';
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: background === 'none' ? 32 : 36,
        height: background === 'none' ? 32 : 36,
        border: 'none',
        cursor: 'pointer',
        background:
          background === 'circle' || background === 'square'
            ? 'rgba(255,255,255,0.95)'
            : 'transparent',
        borderRadius: background === 'circle' ? '50%' : background === 'square' ? 6 : 0,
        boxShadow: background !== 'none' ? '0 1px 4px rgba(0,0,0,0.12)' : undefined,
        color: '#111827',
        fontSize: shape === 'chevron' ? 18 : 20,
        lineHeight: 1,
      }}
    >
      {shape === 'chevron' ? (label === 'Previous' ? '‹' : '›') : label === 'Previous' ? '←' : '→'}
    </button>
  );
}

export function RecommendedProductsSection({
  sectionId = 'recommended_products',
  templateId = 'index',
  placement = 'template',
}: Props) {
  const config = useThemeConfig();
  const { fontBody, fontHeading } = useThemeColors();
  const trackRef = useRef<HTMLDivElement>(null);

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const layoutStyle = useMemo(
    () => readRecommendedProductsLayout(config, settingsBase),
    [config, settingsBase]
  );

  const cards = useMemo(
    () =>
      readRecommendedProductCards(
        config,
        templateId,
        sectionId,
        placement,
        layoutStyle.productCount
      ),
    [config, templateId, sectionId, placement, layoutStyle.productCount]
  );

  const isCarousel = layoutStyle.cardStyle === 'carousel';
  const scopeClass = `ziplofy-recommended-products-${sectionId.replace(/[^a-z0-9_-]/gi, '-')}`;
  const customCss = scopedRecommendedProductsCss(sectionId, layoutStyle.customCss);

  const layoutCss = useMemo(
    () => `
[data-ziplofy-section="${sectionId}"] .rp-product-grid {
  display: ${isCarousel ? 'flex' : 'grid'};
  ${isCarousel ? 'flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;' : `grid-template-columns: repeat(${layoutStyle.columns}, minmax(0, 1fr));`}
  column-gap: ${layoutStyle.horizontalGap}px;
  row-gap: ${layoutStyle.verticalGap}px;
}
[data-ziplofy-section="${sectionId}"] .rp-product-grid::-webkit-scrollbar { display: none; }
[data-ziplofy-section="${sectionId}"] .rp-product-grid > article {
  ${isCarousel ? `flex: 0 0 calc((100% - ${(layoutStyle.columns - 1) * layoutStyle.horizontalGap}px) / ${layoutStyle.columns}); min-width: 0; scroll-snap-align: start;` : ''}
}
@media (max-width: 749px) {
  [data-ziplofy-section="${sectionId}"] .rp-product-grid {
    ${
      layoutStyle.carouselOnMobile || isCarousel
        ? 'display: flex; flex-wrap: nowrap; overflow-x: auto; grid-template-columns: unset;'
        : `grid-template-columns: repeat(${layoutStyle.mobileColumns}, minmax(0, 1fr));`
    }
  }
  [data-ziplofy-section="${sectionId}"][data-mobile-columns="1"] .rp-product-grid > article {
    flex: 0 0 calc(100% - 8px);
  }
  [data-ziplofy-section="${sectionId}"][data-mobile-columns="2"] .rp-product-grid > article {
    flex: 0 0 calc(50% - ${layoutStyle.horizontalGap / 2}px);
  }
}
`,
    [
      sectionId,
      isCarousel,
      layoutStyle.columns,
      layoutStyle.horizontalGap,
      layoutStyle.verticalGap,
      layoutStyle.mobileColumns,
      layoutStyle.carouselOnMobile,
    ]
  );

  const outerStyle: CSSProperties = {
    paddingTop: layoutStyle.paddingTop,
    paddingBottom: layoutStyle.paddingBottom,
    background: layoutStyle.scheme.background,
    color: layoutStyle.scheme.color,
    fontFamily: fontBody,
  };

  const innerStyle: CSSProperties =
    layoutStyle.sectionWidth === 'full'
      ? { maxWidth: '100%', paddingLeft: 0, paddingRight: 0 }
      : {
          maxWidth: layout.contentMaxWidth,
          margin: '0 auto',
          paddingLeft: 24,
          paddingRight: 24,
        };

  const headingPath = `${settingsBase}.heading`;

  const scrollBy = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <EditorSection
      sectionId={sectionId}
      label="Recommended products"
      editorNodeId={editorNodeId}
      style={outerStyle}
    >
      {customCss ? <style>{customCss}</style> : null}
      <style>{layoutCss}</style>
      <div
        className={scopeClass}
        style={innerStyle}
        data-mobile-columns={String(layoutStyle.mobileColumns)}
        data-rp-carousel={isCarousel || layoutStyle.carouselOnMobile ? 'true' : 'false'}
      >
        <EditorField
          fieldPath={headingPath}
          label="Heading"
          as="h2"
          style={{
            margin: `0 0 ${layoutStyle.layoutGap}px`,
            fontSize: 28,
            fontWeight: 700,
            fontFamily: fontHeading,
          }}
        >
          {layoutStyle.heading}
        </EditorField>

        <div style={{ position: 'relative' }}>
          {isCarousel ? (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: -52,
                display: 'flex',
                gap: 8,
                zIndex: 2,
              }}
            >
              <NavButton label="Previous" onClick={() => scrollBy(-1)} background="circle" shape="arrows" />
              <NavButton label="Next" onClick={() => scrollBy(1)} background="circle" shape="arrows" />
            </div>
          ) : null}

          <div ref={trackRef} className="rp-product-grid">
            {cards.map((card) => {
              const blockBase =
                placement === 'template'
                  ? `templates.${templateId}.sections.${sectionId}.blocks.${card.id}.settings`
                  : `sections.${sectionId}.blocks.${card.id}.settings`;
              const blockNodeId =
                placement === 'template'
                  ? `template:${templateId}:${sectionId}:block:${card.id}`
                  : `layout:${sectionId}:block:${card.id}`;

              const articleStyle: CSSProperties = {
                margin: 0,
                minWidth: 0,
              };

              return (
                <EditorBlock key={card.id} nodeId={blockNodeId} label="Product card" style={articleStyle}>
                  <article>
                    <RecommendedProductCardArt shirtColor={card.shirtColor} withSun={card.withSun} />
                    <p
                      style={{
                        margin: '10px 0 0',
                        fontSize: 14,
                        fontWeight: 500,
                        color: layoutStyle.scheme.color,
                        textAlign: 'center',
                      }}
                    >
                      <EditorField fieldPath={`${blockBase}.productTitle`} label="Product title">
                        {card.productTitle}
                      </EditorField>
                    </p>
                    <p
                      style={{
                        margin: '2px 0 0',
                        fontSize: 13,
                        color: layoutStyle.scheme.muted,
                        textAlign: 'center',
                      }}
                    >
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
