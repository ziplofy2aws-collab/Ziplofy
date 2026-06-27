import { useMemo, type CSSProperties } from 'react';
import { useThemeConfig } from '@render-store/sdk';
import { EditorSection } from '../../runtime/shared/editorAttrs';
import { cfgString } from '../../runtime/shared/config';
import { useThemeColors } from '../../runtime/shared/tokens';
import type { SectionRuntimeProps } from '../../runtime/types';
import { readCollectionListBentoLayout } from './collectionListBentoStyles';
import {
  CollectionListBentoLayoutView,
  CollectionListCarouselLayoutView,
  CollectionListEditorialLayoutView,
  CollectionListGridLayoutView,
} from './CollectionListLayoutViews';

type CollectionLayoutType = 'bento' | 'grid' | 'carousel' | 'editorial';

const LAYOUT_LABELS: Record<CollectionLayoutType, string> = {
  bento: 'Collection list: Bento',
  grid: 'Collection list: Grid',
  carousel: 'Collection list: Carousel',
  editorial: 'Collection list: Editorial',
};

type Props = SectionRuntimeProps & {
  /** Fallback layout when the section config hasn't set `cardsLayoutType`. */
  defaultLayout?: CollectionLayoutType;
};

export function CollectionListBento({
  sectionId = 'collection_list_bento',
  templateId = 'index',
  placement = 'template',
  defaultLayout = 'bento',
}: Props) {
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

  const cardsLayoutType = useMemo<CollectionLayoutType>(() => {
    const raw = cfgString(config, `${settingsBase}.cardsLayoutType`, '');
    if (raw === 'grid' || raw === 'carousel' || raw === 'editorial' || raw === 'bento') {
      return raw;
    }
    return defaultLayout;
  }, [config, settingsBase, defaultLayout]);

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
      label={LAYOUT_LABELS[cardsLayoutType]}
      editorNodeId={editorNodeId}
      style={outerStyle}
    >
      {cardsLayoutType === 'grid' ? (
        <CollectionListGridLayoutView {...layoutProps} />
      ) : cardsLayoutType === 'carousel' ? (
        <CollectionListCarouselLayoutView {...layoutProps} />
      ) : cardsLayoutType === 'editorial' ? (
        <CollectionListEditorialLayoutView {...layoutProps} />
      ) : (
        <CollectionListBentoLayoutView {...layoutProps} />
      )}
    </EditorSection>
  );
}

export function CollectionListGrid(props: SectionRuntimeProps) {
  return <CollectionListBento {...props} defaultLayout="grid" />;
}

export function CollectionListCarousel(props: SectionRuntimeProps) {
  return <CollectionListBento {...props} defaultLayout="carousel" />;
}

export function CollectionListEditorial(props: SectionRuntimeProps) {
  return <CollectionListBento {...props} defaultLayout="editorial" />;
}
