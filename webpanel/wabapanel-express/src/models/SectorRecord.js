const mongoose = require('mongoose');

// Generic workspace-scoped record for industry sector workspaces
// (real estate, agency, legal, hospitality, salon, other service).
// Shape of `data` is validated per-entity via utils/industryConfig.
const sectorRecordSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    industry: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    title: { type: String, default: '' },
    status: { type: String, default: '' },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
    linkRefs: { type: mongoose.Schema.Types.Mixed, default: {} }, // { fieldName: SectorRecordId }
    amount: { type: Number, default: null },
    startsAt: { type: Date, default: null }, // primary dated field (visit/hearing/check-in/booking)
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    notes: { type: String, default: '' },
    archived: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

sectorRecordSchema.index({ workspace: 1, industry: 1, entity: 1, archived: 1 });
sectorRecordSchema.index({ workspace: 1, entity: 1, status: 1 });
sectorRecordSchema.index({ workspace: 1, entity: 1, startsAt: 1 });

module.exports = mongoose.model('SectorRecord', sectorRecordSchema);
