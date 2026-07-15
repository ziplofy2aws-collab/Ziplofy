import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { cfgNumber, cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { useCollectionPageData } from '../../runtime/shared/useCollectionPageData';
import { useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import {
  combineResponsiveCss,
  mobileMedia,
  sectionScopeClass,
} from '../../runtime/shared/responsive';
import type { SectionRuntimeProps } from '../../runtime/types';

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

function isMeaningfulText(value: string): boolean {
  const plain = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 0;
}

export function CollectionHeading({
  sectionId = 'collection_heading',
  templateId = 'collection',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { maxWidth, padX, padXMobile } = useThemeLayout();
  const { text, background, muted, border, fontHeading, fontBody } = useThemeColors();
  const { collection, loading } = useCollectionPageData();
  const base = secBase(templateId, sectionId);
  const scopeClass = sectionScopeClass('codiic-collection-heading', sectionId);
  const isAllProductsPage = templateId === 'products';
  const editorNodeId = `template:${templateId}:${sectionId}`;

  const configTitle = cfgString(config, `${base}.blocks.title.settings.text`, '');
  const configDescription = cfgString(config, `${base}.blocks.description.settings.text`, '');
  const paddingTop = cfgNumber(config, `${base}.settings.paddingTop`, 40);
  const paddingBottom = cfgNumber(config, `${base}.settings.paddingBottom`, 12);
  const sectionWidth = cfgString(config, `${base}.settings.sectionWidth`, 'page');

  const title = (() => {
    if (isAllProductsPage) return configTitle.trim() || 'All products';
    const live = collection?.title?.trim();
    if (live) return live;
    if (loading) return configTitle.trim() || 'Collection';
    const fallback = configTitle.trim();
    if (fallback && fallback.toLowerCase() !== 'collection title') return fallback;
    return 'Collection';
  })();

  const description = (() => {
    if (isAllProductsPage) {
      return isMeaningfulText(configDescription) ? configDescription : '';
    }
    const live = collection?.description?.trim() || '';
    if (isMeaningfulText(live)) return live;
    return isMeaningfulText(configDescription) ? configDescription : '';
  })();

  const imageUrl = !isAllProductsPage ? collection?.imageUrl?.trim() || '' : '';
  const imageAlt = collection?.imageAltText?.trim() || title;

  const shellStyle = useMemo<CSSProperties>(
    () => ({
      background,
      color: text,
      fontFamily: fontBody,
      paddingTop,
      paddingBottom,
      paddingLeft: padX,
      paddingRight: padX,
      boxSizing: 'border-box',
      width: '100%',
      overflowX: 'hidden',
    }),
    [background, text, fontBody, paddingTop, paddingBottom, padX]
  );

  const innerStyle = useMemo<CSSProperties>(
    () => ({
      maxWidth: sectionWidth === 'full' ? '100%' : maxWidth,
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box',
    }),
    [maxWidth, sectionWidth]
  );

  const responsiveCss = combineResponsiveCss(
    mobileMedia(`
      .${scopeClass} {
        padding-left: ${padXMobile}px !important;
        padding-right: ${padXMobile}px !important;
      }
      .${scopeClass} .codiic-ch-hero {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }
      .${scopeClass} .codiic-ch-image {
        max-height: 220px !important;
      }
    `)
  );

  return (
    <EditorSection
      sectionId={sectionId}
      label="Collection heading"
      editorNodeId={editorNodeId}
      className={scopeClass}
      style={shellStyle}
    >
      <style>{responsiveCss}</style>
      <div style={innerStyle}>
        <div
          className="codiic-ch-hero"
          style={{
            display: 'grid',
            gridTemplateColumns: imageUrl ? 'minmax(0, 1.4fr) minmax(0, 1fr)' : '1fr',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <EditorBlock
              nodeId={`${editorNodeId}:block:title`}
              label="Title"
            >
              <h1
                style={{
                  margin: 0,
                  fontFamily: fontHeading,
                  fontSize: 'clamp(1.85rem, 3vw, 2.5rem)',
                  fontWeight: 600,
                  lineHeight: 1.12,
                  letterSpacing: '-0.025em',
                  wordBreak: 'break-word',
                  color: text,
                }}
              >
                <ThemeEditorRichTextContent html={title} />
              </h1>
            </EditorBlock>
            {description ? (
              <EditorBlock
                nodeId={`${editorNodeId}:block:description`}
                label="Description"
              >
                <div
                  style={{
                    marginTop: 14,
                    fontSize: '1.02rem',
                    lineHeight: 1.6,
                    color: muted || text,
                    opacity: 0.9,
                    maxWidth: 640,
                  }}
                >
                  <ThemeEditorRichTextContent html={description} />
                </div>
              </EditorBlock>
            ) : null}
          </div>

          {imageUrl ? (
            <div
              className="codiic-ch-image"
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${border || 'rgba(17,24,39,0.08)'}`,
                background: '#f4f4f5',
                aspectRatio: '4 / 3',
                maxHeight: 320,
                width: '100%',
              }}
            >
              <img
                src={imageUrl}
                alt={imageAlt}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </EditorSection>
  );
}
