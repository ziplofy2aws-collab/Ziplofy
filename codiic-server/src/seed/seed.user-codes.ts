import dotenv from 'dotenv';
import { connectDB } from '../config/database.config';
import { User } from '../models/user.model';

dotenv.config();

const ALPHANUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateUserCode(): string {
  let code = '';
  for (let i = 0; i < 8; i += 1) {
    code += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
  }
  return code;
}

export async function backfillUserCodes(): Promise<void> {
  await connectDB();
  console.log('Connected to database');

  const usersWithoutCode = await User.find({
    $or: [{ userCode: { $exists: false } }, { userCode: null }, { userCode: '' }],
  })
    .select('_id name email')
    .lean();

  if (usersWithoutCode.length === 0) {
    console.log('All users already have userCode.');
    return;
  }

  console.log(`Found ${usersWithoutCode.length} users without userCode.`);

  const existingUsers = (await User.find({
    $and: [{ userCode: { $exists: true } }, { userCode: { $ne: null } }, { userCode: { $ne: '' } }],
  })
    .select('userCode')
    .lean()) as Array<{ userCode?: string | null }>;

  const usedCodes = new Set(
    existingUsers.map((u) => u.userCode).filter((c): c is string => Boolean(c))
  );

  let updated = 0;
  for (const u of usersWithoutCode) {
    let code = '';
    let attempts = 0;
    do {
      code = generateUserCode();
      if (!usedCodes.has(code)) break;
      attempts += 1;
    } while (attempts < 20);

    if (!code) {
      console.warn(`Could not generate unique code for user ${u._id}`);
      continue;
    }

    await User.updateOne({ _id: u._id }, { $set: { userCode: code.toUpperCase() } });
    usedCodes.add(code);
    updated += 1;
    console.log(`  ${u.name} (${u._id}) → ${code}`);
  }

  console.log(`\nBackfilled userCode for ${updated} users.`);
}

async function main() {
  try {
    await backfillUserCodes();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error backfilling user codes:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  void main();
}
