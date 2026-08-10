import React from 'react';
import PurchaseOrderTagsSection from '../../components/tags/PurchaseOrderTagsSection';
import TagManagementAreaPage from '../../components/tags/TagManagementAreaPage';

const PurchaseOrderTagsPage: React.FC = () => {
  return (
    <TagManagementAreaPage
      title="Purchase order tags"
      description="Tag purchase orders for procurement workflows, approvals, and reporting across suppliers."
    >
      <PurchaseOrderTagsSection />
    </TagManagementAreaPage>
  );
};

export default PurchaseOrderTagsPage;
