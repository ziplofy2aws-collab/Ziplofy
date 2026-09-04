const mongoose = require('mongoose');

const COMMENTS_MODES = ['disabled', 'moderated', 'allowed'];

const webpanelBlogSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebpanelStore',
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
    pageTitle: { type: String, trim: true, maxlength: 70, default: '' },
    metaDescription: { type: String, trim: true, maxlength: 320, default: '' },
    urlHandle: { type: String, required: true, trim: true, lowercase: true },
    comments: {
      type: String,
      enum: COMMENTS_MODES,
      default: 'disabled',
    },
  },
  {
    timestamps: true,
    collection: 'webpanel_blogs',
  }
);

webpanelBlogSchema.index({ store: 1, urlHandle: 1 }, { unique: true });

module.exports = mongoose.model('WebpanelBlog', webpanelBlogSchema);
module.exports.COMMENTS_MODES = COMMENTS_MODES;
