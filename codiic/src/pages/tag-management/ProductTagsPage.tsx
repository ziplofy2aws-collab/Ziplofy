import React from 'react';
import ProductTagsSection from '../../components/tags/ProductTagsSection';
import TagManagementAreaPage from '../../components/tags/TagManagementAreaPage';

const ProductTagsPage: React.FC = () => {
  return (
    <TagManagementAreaPage
      title="Product tags"
      description="Group products for collections, search filters, and merchandising without changing your core catalog structure."
    >
      <ProductTagsSection />
    </TagManagementAreaPage>
  );
};

export default ProductTagsPage;
