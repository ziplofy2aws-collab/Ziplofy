const { isValidIndustry } = require('../utils/industries');
const { publicUser, nextWizardPath } = require('../utils/userView');
const { provisionProduct, issueSsoRedirect } = require('../utils/provision');

async function saveService(req, res) {
  try {
    const selectedService = req.body.selectedService;
    if (selectedService !== 'whatsapp_api' && selectedService !== 'website_builder') {
      return res.status(400).json({ success: false, message: 'Select WhatsApp API or Website Builder' });
    }

    const user = req.platformUser;
    if (user.onboardingStatus === 'complete') {
      return res.json({ success: true, user: publicUser(user), nextPath: nextWizardPath(user) });
    }

    user.selectedService = selectedService;
    user.onboardingStatus = 'awaiting_choice';
    await user.save();
    return res.json({ success: true, user: publicUser(user), nextPath: nextWizardPath(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to save service' });
  }
}

async function saveIndustry(req, res) {
  try {
    const user = req.platformUser;
    const industryKind = req.body.industryKind;
    const industry = String(req.body.industry || '').trim();
    if (!isValidIndustry(industryKind, industry)) {
      return res.status(400).json({ success: false, message: 'Choose a valid industry' });
    }

    user.industryKind = industryKind;
    user.industry = industry;
    user.selectedService = 'website_builder';
    user.onboardingStatus = 'awaiting_choice';
    await user.save();
    return res.json({ success: true, user: publicUser(user), nextPath: nextWizardPath(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to save industry' });
  }
}

async function saveBusinessName(req, res) {
  try {
    const businessName = String(req.body.businessName || '').trim();
    if (businessName.length < 2) {
      return res.status(400).json({ success: false, message: 'Business name must be at least 2 characters' });
    }
    const user = req.platformUser;
    user.businessName = businessName.slice(0, 100);
    await user.save();
    return res.json({ success: true, user: publicUser(user), nextPath: nextWizardPath(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to save business name' });
  }
}

async function complete(req, res) {
  try {
    const user = req.platformUser;
    if (req.body.businessName) {
      const businessName = String(req.body.businessName || '').trim();
      if (businessName.length >= 2) user.businessName = businessName.slice(0, 100);
    }

    if (!user.industryKind) {
      return res.status(400).json({ success: false, message: 'Select an industry first' });
    }
    if (!user.businessName) {
      return res.status(400).json({ success: false, message: 'Business name is required' });
    }

    user.selectedService = 'website_builder';

    if (user.onboardingStatus !== 'complete') {
      user.onboardingStatus = 'provisioning';
      await user.save();
      try {
        await provisionProduct(user);
      } catch (err) {
        user.onboardingStatus = 'awaiting_choice';
        await user.save();
        const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
        return res.status(status).json({
          success: false,
          message: err.message || 'Could not launch the product. Try again.',
        });
      }
    }

    const redirect = await issueSsoRedirect(user);
    return res.json({
      success: true,
      user: publicUser(user),
      nextPath: null,
      redirect,
    });
  } catch (err) {
    console.error('[gateway complete]', err);
    return res.status(500).json({ success: false, message: err.message || 'Launch failed' });
  }
}

module.exports = { saveService, saveIndustry, saveBusinessName, complete };
