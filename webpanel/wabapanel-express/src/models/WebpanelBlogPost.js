const mongoose = require('mongoose');

const VISIBILITY = ['visible', 'hidden'];

const webpanelBlogPostSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebpanelStore',
      required: true,
      index: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebpanelBlog',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    content: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    pageTitle: { type: String, trim: true, maxlength: 70, default: '' },
    metaDescription: { type: String, trim: true, maxlength: 320, default: '' },
    urlHandle: { type: String, required: true, trim: true, lowercase: true },
    visibility: { type: String, enum: VISIBILITY, default: 'hidden' },
    author: { type: String, trim: true, maxlength: 120, default: '' },
    tags: [{ type: String, trim: true }],
    featuredImageUrl: { type: String, trim: true, default: '' },
    featuredImageKey: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
    collection: 'webpanel_blog_posts',
  }
);

webpanelBlogPostSchema.index({ store: 1, urlHandle: 1 }, { unique: true });
webpanelBlogPostSchema.index({ blog: 1, urlHandle: 1 }, { unique: true });
webpanelBlogPostSchema.index({ store: 1, updatedAt: -1 });

module.exports = mongoose.model('WebpanelBlogPost', webpanelBlogPostSchema);
module.exports.VISIBILITY = VISIBILITY;
