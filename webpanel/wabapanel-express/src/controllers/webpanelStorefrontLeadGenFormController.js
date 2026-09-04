const mongoose = require('mongoose');
const WebpanelStore = require('../models/WebpanelStore');
const Form = require('../models/Form');
const Contact = require('../models/Contact');

async function resolveStoreAndForm(storeId, formId) {
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    return { error: { status: 400, message: 'Invalid store id' } };
  }
  if (!mongoose.Types.ObjectId.isValid(formId)) {
    return { error: { status: 400, message: 'Invalid form id' } };
  }

  const store = await WebpanelStore.findById(storeId).select('_id workspace status storeName').lean();
  if (!store) {
    return { error: { status: 404, message: 'Store not found' } };
  }
  if (store.status === 'suspended') {
    return { error: { status: 403, message: 'Store is suspended' } };
  }

  const form = await Form.findById(formId)
    .select('name description fields status workspace autoCreateContact')
    .lean();
  if (!form || form.status !== 'active') {
    return { error: { status: 404, message: 'Form not found or inactive' } };
  }
  if (String(form.workspace) !== String(store.workspace)) {
    return { error: { status: 404, message: 'Form not found for this store' } };
  }

  return { store, form };
}

/**
 * GET /api/storefront/:storeId/lead-gen-forms/:formId
 */
const getStorefrontLeadGenForm = async (req, res) => {
  try {
    const { storeId, formId } = req.params;
    const resolved = await resolveStoreAndForm(storeId, formId);
    if (resolved.error) {
      return res.status(resolved.error.status).json({
        success: false,
        message: resolved.error.message,
      });
    }

    const { form } = resolved;
    return res.json({
      success: true,
      data: {
        _id: form._id,
        name: form.name,
        description: form.description || '',
        fields: (form.fields || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to load form',
    });
  }
};

/**
 * POST /api/storefront/:storeId/lead-gen-forms/:formId/submit
 */
const submitStorefrontLeadGenForm = async (req, res) => {
  try {
    const { storeId, formId } = req.params;
    const resolved = await resolveStoreAndForm(storeId, formId);
    if (resolved.error) {
      return res.status(resolved.error.status).json({
        success: false,
        message: resolved.error.message,
      });
    }

    const { form } = resolved;
    const submissionData = req.body && typeof req.body === 'object' ? req.body : {};

    const formDoc = await Form.findById(formId);
    if (!formDoc) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    formDoc.submissions.push({ data: submissionData, submittedAt: new Date() });
    formDoc.submissionCount += 1;
    await formDoc.save();

    if (formDoc.autoCreateContact && submissionData.phone) {
      await Contact.findOneAndUpdate(
        { workspace: formDoc.workspace, phone: submissionData.phone },
        {
          workspace: formDoc.workspace,
          name: submissionData.name || '',
          phone: submissionData.phone,
          email: submissionData.email || '',
          source: 'form',
        },
        { upsert: true }
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit form',
    });
  }
};

module.exports = {
  getStorefrontLeadGenForm,
  submitStorefrontLeadGenForm,
};
