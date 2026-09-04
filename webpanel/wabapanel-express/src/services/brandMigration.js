const {
  containsKkhs,
  normalizeBrandName,
  sanitizeTagline,
  deepReplaceKkhs,
  DEFAULT_BRAND,
} = require('../utils/brand');

async function replaceInStringFields(Model, fields) {
  const filter = { $or: fields.map((f) => ({ [f]: /kkhs|k\s*\.?\s*k\s*\.?\s*h\s*\.?\s*s/i })) };
  const docs = await Model.find(filter);
  let count = 0;
  for (const doc of docs) {
    let changed = false;
    for (const field of fields) {
      if (doc[field] && containsKkhs(doc[field])) {
        doc[field] = deepReplaceKkhs(doc[field]);
        changed = true;
      }
    }
    if (changed) {
      await doc.save();
      count += 1;
    }
  }
  return count;
}

async function migrateKkhsBranding() {
  let total = 0;

  try {
    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.findOne();
    if (settings) {
      let changed = false;
      // Align public landing with Codiic Panel app chrome (emerald).
      if (!settings.siteTheme || settings.siteTheme === 'royal-violet') {
        settings.siteTheme = 'emerald-fresh';
        changed = true;
      }
      const nextName = normalizeBrandName(settings.appName, settings.appName);
      if (nextName !== settings.appName) {
        settings.appName = nextName === settings.appName ? DEFAULT_BRAND : nextName;
        if (/kkhs|wabapanel|waba\s*panel|wapto/i.test(String(settings.appName))) settings.appName = DEFAULT_BRAND;
        changed = true;
      }
      if (settings.appName && /kkhs/i.test(settings.appName)) {
        settings.appName = DEFAULT_BRAND;
        changed = true;
      }
      if (settings.tagline && containsKkhs(settings.tagline)) {
        settings.tagline = sanitizeTagline(settings.tagline);
        changed = true;
      }
      if (settings.appDescription && containsKkhs(settings.appDescription)) {
        settings.appDescription = deepReplaceKkhs(settings.appDescription);
        changed = true;
      }
      const json = JSON.stringify(settings.toObject());
      if (/kkhs/i.test(json)) {
        const plain = settings.toObject();
        const cleaned = deepReplaceKkhs(plain);
        Object.assign(settings, cleaned);
        settings.markModified('emailTemplates');
        changed = true;
      }
      if (changed) {
        await settings.save();
        total += 1;
        console.log('[BrandMigration] SystemSettings updated');
      }
    }
  } catch (e) {
    console.error('[BrandMigration] SystemSettings failed:', e.message);
  }

  try {
    const SiteContent = require('../models/SiteContent');
    const doc = await SiteContent.findOne();
    if (doc && doc.content && containsKkhs(JSON.stringify(doc.content))) {
      doc.content = deepReplaceKkhs(doc.content);
      doc.markModified('content');
      await doc.save();
      total += 1;
      console.log('[BrandMigration] SiteContent updated');
    }
  } catch (e) {
    console.error('[BrandMigration] SiteContent failed:', e.message);
  }

  try {
    const LandingPage = require('../models/LandingPage');
    const pages = await LandingPage.find({ $text: { $search: 'kkhs' } }).catch(() => LandingPage.find());
    for (const page of pages) {
      const json = JSON.stringify(page.toObject());
      if (!/kkhs/i.test(json)) continue;
      const cleaned = deepReplaceKkhs(page.toObject());
      Object.assign(page, cleaned);
      page.markModified('hero');
      page.markModified('features');
      page.markModified('faq');
      page.markModified('footer');
      page.markModified('contact');
      await page.save();
      total += 1;
    }
    if (total) console.log('[BrandMigration] LandingPage records checked');
  } catch (e) {
    // Fallback: scan all landing pages
    try {
      const LandingPage = require('../models/LandingPage');
      for (const page of await LandingPage.find()) {
        if (!/kkhs/i.test(JSON.stringify(page.toObject()))) continue;
        Object.assign(page, deepReplaceKkhs(page.toObject()));
        await page.save();
        total += 1;
      }
    } catch (e2) {
      console.error('[BrandMigration] LandingPage failed:', e2.message);
    }
  }

  try {
    const BlogPost = require('../models/BlogPost');
    total += await replaceInStringFields(BlogPost, ['title', 'excerpt', 'content', 'metaTitle', 'metaDescription']);
  } catch (e) {
    console.error('[BrandMigration] BlogPost failed:', e.message);
  }

  try {
    const Page = require('../models/Page');
    total += await replaceInStringFields(Page, ['title', 'content', 'metaTitle', 'metaDescription']);
  } catch (e) {
    console.error('[BrandMigration] Page failed:', e.message);
  }

  try {
    const KnowledgeBase = require('../models/KnowledgeBase');
    total += await replaceInStringFields(KnowledgeBase, ['title', 'content', 'metaTitle', 'metaDescription']);
  } catch (e) {
    console.error('[BrandMigration] KnowledgeBase failed:', e.message);
  }

  if (total > 0) console.log(`[BrandMigration] Done — ${total} document(s) updated`);
}

module.exports = { migrateKkhsBranding };
