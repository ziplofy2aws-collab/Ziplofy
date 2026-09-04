const mongoose = require('mongoose');
const WebpanelBlog = require('../models/WebpanelBlog');
const WebpanelBlogPost = require('../models/WebpanelBlogPost');
const { COMMENTS_MODES } = require('../models/WebpanelBlog');
const { VISIBILITY } = require('../models/WebpanelBlogPost');
const { slugifyHandle } = require('../utils/slug.util');
const { assertStoreForUser } = require('../utils/webpanelStoreAccess.util');

function normalizeUrlHandle(raw, title) {
  const handle = slugifyHandle(raw || title);
  if (!/^[a-z0-9-]+$/.test(handle)) {
    const err = new Error('Valid URL handle is required');
    err.statusCode = 400;
    throw err;
  }
  return handle;
}

function normalizeComments(value) {
  return COMMENTS_MODES.includes(value) ? value : 'disabled';
}

function normalizeVisibility(value) {
  return VISIBILITY.includes(value) ? value : 'hidden';
}

function serializeBlog(row) {
  return {
    _id: String(row._id),
    storeId: String(row.store),
    title: row.title,
    pageTitle: row.pageTitle || '',
    metaDescription: row.metaDescription || '',
    urlHandle: row.urlHandle,
    comments: row.comments || 'disabled',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function serializePost(row, blogTitle) {
  return {
    _id: String(row._id),
    storeId: String(row.store),
    blogId: String(row.blog),
    blogTitle: blogTitle || '',
    title: row.title,
    content: row.content || '',
    excerpt: row.excerpt || '',
    pageTitle: row.pageTitle || '',
    metaDescription: row.metaDescription || '',
    urlHandle: row.urlHandle,
    visibility: row.visibility || 'hidden',
    author: row.author || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    featuredImageUrl: row.featuredImageUrl || '',
    featuredImageKey: row.featuredImageKey || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function assertBlogForStore(storeId, blogId) {
  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    const err = new Error('Invalid blog id');
    err.statusCode = 400;
    throw err;
  }
  const blog = await WebpanelBlog.findOne({ _id: blogId, store: storeId });
  if (!blog) {
    const err = new Error('Blog not found for this store');
    err.statusCode = 404;
    throw err;
  }
  return blog;
}

/** GET /api/stores/:storeId/blogs */
const listStoreBlogs = async (req, res) => {
  try {
    const { storeId } = req.params;
    await assertStoreForUser(req, storeId);
    const rows = await WebpanelBlog.find({ store: storeId }).sort({ updatedAt: -1 }).lean();
    const data = await Promise.all(
      rows.map(async (row) => {
        const postCount = await WebpanelBlogPost.countDocuments({ blog: row._id });
        return { ...serializeBlog(row), postCount };
      })
    );
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to list blogs' });
  }
};

/** POST /api/stores/:storeId/blogs */
const createStoreBlog = async (req, res) => {
  try {
    const { storeId } = req.params;
    await assertStoreForUser(req, storeId);
    const { title, pageTitle, metaDescription, urlHandle, comments } = req.body || {};
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }
    const handle = normalizeUrlHandle(urlHandle, title.trim());
    const existing = await WebpanelBlog.findOne({ store: storeId, urlHandle: handle }).select('_id').lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'A blog with this URL handle already exists' });
    }
    const row = await WebpanelBlog.create({
      store: storeId,
      userId: req.user._id,
      title: title.trim(),
      pageTitle: (pageTitle?.trim() || title.trim()).slice(0, 70),
      metaDescription: typeof metaDescription === 'string' ? metaDescription.trim().slice(0, 320) : '',
      urlHandle: handle,
      comments: normalizeComments(comments),
    });
    res.status(201).json({ success: true, data: serializeBlog(row), message: 'Blog created' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to create blog' });
  }
};

/** GET /api/stores/:storeId/blogs/:blogId */
const getStoreBlog = async (req, res) => {
  try {
    const { storeId, blogId } = req.params;
    await assertStoreForUser(req, storeId);
    const row = await assertBlogForStore(storeId, blogId);
    const postCount = await WebpanelBlogPost.countDocuments({ blog: row._id });
    res.json({ success: true, data: { ...serializeBlog(row.toObject()), postCount } });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to get blog' });
  }
};

/** PUT /api/stores/:storeId/blogs/:blogId */
const updateStoreBlog = async (req, res) => {
  try {
    const { storeId, blogId } = req.params;
    await assertStoreForUser(req, storeId);
    const row = await assertBlogForStore(storeId, blogId);
    const { title, pageTitle, metaDescription, urlHandle, comments } = req.body || {};
    if (title?.trim()) row.title = title.trim();
    if (typeof pageTitle === 'string') row.pageTitle = pageTitle.trim().slice(0, 70);
    if (typeof metaDescription === 'string') row.metaDescription = metaDescription.trim().slice(0, 320);
    if (comments !== undefined) row.comments = normalizeComments(comments);
    if (urlHandle !== undefined || title?.trim()) {
      const handle = normalizeUrlHandle(urlHandle || row.urlHandle, row.title);
      const clash = await WebpanelBlog.findOne({
        store: storeId,
        urlHandle: handle,
        _id: { $ne: row._id },
      })
        .select('_id')
        .lean();
      if (clash) {
        return res.status(409).json({ success: false, message: 'A blog with this URL handle already exists' });
      }
      row.urlHandle = handle;
    }
    await row.save();
    res.json({ success: true, data: serializeBlog(row), message: 'Blog updated' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to update blog' });
  }
};

/** DELETE /api/stores/:storeId/blogs/:blogId */
const deleteStoreBlog = async (req, res) => {
  try {
    const { storeId, blogId } = req.params;
    await assertStoreForUser(req, storeId);
    await assertBlogForStore(storeId, blogId);
    const postCount = await WebpanelBlogPost.countDocuments({ blog: blogId });
    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Remove or reassign blog posts before deleting this blog',
      });
    }
    await WebpanelBlog.deleteOne({ _id: blogId, store: storeId });
    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to delete blog' });
  }
};

/** GET /api/stores/:storeId/blog-posts */
const listStoreBlogPosts = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { blogId } = req.query;
    await assertStoreForUser(req, storeId);
    const filter = { store: storeId };
    if (blogId) {
      await assertBlogForStore(storeId, String(blogId));
      filter.blog = blogId;
    }
    const rows = await WebpanelBlogPost.find(filter).sort({ updatedAt: -1 }).lean();
    const blogIds = [...new Set(rows.map((r) => String(r.blog)))];
    const blogs = await WebpanelBlog.find({ _id: { $in: blogIds } }).select('title').lean();
    const blogTitleById = Object.fromEntries(blogs.map((b) => [String(b._id), b.title]));
    res.json({
      success: true,
      data: rows.map((row) => serializePost(row, blogTitleById[String(row.blog)])),
      count: rows.length,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to list blog posts' });
  }
};

/** POST /api/stores/:storeId/blog-posts */
const createStoreBlogPost = async (req, res) => {
  try {
    const { storeId } = req.params;
    await assertStoreForUser(req, storeId);
    const body = req.body || {};
    const { blogId, title, content, excerpt, pageTitle, metaDescription, urlHandle, visibility, author, tags, featuredImageUrl, featuredImageKey } = body;
    if (!blogId) {
      return res.status(400).json({ success: false, message: 'blogId is required' });
    }
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }
    const blog = await assertBlogForStore(storeId, blogId);
    const handle = normalizeUrlHandle(urlHandle, title.trim());
    const existing = await WebpanelBlogPost.findOne({ store: storeId, urlHandle: handle }).select('_id').lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'A post with this URL handle already exists for this store' });
    }
    const row = await WebpanelBlogPost.create({
      store: storeId,
      blog: blog._id,
      userId: req.user._id,
      title: title.trim(),
      content: typeof content === 'string' ? content : '',
      excerpt: typeof excerpt === 'string' ? excerpt : '',
      pageTitle: (pageTitle?.trim() || title.trim()).slice(0, 70),
      metaDescription: typeof metaDescription === 'string' ? metaDescription.trim().slice(0, 320) : '',
      urlHandle: handle,
      visibility: normalizeVisibility(visibility),
      author: typeof author === 'string' ? author.trim().slice(0, 120) : '',
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [],
      featuredImageUrl: typeof featuredImageUrl === 'string' ? featuredImageUrl.trim() : '',
      featuredImageKey: typeof featuredImageKey === 'string' ? featuredImageKey.trim() : '',
    });
    res.status(201).json({
      success: true,
      data: serializePost(row, blog.title),
      message: 'Blog post created',
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to create blog post' });
  }
};

/** GET /api/stores/:storeId/blog-posts/:postId */
const getStoreBlogPost = async (req, res) => {
  try {
    const { storeId, postId } = req.params;
    await assertStoreForUser(req, storeId);
    const row = await WebpanelBlogPost.findOne({ _id: postId, store: storeId }).lean();
    if (!row) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    const blog = await WebpanelBlog.findById(row.blog).select('title urlHandle').lean();
    res.json({ success: true, data: serializePost(row, blog?.title) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to get blog post' });
  }
};

/** PUT /api/stores/:storeId/blog-posts/:postId */
const updateStoreBlogPost = async (req, res) => {
  try {
    const { storeId, postId } = req.params;
    await assertStoreForUser(req, storeId);
    const row = await WebpanelBlogPost.findOne({ _id: postId, store: storeId });
    if (!row) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    const body = req.body || {};
    if (body.blogId && String(body.blogId) !== String(row.blog)) {
      await assertBlogForStore(storeId, body.blogId);
      row.blog = body.blogId;
    }
    if (body.title?.trim()) row.title = body.title.trim();
    if (typeof body.content === 'string') row.content = body.content;
    if (typeof body.excerpt === 'string') row.excerpt = body.excerpt;
    if (typeof body.pageTitle === 'string') row.pageTitle = body.pageTitle.trim().slice(0, 70);
    if (typeof body.metaDescription === 'string') row.metaDescription = body.metaDescription.trim().slice(0, 320);
    if (body.visibility !== undefined) row.visibility = normalizeVisibility(body.visibility);
    if (typeof body.author === 'string') row.author = body.author.trim().slice(0, 120);
    if (Array.isArray(body.tags)) row.tags = body.tags.map((t) => String(t).trim()).filter(Boolean);
    if (typeof body.featuredImageUrl === 'string') row.featuredImageUrl = body.featuredImageUrl.trim();
    if (typeof body.featuredImageKey === 'string') row.featuredImageKey = body.featuredImageKey.trim();
    if (body.urlHandle !== undefined || body.title?.trim()) {
      const handle = normalizeUrlHandle(body.urlHandle || row.urlHandle, row.title);
      const clash = await WebpanelBlogPost.findOne({
        store: storeId,
        urlHandle: handle,
        _id: { $ne: row._id },
      })
        .select('_id')
        .lean();
      if (clash) {
        return res.status(409).json({ success: false, message: 'A post with this URL handle already exists' });
      }
      row.urlHandle = handle;
    }
    await row.save();
    const blog = await WebpanelBlog.findById(row.blog).select('title').lean();
    res.json({ success: true, data: serializePost(row, blog?.title), message: 'Blog post updated' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to update blog post' });
  }
};

/** DELETE /api/stores/:storeId/blog-posts/:postId */
const deleteStoreBlogPost = async (req, res) => {
  try {
    const { storeId, postId } = req.params;
    await assertStoreForUser(req, storeId);
    const result = await WebpanelBlogPost.deleteOne({ _id: postId, store: storeId });
    if (!result.deletedCount) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to delete blog post' });
  }
};

module.exports = {
  listStoreBlogs,
  createStoreBlog,
  getStoreBlog,
  updateStoreBlog,
  deleteStoreBlog,
  listStoreBlogPosts,
  createStoreBlogPost,
  getStoreBlogPost,
  updateStoreBlogPost,
  deleteStoreBlogPost,
};
