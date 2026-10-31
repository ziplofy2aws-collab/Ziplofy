import React from 'react';
import { SearchEngineListingEditor } from '../../seo/SearchEngineListingEditor';
import { COLLECTION_FORM_APPEARANCE } from './collection-form.types';

type CollectionSeoSectionProps = {
  collectionTitle: string;
  collectionDescription: string;
  pageTitle: string;
  metaDescription: string;
  urlHandle: string;
  onPageTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onUrlHandleChange: (value: string) => void;
};

const CollectionSeoSection: React.FC<CollectionSeoSectionProps> = ({
  collectionTitle,
  collectionDescription,
  pageTitle,
  metaDescription,
  urlHandle,
  onPageTitleChange,
  onMetaDescriptionChange,
  onUrlHandleChange,
}) => {
  const appearance = COLLECTION_FORM_APPEARANCE;

  return (
    <SearchEngineListingEditor
      entityTitle={collectionTitle}
      entityDescription={collectionDescription}
      pageTitle={pageTitle}
      metaDescription={metaDescription}
      urlHandle={urlHandle}
      urlPrefix="collections"
      fallbackSlug="collection"
      onPageTitleChange={onPageTitleChange}
      onMetaDescriptionChange={onMetaDescriptionChange}
      onUrlHandleChange={onUrlHandleChange}
      compact={appearance === 'minimal'}
      className={appearance === 'minimal' ? 'border-gray-200/50 shadow-none' : ''}
    />
  );
};

export default CollectionSeoSection;
