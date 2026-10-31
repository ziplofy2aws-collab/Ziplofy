/**
 * Seed / refresh tour & travel packages.
 *   npm run seed:travel-packages
 *   SEED_WORKSPACE=<workspaceId> npm run seed:travel-packages   (single workspace)
 *
 * Seeds every workspace that owns a tour_travel store (or SEED_WORKSPACE),
 * upserting by data.code — safe to re-run; it refreshes seed data in place
 * and never duplicates.
 */
require('./config/loadEnv');
const mongoose = require('mongoose');
const SectorRecord = require('./models/SectorRecord');
const WebpanelStore = require('./models/WebpanelStore');
const Workspace = require('./models/Workspace');
const PACKAGES = require('./seed/travel-packages.data');

const deriveTags = (data) => {
  const derived = [
    data.category, data.destination, data.country, data.region,
    ...(Array.isArray(data.destinations) ? data.destinations : []),
  ].map((v) => String(v || '').trim().replace(/_/g, ' ')).filter(Boolean);
  const manual = Array.isArray(data.tags) ? data.tags : [];
  const seen = new Set();
  return [...manual, ...derived]
    .map((t) => String(t).trim()).filter(Boolean)
    .filter((t) => { const k = t.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 30);
};

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wapto');
  console.log('Connected to MongoDB');

  let workspaceIds = [];
  if (process.env.SEED_WORKSPACE) {
    workspaceIds = [new mongoose.Types.ObjectId(process.env.SEED_WORKSPACE)];
  } else {
    const stores = await WebpanelStore.find({ industry: 'tour_travel' }).select('workspace').lean();
    workspaceIds = [...new Set(stores.map((s) => String(s.workspace)))].map(
      (id) => new mongoose.Types.ObjectId(id)
    );
  }

  if (!workspaceIds.length) {
    console.log('No tour_travel workspaces found — nothing seeded.');
    await mongoose.disconnect();
    return;
  }

  for (const workspaceId of workspaceIds) {
    const ws = await Workspace.findById(workspaceId).select('owner name').lean();
    if (!ws) {
      console.log(`Skipping ${workspaceId} — workspace not found`);
      continue;
    }
    let created = 0;
    let updated = 0;
    for (const pkg of PACKAGES) {
      const data = { ...pkg.data, tags: deriveTags(pkg.data) };
      const price = Number(data.basePrice) || Number(data.adultPrice) || null;
      const doc = {
        workspace: workspaceId,
        industry: 'tour_travel',
        entity: 'packages',
        title: pkg.title,
        status: pkg.status || 'active',
        startsAt: data.departureDate ? new Date(data.departureDate) : null,
        amount: price,
        createdBy: ws.owner || null,
        data,
      };
      const res = await SectorRecord.updateOne(
        { workspace: workspaceId, industry: 'tour_travel', entity: 'packages', 'data.code': data.code },
        { $set: doc },
        { upsert: true }
      );
      if (res.upsertedCount) created += 1;
      else if (res.modifiedCount) updated += 1;
    }
    console.log(`Workspace ${workspaceId} (${ws.name || 'unnamed'}): ${created} created, ${updated} refreshed`);
  }

  await mongoose.disconnect();
  console.log('Done.');
};

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
