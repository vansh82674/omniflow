import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const dbUrl = 'file:' + process.cwd().split('\\').join('/') + '/prisma/dev.db';
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log('🌱 Seeding database...');
  console.log('   DB URL:', dbUrl);

  const passwordHash = await bcrypt.hash('omniflow2026', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@omniflow.dev' },
    update: {},
    create: {
      email: 'admin@omniflow.dev',
      name: 'Enterprise Admin',
      password: passwordHash,
      image: 'https://i.pravatar.cc/150?u=admin',
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
  });
