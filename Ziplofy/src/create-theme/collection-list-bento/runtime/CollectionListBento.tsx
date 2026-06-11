import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { EditorSection } from '../../runtime/shared/editorAttrs';
import { useThemeColors } from '../../runtime/shared/tokens';
import type { SectionRuntimeProps } from '../../runtime/types';
import { readCollectionListBentoLayout } from './collectionListBentoStyles';
import {
  CollectionListBentoLayoutView,
  CollectionListCarouselLayoutView,
  CollectionListEditorialLayoutView,
  CollectionListGridLayoutView,
} from './CollectionListLayoutViews';

export function CollectionListBento({
  sectionId = 'collection_list_bento',
  templateId = 'index',
  placement = 'template',
}: SectionRuntimeProps) {
  const config = useThemeConfig();
  const { fontBody } = useThemeColors();

  const settingsBase =
    placement === 'template'
      ? `templates.${templateId}.sections.${sectionId}.settings`
      : `sections.${sectionId}.settings`;

  const editorNodeId =
    placement === 'template' ? `template:${templateId}:${sectionId}` : `layout:${sectionId}`;

  const layoutStyle = useMemo(
    () => readCollectionListBentoLayout(config, settingsBase),
    [config, settingsBase]
  );

  const outerStyle: CSSProperties = {
    paddingTop: layoutStyle.paddingTop,
    paddingBottom: layoutStyle.paddingBottom,
    background: layoutStyle.scheme.background,
    color: layoutStyle.scheme.color,
    fontFamily: fontBody,
    boxSizing: 'border-box',
  };

  const layoutProps = { sectionId, templateId, placement, settingsBase, editorNodeId };

  return (
    <EditorSection
      sectionId={sectionId}
      label="Collection list: Bento"
      editorNodeId={editorNodeId}
      style={outerStyle}
    >
      {layoutStyle.cardsLayoutType === 'grid' ? (
        <CollectionListGridLayoutView {...layoutProps} />
      ) : layoutStyle.cardsLayoutType === 'carousel' ? (
        <CollectionListCarouselLayoutView {...layoutProps} />
      ) : layoutStyle.cardsLayoutType === 'editorial' ? (
        <CollectionListEditorialLayoutView {...layoutProps} />
      ) : (
        <CollectionListBentoLayoutView {...layoutProps} />
      )}
    </EditorSection>
  );
}
