const mongoose = require('mongoose');

/**
 * Webpanel Informatic / content-site store.
 * Separate from Codiic `stores` — own collection so flows never collide.
 */
const ALPHANUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateStoreCode() {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
  }
  return code;
}

const webpanelStoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
      index: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    storeDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    /** Applied Informatic catalog theme id (codiic informatic_themes _id as string). */
    appliedTheme: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    storeCode: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    collection: 'webpanel_stores',
  }
);

webpanelStoreSchema.index({ userId: 1, storeName: 1 }, { unique: true });

webpanelStoreSchema.pre('validate', function () {
  if (!this.storeCode) {
    this.storeCode = generateStoreCode();
  }
});

module.exports = mongoose.model('WebpanelStore', webpanelStoreSchema);
