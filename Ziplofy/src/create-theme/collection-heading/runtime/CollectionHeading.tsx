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

export function CollectionHeading({
  sectionId = 'collection_heading',
  templateId = 'collection',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { maxWidth, padX, padXMobile } = useThemeLayout();
  const { text, background, fontHeading, fontBody } = useThemeColors();
  const { collection } = useCollectionPageData();
  const base = secBase(templateId, sectionId);
  const scopeClass = sectionScopeClass('codiic-collection-heading', sectionId);
  const isAllProductsPage = templateId === 'products';

  const configTitle = cfgString(config, `${base}.blocks.title.settings.text`, '');
  const configDescription = cfgString(config, `${base}.blocks.description.settings.text`, '');
  const paddingTop = cfgNumber(config, `${base}.settings.paddingTop`, 32);
  const paddingBottom = cfgNumber(config, `${base}.settings.paddingBottom`, 8);
  const sectionWidth = cfgString(config, `${base}.settings.sectionWidth`, 'page');

  const title = isAllProductsPage
    ? configTitle.trim() || 'All products'
    : collection?.title?.trim() || configTitle || 'Collection';
  const description = isAllProductsPage
    ? configDescription.trim()
    : collection?.description?.trim() || configDescription;

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
    `)
  );

  return (
    <EditorSection
      nodeId={`template:${templateId}:${sectionId}`}
      className={scopeClass}
      style={shellStyle}
    >
      <style>{responsiveCss}</style>
      <div style={innerStyle}>
        <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:title`}>
          <h1
            style={{
              margin: 0,
              fontFamily: fontHeading,
              fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)',
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              wordBreak: 'break-word',
            }}
          >
            <ThemeEditorRichTextContent html={title} />
          </h1>
        </EditorBlock>
        {description ? (
          <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:description`}>
            <div
              style={{
                marginTop: 12,
                fontSize: '1rem',
                lineHeight: 1.55,
                opacity: 0.82,
                maxWidth: 720,
              }}
            >
              <ThemeEditorRichTextContent html={description} />
            </div>
          </EditorBlock>
        ) : null}
      </div>
    </EditorSection>
  );
}
