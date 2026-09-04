const mongoose = require('mongoose');

const MENU_ITEM_LINK_TYPES = [
  'homepage',
  'search',
  'all-blogs',
  'specific-page',
  'specific-blog',
  'specific-blog-post',
  'lead-gen-form',
  'custom',
];

const webpanelStoreMenuItemSchema = new mongoose.Schema(
  {
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WebpanelStoreMenu',
      required: true,
      index: true,
    },
    label: { type: String, required: true, trim: true, maxlength: 200 },
    linkType: {
      type: String,
      enum: MENU_ITEM_LINK_TYPES,
      required: true,
    },
    link: { type: String, trim: true, maxlength: 2000 },
    pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebpanelStorePage' },
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebpanelBlog' },
    blogPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebpanelBlogPost' },
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
    position: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    collection: 'webpanel_store_menu_items',
  }
);

webpanelStoreMenuItemSchema.index({ menu: 1, position: 1 });

module.exports = mongoose.model('WebpanelStoreMenuItem', webpanelStoreMenuItemSchema);
module.exports.MENU_ITEM_LINK_TYPES = MENU_ITEM_LINK_TYPES;
