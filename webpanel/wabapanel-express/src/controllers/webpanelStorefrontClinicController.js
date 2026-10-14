const WebpanelStore = require('../models/WebpanelStore');
const BookingSettings = require('../models/BookingSettings');
const ClinicDoctor = require('../models/ClinicDoctor');
const User = require('../models/User');

async function getStorefrontClinic(req, res) {
  try {
    const store = await WebpanelStore.findById(req.params.storeId).select('userId workspace industry storeName').lean();
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    let clinicEnabled = false;
    try {
      const owner = await User.findById(store.userId).select('featureOverrides').lean();
      clinicEnabled = owner?.featureOverrides?.clinic === true;
    } catch { /* noop */ }
    if (!clinicEnabled) {
      return res.json({ success: true, data: { enabled: false, doctors: [], bookingSlug: '' } });
    }

    const workspaceId = store.workspace;
    const doctors = workspaceId
      ? await ClinicDoctor.find({ workspace: workspaceId, active: true })
        .select('name specialty qualifications consultationMins room photo bio')
        .sort('name')
        .lean()
      : [];
    let bookingSlug = '';
    if (workspaceId) {
      const s = await BookingSettings.findOne({ workspace: workspaceId }).select('slug enabled').lean();
      if (s?.enabled && s.slug) bookingSlug = s.slug;
    }
    res.json({
      success: true,
      data: {
        enabled: true,
        clinicName: store.storeName || '',
        industry: store.industry || '',
        bookingSlug,
        doctors,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { getStorefrontClinic };
