import { DocumentTextIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export const ContentBlogPostsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-page-background-color">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="pl-3 border-l-4 border-blue-500/60">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Blog posts</h1>
            <p className="text-sm text-gray-500 mt-0.5">Build a community around your products and brand with blog posts</p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200/80 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
            >
              Manage Blogs
            </button>
            <button
              onClick={() => navigate("/content/blog-posts/new")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Create Blog
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm min-h-[400px] flex justify-center items-center p-12">
          <div className="flex flex-col justify-center items-center text-center gap-4 max-w-md">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
              <DocumentTextIcon className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-lg font-semibold text-gray-900">Write a blog post</span>
              <span className="text-sm text-gray-500">
                Blog posts are a great way to build a community around your products and your brand.
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200/80 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors">
                Learn More
              </button>
              <button
                onClick={() => navigate("/content/blog-posts/new")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Create Blog
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
