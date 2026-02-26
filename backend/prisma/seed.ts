import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.LEADS_DB_URL } },
});

const marketplaces = ['ML', 'Shopee', 'Magalu', 'TikTok', 'Amazon', 'Shein'];
const segments = ['founder', 'seller', 'heavy-user', 'buyer', 'inactive'];
const statuses = ['active', 'contacted', 'qualified', 'converted', 'archived'];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Seeding leads database...');

  // Clean up previous seed data (safe to re-run)
  await prisma.leadHistory.deleteMany({ where: { metadata: { path: ['source'], equals: 'seed' } } });
  await prisma.leadEnrichment.deleteMany({});
  await prisma.leadScore.deleteMany({});
  await prisma.leadEvent.deleteMany({});
  await prisma.lead.deleteMany({ where: { email: { endsWith: '@email.com' } } });

  // Create admin user — cleanup first to avoid unique constraint conflicts on re-seed
  await prisma.adminUser.deleteMany({
    where: { OR: [{ email: 'admin@guiaseller.com' }, { firebaseUid: 'seed-admin-uid-001' }] },
  });
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@guiaseller.com',
      firebaseUid: 'seed-admin-uid-001',
      firstName: 'Admin',
      lastName: 'GuiaSeller',
      role: 'admin',
      permissions: ['read:leads', 'write:leads', 'delete:leads', 'admin:users', 'view:analytics'],
      isActive: true,
    },
  });
  console.log(`  ✅ Admin user: ${admin.email}`);

  // Seed 50 leads
  const firstNames = ['Ana', 'Carlos', 'Maria', 'João', 'Fernanda', 'Pedro', 'Juliana', 'Lucas', 'Camila', 'Rafael', 'Beatriz', 'Gustavo', 'Larissa', 'Matheus', 'Amanda'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Rodrigues', 'Costa', 'Gomes', 'Martins', 'Ribeiro', 'Carvalho', 'Almeida', 'Lopes'];

  for (let i = 0; i < 50; i++) {
    const firstName = randomPick(firstNames);
    const lastName = randomPick(lastNames);
    const mp = randomPick(marketplaces);
    const score = randomInt(10, 95);

    const lead = await prisma.lead.create({
      data: {
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        firstName,
        lastName,
        phone: `+55119${randomInt(10000000, 99999999)}`,
        purchaseCount: randomInt(0, 50),
        leadScore: score,
        conversionProb: score / 100,
        scoreCalculatedAt: new Date(),
        scoreReason: score > 70 ? 'High engagement + purchase history' : score > 40 ? 'Moderate activity' : 'Low engagement',
        segment: randomPick(segments),
        primaryMarketplace: mp,
        marketplaces: [mp, ...marketplaces.filter(m => m !== mp).slice(0, randomInt(0, 2))],
        status: randomPick(statuses),
        enrichment: {
          create: {
            companyName: randomInt(0, 1) ? `${lastName} Marketplace` : null,
            businessType: randomPick(['individual', 'business', 'enterprise']),
            totalOrderValue: randomInt(100, 50000),
            orderCount: randomInt(0, 100),
            avgOrderValue: randomInt(50, 500),
            lastOrderAt: new Date(Date.now() - randomInt(0, 180) * 24 * 60 * 60 * 1000),
            productCount: randomInt(0, 200),
            avgProductRating: Math.round((3 + Math.random() * 2) * 10) / 10,
            pageViewCount: randomInt(10, 500),
            timeSpentMinutes: randomInt(5, 300),
            lastActiveAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000),
            emailEngagement: randomInt(0, 100),
            clickThroughRate: randomInt(0, 50),
          },
        },
        history: {
          create: {
            eventType: 'created',
            adminUserId: admin.id,
            metadata: { source: 'seed' },
          },
        },
      },
    });

    if ((i + 1) % 10 === 0) console.log(`  📊 ${i + 1}/50 leads created`);
  }

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
