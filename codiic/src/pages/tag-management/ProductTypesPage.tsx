import React from 'react';
import ProductTypesSection from '../../components/tags/ProductTypesSection';
import TagManagementAreaPage from '../../components/tags/TagManagementAreaPage';

const ProductTypesPage: React.FC = () => {
  return (
    <TagManagementAreaPage
      title="Product types"
      description="Define type labels for your catalog so products stay organized for reporting and internal workflows."
    >
      <ProductTypesSection />
    </TagManagementAreaPage>
  );
};

export default ProductTypesPage;
