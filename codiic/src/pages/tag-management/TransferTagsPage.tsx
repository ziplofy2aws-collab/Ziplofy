import React from 'react';
import TagManagementAreaPage from '../../components/tags/TagManagementAreaPage';
import TransferTagsSection from '../../components/tags/TransferTagsSection';

const TransferTagsPage: React.FC = () => {
  return (
    <TagManagementAreaPage
      title="Transfer tags"
      description="Label inventory transfers so your team can filter and track stock movements consistently."
    >
      <TransferTagsSection />
    </TagManagementAreaPage>
  );
};

export default TransferTagsPage;
