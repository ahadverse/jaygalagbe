import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@jaygalagbe.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@jaygalagbe.com',
      passwordHash,
      isAdmin: true,
      isVerified: true,
    },
  });

  const advertiser = await prisma.user.upsert({
    where: { email: 'advertiser@jaygalagbe.com' },
    update: {},
    create: {
      name: 'Rahim Uddin',
      email: 'advertiser@jaygalagbe.com',
      passwordHash,
      isAdvertiser: true,
      isVerified: true,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@jaygalagbe.com' },
    update: {},
    create: {
      name: 'Karim Hasan',
      email: 'customer@jaygalagbe.com',
      passwordHash,
      isVerified: true,
    },
  });

  await prisma.ad.upsert({
    where: { id: 'seed-ad-land-1' },
    update: {},
    create: {
      id: 'seed-ad-land-1',
      ownerId: advertiser.id,
      sector: 'LAND',
      title: '5 Katha Residential Land in Bashundhara',
      description:
        'Prime residential plot, ready for construction, clear title.',
      price: 8500000,
      locationArea: 'Bashundhara R/A',
      locationDistrict: 'Dhaka',
      photos: [],
      status: 'LIVE',
    },
  });

  await prisma.ad.upsert({
    where: { id: 'seed-ad-house-1' },
    update: {},
    create: {
      id: 'seed-ad-house-1',
      ownerId: advertiser.id,
      sector: 'HOUSE_RENT',
      title: '2 Bedroom Apartment in Uttara',
      description:
        'Family-friendly apartment near main road, gas + water included.',
      price: 25000,
      locationArea: 'Sector 7',
      locationDistrict: 'Uttara',
      photos: [],
      status: 'PENDING',
    },
  });

  console.log({
    admin: admin.email,
    advertiser: advertiser.email,
    customer: customer.email,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
