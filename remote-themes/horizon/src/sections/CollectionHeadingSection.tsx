import { useThemeConfig } from '@render-store/sdk';
import { cfgString } from '../lib/config';
import { EditorBlock, EditorField, EditorSection } from '../lib/editorAttrs';
import { ThemeRichTextContent } from '../lib/ThemeRichTextContent';
import { useCollectionPageData } from '../lib/useCollectionPageData';
import { layout, useThemeColors } from '../tokens';

type Props = {
  sectionId?: string;
  templateId?: string;
};

export function CollectionHeadingSection({
  sectionId = 'collection_heading',
  templateId = 'collection',
}: Props) {
  const config = useThemeConfig();
  const { text, background, fontHeading, fontBody } = useThemeColors();
  const { collection } = useCollectionPageData();
  const base = `templates.${templateId}.sections.${sectionId}`;

  const configTitle = cfgString(config, `${base}.blocks.title.settings.text`, '');
  const configDescription = cfgString(config, `${base}.blocks.description.settings.text`, '');

  const title = collection?.title?.trim() || configTitle || 'Collection title';
  const description = collection?.description?.trim() || configDescription;

  return (
    <EditorSection
      sectionId={sectionId}
      editorNodeId={`template:${templateId}:${sectionId}`}
      label="Collection heading"
      style={{
        background,
        color: text,
        fontFamily: fontBody,
        padding: `32px ${layout.padX}px 8px`,
      }}
    >
      <div style={{ maxWidth: layout.maxWidth, margin: '0 auto' }}>
        <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:title`} label="Title">
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
            <EditorField fieldPath={`${base}.blocks.title.settings.text`} label="Title">
              <ThemeRichTextContent html={title} />
            </EditorField>
          </h1>
        </EditorBlock>
        {description ? (
          <EditorBlock nodeId={`template:${templateId}:${sectionId}:block:description`} label="Description">
            <div style={{ marginTop: 12, fontSize: '1rem', lineHeight: 1.55, opacity: 0.82 }}>
              <ThemeRichTextContent html={description} />
            </div>
          </EditorBlock>
        ) : null}
      </div>
    </EditorSection>
  );
}
