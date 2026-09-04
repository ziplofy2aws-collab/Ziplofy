const mongoose = require('mongoose');
const WebpanelStore = require('../models/WebpanelStore');

async function assertStoreForUser(req, storeId) {
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    const err = new Error('Invalid store id');
    err.statusCode = 400;
    throw err;
  }
  const store = await WebpanelStore.findOne({ _id: storeId, userId: req.user._id });
  if (!store) {
    const err = new Error('Store not found');
    err.statusCode = 404;
    throw err;
  }
  return store;
}

module.exports = { assertStoreForUser };
