import React from 'react';
import CustomerTagsSection from '../../components/tags/CustomerTagsSection';
import TagManagementAreaPage from '../../components/tags/TagManagementAreaPage';

const CustomerTagsPage: React.FC = () => {
  return (
    <TagManagementAreaPage
      title="Customer tags"
      description="Create labels to organize and segment customers for marketing, support, and reporting."
    >
      <CustomerTagsSection />
    </TagManagementAreaPage>
  );
};

export default CustomerTagsPage;
