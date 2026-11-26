/** List service-sector businesses the owner can pick after login. */
const getClientBusinessOptions = async (req, res) => {
  try {
    const { SERVICE_BUSINESS_OPTIONS } = require('../utils/gatewayModules');
    const user = await User.findById(req.user._id).select('featureOverrides role');
    if (!user || user.role === 'agent') {
      return res.status(403).json({ success: false, message: 'Only the workspace owner can choose a business' });
    }
    return res.json({
      success: true,
      data: {
        industry: user.featureOverrides?.industry || '',
        options: SERVICE_BUSINESS_OPTIONS,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Single-replace service industry after login.
 * Swaps the locked sector module and feature flags; keeps other selected modules.
 */
const updateClientIndustry = async (req, res) => {
  try {
    const {
      normalizeSelectedModules,
      featureOverridesForModules,
      publicCatalog,
      INDUSTRY_MODULE,
      SERVICE_INDUSTRY_IDS,
      MODULES,
      SECTOR_MODULE_IDS,
    } = require('../utils/gatewayModules');
    const { getOwnerFeatures } = require('../middleware/featureGate');
    const WebpanelStore = require('../models/WebpanelStore');

    const user = await User.findById(req.user._id);
    if (!user || user.role === 'agent') {
      return res.status(403).json({ success: false, message: 'Only the workspace owner can choose a business' });
    }

    const industry = String(req.body.industry || '').trim();
    if (!SERVICE_INDUSTRY_IDS.has(industry)) {
      return res.status(400).json({
        success: false,
        message: 'Choose a valid service-sector business',
      });
    }

    const prevSelected = Array.isArray(user.featureOverrides?.selectedModules)
      ? user.featureOverrides.selectedModules
      : [];
    // Drop any previous sector modules, then normalize for the new industry
    // (which force-includes the matching locked sector + always-on).
    const withoutSectors = prevSelected.filter((id) => !SECTOR_MODULE_IDS.has(id));
    const selectedModules = normalizeSelectedModules(industry, withoutSectors);
    const profileComplete = Boolean(user.featureOverrides?.profileComplete);

    user.featureOverrides = featureOverridesForModules(selectedModules, industry);
    // Never drop onboarding completion when changing business sector.
    if (profileComplete) user.featureOverrides.profileComplete = true;
    const sectorMod = MODULES.find((m) => m.id === INDUSTRY_MODULE[industry]);
    if (sectorMod) for (const key of sectorMod.keys) user.featureOverrides[key] = true;
    user.markModified('featureOverrides');
    await user.save();

    const store = await WebpanelStore.findOne({ userId: user._id });
    if (store) {
      store.industry = industry;
      store.industryKind = 'service';
      await store.save();
    }

    const features = await getOwnerFeatures(user._id);
    return res.json({
      success: true,
      data: {
        ...publicCatalog(industry, selectedModules),
        features,
        featureOverrides: {
          selectedModules,
          industry,
          profileComplete: Boolean(user.featureOverrides?.profileComplete),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** Onboarding status for manage-profile / workspace gates */
const getOnboardingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'name email phone avatar companyName address gstNumber preferredTimezone preferredLanguage featureOverrides platformUserId role'
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const workspaceCount = await Workspace.countDocuments({
      $or: [{ owner: user._id }, { 'members.user': user._id }],
    });
    let profileComplete = Boolean(user.featureOverrides?.profileComplete);
    // Heal accounts whose profileComplete flag was wiped by older module toggles
    // but who already finished billing + have a workspace.
    if (
      !profileComplete &&
      workspaceCount > 0 &&
      user.companyName &&
      user.preferredTimezone
    ) {
      user.featureOverrides = {
        ...(user.featureOverrides || {}),
        profileComplete: true,
      };
      user.markModified('featureOverrides');
      await user.save();
      profileComplete = true;
    }
    const { resolveLaunchPath } = require('../utils/gatewaySync');
    return res.json({
      success: true,
      data: {
        profileComplete,
        workspaceCount,
        nextPath: resolveLaunchPath(user, workspaceCount),
        profile: {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
          companyName: user.companyName || '',
          gstNumber: user.gstNumber || '',
          address: user.address || '',
          preferredTimezone: user.preferredTimezone || '',
          preferredLanguage: user.preferredLanguage || 'en',
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Save manage-profile steps. Completing regional step marks profileComplete.
 * Body: { step: 'personal'|'billing'|'regional', ...fields }
 */
const saveOnboardingProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role === 'agent') {
      return res.status(403).json({ success: false, message: 'Only the account owner can complete profile setup' });
    }
    const step = String(req.body.step || '').trim();
    if (!['personal', 'billing', 'regional'].includes(step)) {
      return res.status(400).json({ success: false, message: 'Invalid step' });
    }

    if (step === 'personal') {
      const name = String(req.body.name || '').trim();
      const phone = String(req.body.phone || '').trim();
      if (!name) return res.status(400).json({ success: false, message: 'Full name is required' });
      if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });
      user.name = name;
      user.phone = phone;
      if (req.body.avatar !== undefined) user.avatar = String(req.body.avatar || '');
    }

    if (step === 'billing') {
      const companyName = String(req.body.companyName || '').trim();
      const address = String(req.body.address || '').trim();
      if (companyName.length < 2) {
        return res.status(400).json({ success: false, message: 'Business name is required' });
      }
      if (!address) {
        return res.status(400).json({ success: false, message: 'Business address is required' });
      }
      user.companyName = companyName.slice(0, 100);
      user.address = address.slice(0, 1000);
      if (req.body.gstNumber !== undefined) {
        user.gstNumber = String(req.body.gstNumber || '').trim().slice(0, 64);
      }
    }

    if (step === 'regional') {
      const preferredTimezone = String(req.body.preferredTimezone || '').trim();
      const preferredLanguage = String(req.body.preferredLanguage || 'en').trim() || 'en';
      if (!preferredTimezone) {
        return res.status(400).json({ success: false, message: 'Timezone is required' });
      }
      user.preferredTimezone = preferredTimezone;
      user.preferredLanguage = preferredLanguage;
      user.featureOverrides = {
        ...(user.featureOverrides || {}),
        profileComplete: true,
      };
      user.markModified('featureOverrides');
    }

    await user.save();

    const { syncProfileToGateway, resolveLaunchPath } = require('../utils/gatewaySync');
    await syncProfileToGateway({
      platformUserId: user.platformUserId,
      email: user.email,
      name: user.name,
      phone: user.phone,
      businessName: user.companyName,
      billingTaxId: user.gstNumber,
      billingAddress: user.address,
      preferredTimezone: user.preferredTimezone,
      preferredLanguage: user.preferredLanguage,
      profileComplete: Boolean(user.featureOverrides?.profileComplete),
      launchPath: Boolean(user.featureOverrides?.profileComplete)
        ? '/client/workspace'
        : '/client/manage-profile',
    });

    const workspaceCount = await Workspace.countDocuments({
      $or: [{ owner: user._id }, { 'members.user': user._id }],
    });

    return res.json({
      success: true,
      data: {
        profileComplete: Boolean(user.featureOverrides?.profileComplete),
        workspaceCount,
        nextPath: resolveLaunchPath(user, workspaceCount),
        featureOverrides: {
          selectedModules: user.featureOverrides?.selectedModules,
          industry: user.featureOverrides?.industry,
          profileComplete: Boolean(user.featureOverrides?.profileComplete),
        },
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          companyName: user.companyName,
          gstNumber: user.gstNumber,
          address: user.address,
          preferredTimezone: user.preferredTimezone,
          preferredLanguage: user.preferredLanguage,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

