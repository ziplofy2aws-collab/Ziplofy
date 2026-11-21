require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const PlatformUser = require('./models/PlatformUser');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codiic';

// Seed gateway accounts (the :3010 login). These are verified local users that
// land on the onboarding wizard — service choice + provisioning happen through
// the normal flow so they get a real webpanel workspace via SSO.
const SEED_USERS = [
  { name: 'Admin User', email: 'admin@codiic.com', password: 'admin123456', phone: '9999999999' },
  { name: 'Demo User', email: 'demo@codiic.com', password: 'demo123456', phone: '8888888888' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB:', MONGODB_URI.replace(/\/\/([^:@/]+):([^@/]+)@/, '//$1:***@'));

  for (const u of SEED_USERS) {
    const email = u.email.toLowerCase();
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const existing = await PlatformUser.findOne({ email });
    if (existing) {
      existing.hashedPassword = hashedPassword;
      existing.emailVerified = true;
      existing.provider = 'local';
      await existing.save();
      console.log(`Updated ${email} (password reset, verified)`);
    } else {
      await PlatformUser.create({
        name: u.name,
        email,
        phone: u.phone,
        hashedPassword,
        provider: 'local',
        emailVerified: true,
        onboardingStatus: 'awaiting_choice',
      });
      console.log(`Created ${email} / ${u.password}`);
    }
  }

  await mongoose.disconnect();
  console.log('Seed complete!');
}

seed().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
