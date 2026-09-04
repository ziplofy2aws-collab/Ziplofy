const mongoose = require('mongoose');
const WebpanelStore = require('../models/WebpanelStore');
const WebpanelStoreContactSubmission = require('../models/WebpanelStoreContactSubmission');
const { resolveStoreInformaticThemeRuntime } = require('../utils/webpanelInformaticThemeRuntime.util');
const { sendInformaticThemeContactEmail } = require('../utils/informaticThemeEmail.util');

function trimSubmission(body) {
  return {
    name: typeof body.name === 'string' ? body.name.trim() : '',
    email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
    phone: typeof body.phone === 'string' ? body.phone.trim() : '',
    message: typeof body.message === 'string' ? body.message.trim() : '',
  };
}

/**
 * Public storefront contact form — saves submission and emails store owner via theme SMTP.
 * POST /api/storefront/:storeId/contact-form-submissions
 */
const createStorefrontContactSubmission = async (req, res) => {
  try {
    const { storeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid store id' });
    }

    const { name, email, phone, message } = trimSubmission(req.body || {});
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const store = await WebpanelStore.findById(storeId).lean();
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    if (store.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Store is suspended' });
    }

    const appliedThemeId = store.appliedTheme ? String(store.appliedTheme) : '';
    const runtime = appliedThemeId
      ? await resolveStoreInformaticThemeRuntime(storeId, appliedThemeId)
      : null;
    const themeConfig = runtime?.themeConfig || null;

    const submission = await WebpanelStoreContactSubmission.create({
      store: storeId,
      name,
      email,
      phone: phone || undefined,
      message,
      status: 'pending',
      emailSent: false,
    });

    let emailResult = { sent: false, reason: 'No theme config' };
    if (themeConfig) {
      emailResult = await sendInformaticThemeContactEmail(themeConfig, {
        to: themeConfig?.settings?.contact?.email,
        submission: { name, email, phone, message },
        storeName: store.storeName || 'Store',
      });
      if (emailResult.sent) {
        submission.emailSent = true;
        await submission.save();
      }
    }

    return res.status(201).json({
      success: true,
      message: emailResult.sent
        ? 'Message sent successfully'
        : 'Message received — email notification could not be sent. Check SMTP settings in Theme settings.',
      data: {
        _id: submission._id,
        name: submission.name,
        status: submission.status,
        createdAt: submission.createdAt,
        emailSent: submission.emailSent,
        emailNotice: emailResult.reason || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit contact form',
    });
  }
};

module.exports = {
  createStorefrontContactSubmission,
};
