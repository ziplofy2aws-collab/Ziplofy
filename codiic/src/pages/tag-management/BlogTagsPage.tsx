import BlogTagsSection from '../../components/tags/BlogTagsSection';
import TagManagementAreaPage from '../../components/tags/TagManagementAreaPage';

export default function BlogTagsPage() {
  return (
    <TagManagementAreaPage
      title="Blog tags"
      description="Organize and categorize blog posts so your team can filter and manage content consistently."
    >
      <BlogTagsSection />
    </TagManagementAreaPage>
  );
}
