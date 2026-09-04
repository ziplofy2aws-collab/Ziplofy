const mongoose = require('mongoose');
const WebpanelBlog = require('../models/WebpanelBlog');
const WebpanelBlogPost = require('../models/WebpanelBlogPost');
const { slugifyHandle } = require('../utils/slug.util');

function assertValidStoreId(storeId) {
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    const err = new Error('Valid storeId is required');
    err.statusCode = 400;
    throw err;
  }
}

function normalizeHandle(raw) {
  try {
    return slugifyHandle(decodeURIComponent(String(raw || '').trim()));
  } catch {
    return slugifyHandle(String(raw || '').trim());
  }
}

function isPreviewRequest(req) {
  const preview = req.query.preview;
  return preview === '1' || preview === 'true';
}

/** GET /api/storefront/:storeId/blogs */
const listStorefrontBlogs = async (req, res) => {
  try {
    const { storeId } = req.params;
    assertValidStoreId(storeId);
    const rows = await WebpanelBlog.find({ store: storeId }).sort({ updatedAt: -1 }).lean();
    const data = await Promise.all(
      rows.map(async (blog) => {
        const postCount = await WebpanelBlogPost.countDocuments({ blog: blog._id, visibility: 'visible' });
        return {
          _id: String(blog._id),
          title: blog.title,
          pageTitle: blog.pageTitle || '',
          metaDescription: blog.metaDescription || '',
          urlHandle: blog.urlHandle,
          comments: blog.comments,
          postCount,
          updatedAt: blog.updatedAt,
        };
      })
    );
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to list blogs' });
  }
};

/** GET /api/storefront/:storeId/blog-posts */
const listStorefrontBlogPosts = async (req, res) => {
  try {
    const { storeId } = req.params;
    assertValidStoreId(storeId);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    const preview = isPreviewRequest(req);
    const filter = { store: storeId };
    if (!preview) filter.visibility = 'visible';
    if (req.query.blogId && mongoose.Types.ObjectId.isValid(String(req.query.blogId))) {
      filter.blog = req.query.blogId;
    }
    const [rows, total] = await Promise.all([
      WebpanelBlogPost.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content')
        .lean(),
      WebpanelBlogPost.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: rows.map((row) => ({
        _id: String(row._id),
        blogId: String(row.blog),
        title: row.title,
        excerpt: row.excerpt || '',
        pageTitle: row.pageTitle || '',
        metaDescription: row.metaDescription || '',
        urlHandle: row.urlHandle,
        visibility: row.visibility || 'hidden',
        author: row.author || '',
        tags: row.tags || [],
        featuredImageUrl: row.featuredImageUrl || '',
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to list posts' });
  }
};

/** GET /api/storefront/:storeId/blog-posts/by-slug/:slug */
const getStorefrontBlogPostBySlug = async (req, res) => {
  try {
    const { storeId, slug } = req.params;
    assertValidStoreId(storeId);
    const handle = normalizeHandle(slug);
    const filter = { store: storeId, urlHandle: handle };
    if (!isPreviewRequest(req)) filter.visibility = 'visible';
    const row = await WebpanelBlogPost.findOne(filter).lean();
    if (!row) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    const blog = await WebpanelBlog.findById(row.blog).lean();
    res.json({
      success: true,
      data: {
        blog: blog
          ? {
              _id: String(blog._id),
              title: blog.title,
              urlHandle: blog.urlHandle,
            }
          : null,
        post: {
          _id: String(row._id),
          blogId: String(row.blog),
          title: row.title,
          content: row.content || '',
          excerpt: row.excerpt || '',
          pageTitle: row.pageTitle || '',
          metaDescription: row.metaDescription || '',
          urlHandle: row.urlHandle,
          visibility: row.visibility,
          author: row.author || '',
          tags: row.tags || [],
          featuredImageUrl: row.featuredImageUrl || '',
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        },
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to load post' });
  }
};

module.exports = {
  listStorefrontBlogs,
  listStorefrontBlogPosts,
  getStorefrontBlogPostBySlug,
};
