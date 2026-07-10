import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../../runtime/shared/config';
import { EditorBlock, EditorSection } from '../../runtime/shared/editorAttrs';
import { ThemeEditorRichTextContent } from '../../runtime/shared/ThemeEditorRichTextContent';
import { useCollectionPageData } from '../../runtime/shared/useCollectionPageData';
import { layout, useThemeColors, useThemeLayout } from '../../runtime/shared/tokens';
import type { SectionRuntimeProps } from '../../runtime/types';

function secBase(templateId: string, sectionId: string): string {
  return `templates.${templateId}.sections.${sectionId}`;
}

export function CollectionHeading({
  sectionId = 'collection_heading',
  templateId = 'collection',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { maxWidth } = useThemeLayout();
  const { text, background, fontHeading, fontBody } = useThemeColors();
  const { collection } = useCollectionPageData();
  const base = secBase(templateId, sectionId);

  const configTitle = cfgString(config, `${base}.blocks.title.settings.text`, '');
  const configDescription = cfgString(config, `${base}.blocks.description.settings.text`, '');

  const title = collection?.title?.trim() || configTitle || 'Collection title';
  const description = collection?.description?.trim() || configDescription;

  return (
    <EditorSection
      nodeId={`template:${templateId}:${sectionId}`}
      style={{
        ...layout.section,
        background,
        color: text,
        fontFamily: fontBody,
        paddingTop: 32,
        paddingBottom: 8,
      }}
    >
      <div style={{ ...layout.container, maxWidth }}>
        <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:title`}>
          <h1
            style={{
              margin: 0,
              fontFamily: fontHeading,
              fontSize: '2.25rem',
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            <ThemeEditorRichTextContent html={title} />
          </h1>
        </EditorBlock>
        {description ? (
          <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:description`}>
            <div style={{ marginTop: 12, fontSize: '1rem', lineHeight: 1.55, opacity: 0.82 }}>
              <ThemeEditorRichTextContent html={description} />
            </div>
          </EditorBlock>
        ) : null}
      </div>
    </EditorSection>
  );
}
