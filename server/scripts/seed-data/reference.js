// Reference data needed in every environment. Only inserts what is missing, so re-running never
// overwrites an admin's later edits.
import { config } from '../../src/config.js';
import { hashPassword } from '../../src/auth/password.js';
import { School } from '../../src/models/School.js';
import { Sport } from '../../src/models/Sport.js';
import { User } from '../../src/models/User.js';
import { ADMIN } from './people.js';
import { sports } from './sports.js';

export async function seedReference() {
  for (const sport of sports) await Sport.updateOne({ slug: sport.slug }, { $setOnInsert: sport }, { upsert: true });

  await School.updateOne(
    { isHome: true },
    { $setOnInsert: { name: "St. Andrew's Turi", shortName: "St. Andrew's Turi", isHome: true } },
    { upsert: true },
  );

  const { adminEmail, adminPassword } = config.seed;
  if (!adminEmail || !adminPassword) throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (see .env.example)');
  if (!(await User.exists({ email: adminEmail.toLowerCase() }))) {
    await User.create({
      ...ADMIN,
      email: adminEmail,
      role: 'admin',
      passwordHash: await hashPassword(adminPassword),
      // A real first admin must choose their own password; the dev account doesn't.
      mustChangePassword: config.isProduction,
    });
  }
}
