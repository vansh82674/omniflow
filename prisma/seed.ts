import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import crypto from 'crypto';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/omniflow';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log('🌱 Seeding database...');
  console.log('   DB URL:', connectionString);

  // We are using SHA-256 for API keys, but NextAuth users might still need standard hashing.
  // Actually, wait, let's just use crypto hash for admin user if they swapped out bcrypt.
  const passwordHash = crypto.createHash('sha256').update('omniflow2026').digest('hex');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@omniflow.dev' },
    update: {
      emailVerified: new Date(),
    },
    create: {
      email: 'admin@omniflow.dev',
      name: 'Enterprise Admin',
      password: passwordHash,
      image: 'https://i.pravatar.cc/150?u=admin',
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Seeded admin user: ${admin.email}`);
  console.log(`   Login: admin@omniflow.dev / omniflow2026`);
  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
