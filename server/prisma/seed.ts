import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database: removing all dummy projects, bids, rankings...');

  // Delete all dummy rankings, payments, bids, projects
  await prisma.ranking.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany({
    where: { email: 'founder@rankly.com' }
  });

  // Keep admin user
  const adminPasswordHash = await argon2.hash('Admin@123');
  await prisma.user.upsert({
    where: { email: 'admin@rankly.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@rankly.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  // Keep default BidConfig
  const bidConfig = await prisma.bidConfig.findFirst();
  if (!bidConfig) {
    await prisma.bidConfig.create({
      data: {
        minBid: 199,
        minIncrement: 50,
        currency: 'INR',
        allowSelfBid: false,
        isActive: true,
      },
    });
  }

  console.log('Database cleaned! 0 dummy projects, 0 dummy bids, 0 dummy rankings.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
