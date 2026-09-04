const mongoose = require('mongoose');
const WebpanelStoreMenu = require('../models/WebpanelStoreMenu');
const WebpanelStoreMenuItem = require('../models/WebpanelStoreMenuItem');
const WebpanelStorePage = require('../models/WebpanelStorePage');
const WebpanelBlog = require('../models/WebpanelBlog');
const WebpanelBlogPost = require('../models/WebpanelBlogPost');
const WebpanelStore = require('../models/WebpanelStore');
const Form = require('../models/Form');
const { MENU_ITEM_LINK_TYPES } = require('../models/WebpanelStoreMenuItem');
const {
  slugifyMenuHandle,
  menuItemListSummaryLabel,
  resolveStoreMenuItemHref,
} = require('../utils/webpanelStoreMenuLink.util');
const { assertStoreForUser } = require('../utils/webpanelStoreAccess.util');

function serializeMenu(row) {
  return {
    _id: String(row._id),
    storeId: String(row.store),
    menuName: row.menuName,
    handle: row.handle,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function assertMenuForStore(storeId, menuId) {
  if (!mongoose.Types.ObjectId.isValid(menuId)) {
    const err = new Error('Invalid menu id');
    err.statusCode = 400;
    throw err;
  }
  const menu = await WebpanelStoreMenu.findOne({ _id: menuId, store: storeId });
  if (!menu) {
    const err = new Error('Menu not found for this store');
    err.statusCode = 404;
    throw err;
  }
  return menu;
}

async function validateAndNormalizeMenuItems(storeId, items) {
  if (!Array.isArray(items)) {
    const err = new Error('items must be an array');
    err.statusCode = 400;
    throw err;
  }

  const normalized = [];

  for (let index = 0; index < items.length; index++) {
    const row = items[index];
    const label = row?.label?.trim();
    const linkType = row?.linkType;

    if (!label) {
      const err = new Error(`Item at index ${index}: label is required`);
      err.statusCode = 400;
      throw err;
    }
    if (!linkType || !MENU_ITEM_LINK_TYPES.includes(linkType)) {
      const err = new Error(`Item at index ${index}: invalid linkType`);
      err.statusCode = 400;
      throw err;
    }

    const position = typeof row.position === 'number' && row.position >= 0 ? row.position : index;

    if (linkType === 'specific-page') {
      const pageId = row.pageId;
      if (!pageId || !mongoose.Types.ObjectId.isValid(pageId)) {
        const err = new Error(`Item at index ${index}: pageId is required for specific-page`);
        err.statusCode = 400;
        throw err;
      }
      const page = await WebpanelStorePage.findOne({ _id: pageId, store: storeId }).select('_id').lean();
      if (!page) {
        const err = new Error(`Item at index ${index}: page not found for this store`);
        err.statusCode = 400;
        throw err;
      }
      normalized.push({ label, linkType, pageId: new mongoose.Types.ObjectId(pageId), position });
      continue;
    }

    if (linkType === 'specific-blog') {
      const blogId = row.blogId;
      if (!blogId || !mongoose.Types.ObjectId.isValid(blogId)) {
        const err = new Error(`Item at index ${index}: blogId is required for specific-blog`);
        err.statusCode = 400;
        throw err;
      }
      const blog = await WebpanelBlog.findOne({ _id: blogId, store: storeId }).select('_id').lean();
      if (!blog) {
        const err = new Error(`Item at index ${index}: blog not found for this store`);
        err.statusCode = 400;
        throw err;
      }
      normalized.push({ label, linkType, blogId: new mongoose.Types.ObjectId(blogId), position });
      continue;
    }

    if (linkType === 'specific-blog-post') {
      const blogPostId = row.blogPostId;
      if (!blogPostId || !mongoose.Types.ObjectId.isValid(blogPostId)) {
        const err = new Error(`Item at index ${index}: blogPostId is required for specific-blog-post`);
        err.statusCode = 400;
        throw err;
      }
      const post = await WebpanelBlogPost.findOne({ _id: blogPostId, store: storeId }).select('_id').lean();
      if (!post) {
        const err = new Error(`Item at index ${index}: blog post not found for this store`);
        err.statusCode = 400;
        throw err;
      }
      normalized.push({ label, linkType, blogPostId: new mongoose.Types.ObjectId(blogPostId), position });
      continue;
    }

    if (linkType === 'lead-gen-form') {
      const formId = row.formId;
      if (!formId || !mongoose.Types.ObjectId.isValid(formId)) {
        const err = new Error(`Item at index ${index}: formId is required for lead-gen-form`);
        err.statusCode = 400;
        throw err;
      }
      const store = await WebpanelStore.findById(storeId).select('workspace').lean();
      if (!store?.workspace) {
        const err = new Error(`Item at index ${index}: store workspace not found`);
        err.statusCode = 400;
        throw err;
      }
      const form = await Form.findOne({
        _id: formId,
        workspace: store.workspace,
        status: 'active',
      })
        .select('_id')
        .lean();
      if (!form) {
        const err = new Error(`Item at index ${index}: form not found or inactive for this workspace`);
        err.statusCode = 400;
        throw err;
      }
      normalized.push({ label, linkType, formId: new mongoose.Types.ObjectId(formId), position });
      continue;
    }

    if (linkType === 'custom') {
      const link = row.link?.trim();
      if (!link) {
        const err = new Error(`Item at index ${index}: link is required for custom`);
        err.statusCode = 400;
        throw err;
      }
      normalized.push({ label, linkType, link, position });
      continue;
    }

    normalized.push({ label, linkType, position });
  }

  return normalized;
}

async function enrichMenuItemsWithHref(items) {
  const pageIds = items.filter((i) => i.linkType === 'specific-page' && i.pageId).map((i) => i.pageId);
  const blogIds = items.filter((i) => i.linkType === 'specific-blog' && i.blogId).map((i) => i.blogId);
  const blogPostIds = items
    .filter((i) => i.linkType === 'specific-blog-post' && i.blogPostId)
    .map((i) => i.blogPostId);
  const formIds = items.filter((i) => i.linkType === 'lead-gen-form' && i.formId).map((i) => i.formId);

  const [pages, blogs, blogPosts, forms] = await Promise.all([
    pageIds.length
      ? WebpanelStorePage.find({ _id: { $in: pageIds } }).select('_id urlHandle title').lean()
      : [],
    blogIds.length ? WebpanelBlog.find({ _id: { $in: blogIds } }).select('_id urlHandle title').lean() : [],
    blogPostIds.length
      ? WebpanelBlogPost.find({ _id: { $in: blogPostIds } }).select('_id urlHandle title').lean()
      : [],
    formIds.length ? Form.find({ _id: { $in: formIds } }).select('_id name').lean() : [],
  ]);

  const pageById = new Map(pages.map((p) => [String(p._id), p]));
  const blogById = new Map(blogs.map((b) => [String(b._id), b]));
  const blogPostById = new Map(blogPosts.map((p) => [String(p._id), p]));
  const formById = new Map(forms.map((f) => [String(f._id), f]));

  return items.map((item) => {
    const page =
      item.linkType === 'specific-page' && item.pageId ? pageById.get(String(item.pageId)) ?? null : null;
    const blog =
      item.linkType === 'specific-blog' && item.blogId ? blogById.get(String(item.blogId)) ?? null : null;
    const blogPost =
      item.linkType === 'specific-blog-post' && item.blogPostId
        ? blogPostById.get(String(item.blogPostId)) ?? null
        : null;
    const form =
      item.linkType === 'lead-gen-form' && item.formId ? formById.get(String(item.formId)) ?? null : null;

    const href = resolveStoreMenuItemHref({
      linkType: item.linkType,
      link: item.link,
      page,
      blog,
      blogPost,
      form,
      formId: item.formId,
    });

    return {
      _id: String(item._id),
      menuId: String(item.menu),
      label: item.label,
      linkType: item.linkType,
      link: item.link || '',
      pageId: item.pageId ? String(item.pageId) : undefined,
      blogId: item.blogId ? String(item.blogId) : undefined,
      blogPostId: item.blogPostId ? String(item.blogPostId) : undefined,
      formId: item.formId ? String(item.formId) : undefined,
      position: item.position,
      href,
      page: page ? { _id: String(page._id), title: page.title, urlHandle: page.urlHandle } : undefined,
      blog: blog ? { _id: String(blog._id), title: blog.title, urlHandle: blog.urlHandle } : undefined,
      blogPost: blogPost
        ? { _id: String(blogPost._id), title: blogPost.title, urlHandle: blogPost.urlHandle }
        : undefined,
      form: form ? { _id: String(form._id), name: form.name } : undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });
}

async function buildMenuItemsSummary(items) {
  if (!items.length) return '';
  return items
    .sort((a, b) => a.position - b.position)
    .map((item) => menuItemListSummaryLabel(item.linkType, item.label))
    .join(', ');
}

/** GET /api/stores/:storeId/menus */
const listStoreMenus = async (req, res) => {
  try {
    const { storeId } = req.params;
    await assertStoreForUser(req, storeId);
    const menus = await WebpanelStoreMenu.find({ store: storeId }).sort({ updatedAt: -1 }).lean();
    const data = await Promise.all(
      menus.map(async (menu) => {
        const items = await WebpanelStoreMenuItem.find({ menu: menu._id }).sort({ position: 1 }).lean();
        const menuItemsSummary = await buildMenuItemsSummary(items);
        return { ...serializeMenu(menu), menuItemsSummary, itemCount: items.length };
      })
    );
    res.json({ success: true, data, count: data.length });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to list menus' });
  }
};

/** POST /api/stores/:storeId/menus */
const createStoreMenu = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { storeId } = req.params;
    await assertStoreForUser(req, storeId);
    const { menuName, handle: handleRaw, items = [] } = req.body || {};
    if (!menuName?.trim()) {
      return res.status(400).json({ success: false, message: 'menuName is required' });
    }
    const handle = (handleRaw?.trim() || slugifyMenuHandle(menuName)).toLowerCase();
    const existing = await WebpanelStoreMenu.findOne({ store: storeId, handle }).select('_id').lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'A menu with this handle already exists' });
    }
    const normalizedItems = await validateAndNormalizeMenuItems(storeId, items);

    const [menu] = await WebpanelStoreMenu.create(
      [
        {
          store: storeId,
          userId: req.user._id,
          menuName: menuName.trim(),
          handle,
        },
      ],
      { session }
    );

    if (normalizedItems.length) {
      await WebpanelStoreMenuItem.insertMany(
        normalizedItems.map((item) => ({ ...item, menu: menu._id })),
        { session }
      );
    }

    await session.commitTransaction();
    const savedItems = await WebpanelStoreMenuItem.find({ menu: menu._id }).sort({ position: 1 }).lean();
    const enrichedItems = await enrichMenuItemsWithHref(savedItems);
    res.status(201).json({
      success: true,
      data: { menu: serializeMenu(menu), items: enrichedItems },
      message: 'Menu created',
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to create menu' });
  } finally {
    session.endSession();
  }
};

/** GET /api/stores/:storeId/menus/:menuId */
const getStoreMenu = async (req, res) => {
  try {
    const { storeId, menuId } = req.params;
    await assertStoreForUser(req, storeId);
    const menu = await assertMenuForStore(storeId, menuId);
    const items = await WebpanelStoreMenuItem.find({ menu: menu._id }).sort({ position: 1 }).lean();
    const enrichedItems = await enrichMenuItemsWithHref(items);
    res.json({
      success: true,
      data: { menu: serializeMenu(menu), items: enrichedItems },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to get menu' });
  }
};

/** PUT /api/stores/:storeId/menus/:menuId */
const updateStoreMenu = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { storeId, menuId } = req.params;
    await assertStoreForUser(req, storeId);
    const menu = await assertMenuForStore(storeId, menuId);
    const { menuName, handle: handleRaw, items } = req.body || {};

    if (menuName !== undefined) {
      if (!String(menuName).trim()) {
        return res.status(400).json({ success: false, message: 'menuName cannot be empty' });
      }
      menu.menuName = String(menuName).trim();
    }
    if (handleRaw !== undefined || menuName !== undefined) {
      const handle = (handleRaw?.trim() || slugifyMenuHandle(menu.menuName)).toLowerCase();
      const duplicate = await WebpanelStoreMenu.findOne({
        store: storeId,
        handle,
        _id: { $ne: menu._id },
      })
        .select('_id')
        .lean();
      if (duplicate) {
        return res.status(409).json({ success: false, message: 'A menu with this handle already exists' });
      }
      menu.handle = handle;
    }

    await menu.save({ session });

    if (Array.isArray(items)) {
      const normalizedItems = await validateAndNormalizeMenuItems(storeId, items);
      await WebpanelStoreMenuItem.deleteMany({ menu: menu._id }, { session });
      if (normalizedItems.length) {
        await WebpanelStoreMenuItem.insertMany(
          normalizedItems.map((item) => ({ ...item, menu: menu._id })),
          { session }
        );
      }
    }

    await session.commitTransaction();
    const savedItems = await WebpanelStoreMenuItem.find({ menu: menu._id }).sort({ position: 1 }).lean();
    const enrichedItems = await enrichMenuItemsWithHref(savedItems);
    res.json({
      success: true,
      data: { menu: serializeMenu(menu), items: enrichedItems },
      message: 'Menu updated',
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to update menu' });
  } finally {
    session.endSession();
  }
};

/** DELETE /api/stores/:storeId/menus/:menuId */
const deleteStoreMenu = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { storeId, menuId } = req.params;
    await assertStoreForUser(req, storeId);
    const menu = await assertMenuForStore(storeId, menuId);
    await WebpanelStoreMenuItem.deleteMany({ menu: menu._id }, { session });
    await menu.deleteOne({ session });
    await session.commitTransaction();
    res.json({ success: true, deletedId: String(menuId), message: 'Menu deleted' });
  } catch (error) {
    await session.abortTransaction();
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to delete menu' });
  } finally {
    session.endSession();
  }
};

module.exports = {
  listStoreMenus,
  createStoreMenu,
  getStoreMenu,
  updateStoreMenu,
  deleteStoreMenu,
  enrichMenuItemsWithHref,
  serializeMenu,
};
