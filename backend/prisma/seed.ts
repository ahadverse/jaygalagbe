import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  BoostStatus,
  BoostTier,
  PaymentGateway,
  PaymentStatus,
  ReportStatus,
  type Prisma,
} from '../src/generated/prisma/client.js';
import { BOOST_TIER_CONFIG } from '../src/boost/boost-tier.config.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

function photos(...ids: number[]): string[] {
  return ids.map((id) => `https://picsum.photos/id/${id}/800/600`);
}

type SeedAd = {
  id: string;
  title: string;
  description: string;
  price: number;
  locationArea: string;
  locationDistrict: string;
  photos: string[];
  attributes: Prisma.InputJsonValue;
  status: 'LIVE' | 'PENDING' | 'REJECTED' | 'SOLD';
  rejectionReason?: string;
};

const dhakaAreas = [
  'Bashundhara R/A', 'Dhanmondi', 'Gulshan 1', 'Gulshan 2', 'Banani',
  'Uttara Sector 4', 'Uttara Sector 10', 'Mirpur 10', 'Mirpur DOHS',
  'Mohammadpur', 'Badda', 'Rampura', 'Khilgaon', 'Wari', 'Lalmatia',
  'Shyamoli', 'Kalabagan', 'Bosila', 'Savar', 'Purbachal Sector 5',
  'Keraniganj',
];

const otherAreas = [
  { area: 'Agrabad', district: 'Chattogram' },
  { area: 'Halishahar', district: 'Chattogram' },
  { area: 'Nasirabad', district: 'Chattogram' },
  { area: 'Khulshi', district: 'Chattogram' },
  { area: 'Zindabazar', district: 'Sylhet' },
  { area: 'Ambarkhana', district: 'Sylhet' },
  { area: 'Shahjalal Upashahar', district: 'Sylhet' },
  { area: 'Shaheb Bazar', district: 'Rajshahi' },
  { area: 'Uposhohor', district: 'Rajshahi' },
  { area: 'Sonadanga', district: 'Khulna' },
  { area: 'Khulna Sadar', district: 'Khulna' },
  { area: 'Gazipur Bypass', district: 'Gazipur' },
  { area: 'Tongi', district: 'Gazipur' },
];

function locationFor(index: number): { area: string; district: string } {
  if (index % 3 === 2) {
    return otherAreas[index % otherAreas.length];
  }
  return { area: dhakaAreas[index % dhakaAreas.length], district: 'Dhaka' };
}

const photoPool = [
  1015, 1016, 1018, 1019, 1021, 1024, 1033, 1035, 1040, 1041, 1043, 1044,
  1048, 1049, 1050, 1052, 1053, 1057, 1060, 1062, 1069, 1074, 1084, 106, 110,
  119, 129, 133, 146, 152, 160, 164, 177, 180,
];

function photosFor(index: number): string[] {
  const a = photoPool[index % photoPool.length];
  const b = photoPool[(index + 5) % photoPool.length];
  return photos(a, b);
}

const landPropertyTypes = ['Residential', 'Commercial', 'Agricultural'] as const;
const landSizes = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20];

function generateLandAds(count: number, startIndex: number): SeedAd[] {
  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i;
    const { area, district } = locationFor(index);
    const size = landSizes[index % landSizes.length];
    const propertyType = landPropertyTypes[index % landPropertyTypes.length];
    const pricePerKatha =
      propertyType === 'Commercial' ? 2200000 : propertyType === 'Agricultural' ? 350000 : 900000;
    const price = size * pricePerKatha + (index % 7) * 50000;

    return {
      id: `seed-ad-land-gen-${index}`,
      title: `${size} Katha ${propertyType} Land in ${area}`,
      description: `${propertyType} plot in ${area}, ${district} — ${size} katha, ready for registration.`,
      price,
      locationArea: area,
      locationDistrict: district,
      photos: photosFor(index),
      attributes: { sizeKatha: size, propertyType },
      status: 'LIVE',
    };
  });
}

const houseTypes = ['Flat', 'House', 'Room', 'Sublet'] as const;

function generateHouseAds(count: number, startIndex: number): SeedAd[] {
  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i;
    const { area, district } = locationFor(index + 3);
    const bedrooms = (index % 4) + 1;
    const propertyType = houseTypes[index % houseTypes.length];
    const basePrice = propertyType === 'Room' || propertyType === 'Sublet' ? 8000 : 15000;
    const price = basePrice + bedrooms * 9000 + (index % 5) * 1500;
    const furnished = index % 3 === 0;
    const title =
      propertyType === 'Room' || propertyType === 'Sublet'
        ? `${propertyType} in ${area}`
        : `${bedrooms} Bedroom ${propertyType} in ${area}`;

    return {
      id: `seed-ad-house-gen-${index}`,
      title,
      description: `${furnished ? 'Furnished' : 'Unfurnished'} ${propertyType.toLowerCase()} in ${area}, ${district}.`,
      price,
      locationArea: area,
      locationDistrict: district,
      photos: photosFor(index + 11),
      attributes: { bedrooms, bathrooms: Math.max(1, bedrooms - 1), furnished, propertyType },
      status: 'LIVE',
    };
  });
}

const givenNames = [
  'Rahim', 'Karim', 'Shakib', 'Tanvir', 'Nusrat', 'Farhana', 'Imran', 'Sadia',
  'Mehedi', 'Rubel', 'Jannatul', 'Arif', 'Sumaiya', 'Rafiq', 'Nabila',
  'Shahriar', 'Tasnim', 'Mizanur', 'Rehana', 'Asif', 'Maliha', 'Sabbir',
];

const familyNames = [
  'Uddin', 'Hasan', 'Islam', 'Ahmed', 'Chowdhury', 'Rahman', 'Akter',
  'Khan', 'Sarker', 'Bhuiyan', 'Talukder',
];

type SeedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdvertiser: boolean;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: Date;
};

/**
 * A realistic user base: mostly customers, a minority of advertisers, a few
 * suspended/unverified accounts, joined over the past ~2 years — enough rows
 * and variety for the admin table's filters, sorting and paging to matter.
 */
function generateUsers(count: number): SeedUser[] {
  return Array.from({ length: count }, (_, i) => {
    const index = i + 1;
    const given = givenNames[index % givenNames.length];
    const family = familyNames[(index * 3) % familyNames.length];

    return {
      id: `seed-user-${index}`,
      name: `${given} ${family}`,
      email: `${given.toLowerCase()}.${family.toLowerCase()}${index}@example.com`,
      phone: `+8801${String(700000000 + index * 137).slice(0, 9)}`,
      isAdvertiser: index % 4 === 0,
      isVerified: index % 5 !== 0,
      isSuspended: index % 17 === 0,
      createdAt: daysAgo(700 - index * 15),
    };
  });
}

const BOOST_TIERS = [
  BoostTier.THREE_DAY,
  BoostTier.SEVEN_DAY,
  BoostTier.FIFTEEN_DAY,
];
const GATEWAYS = [
  PaymentGateway.BKASH,
  PaymentGateway.NAGAD,
  PaymentGateway.CARD,
];

/**
 * Boost purchases spread across the last ~6 months so the dashboard's revenue
 * chart has a real trend, with a realistic share of failed/pending attempts.
 */
async function seedTransactions(adIds: string[], ownerByAdId: Map<string, string>) {
  for (const [i, adId] of adIds.entries()) {
    const index = i + 1;
    const tier = BOOST_TIERS[index % BOOST_TIERS.length];
    const config = BOOST_TIER_CONFIG[tier];
    const purchasedAt = daysAgo(175 - index * 3);
    const status =
      index % 9 === 0
        ? PaymentStatus.FAILED
        : index % 11 === 0
          ? PaymentStatus.PENDING
          : PaymentStatus.SUCCESS;

    const paymentId = `seed-payment-${index}`;
    const payment = {
      userId: ownerByAdId.get(adId)!,
      adId,
      gateway: GATEWAYS[index % GATEWAYS.length],
      gatewayRef: `JL-${String(100000 + index * 7)}`,
      amount: config.priceBdt,
      status,
      createdAt: purchasedAt,
    };

    await prisma.payment.upsert({
      where: { id: paymentId },
      update: payment,
      create: { id: paymentId, ...payment },
    });

    if (status !== PaymentStatus.SUCCESS) {
      continue;
    }

    const endAt = new Date(purchasedAt.getTime() + config.days * DAY_MS);
    const boost = {
      adId,
      tier,
      paymentId,
      startAt: purchasedAt,
      endAt,
      status: endAt > new Date() ? BoostStatus.ACTIVE : BoostStatus.EXPIRED,
      createdAt: purchasedAt,
    };

    await prisma.boost.upsert({
      where: { id: `seed-boost-${index}` },
      update: boost,
      create: { id: `seed-boost-${index}`, ...boost },
    });
  }
}

const reportReasons = [
  'FAKE_LISTING: Photos are taken from another listing on a different site.',
  'SCAM: Advertiser asked for an advance payment before any viewing.',
  'ALREADY_SOLD: Called the number, the property was rented out weeks ago.',
  'WRONG_INFORMATION: Listed as 3 bedrooms but the flat only has 2.',
  'DUPLICATE: The same property is posted three times by the same person.',
  'OFFENSIVE: The description contains abusive language.',
  'OTHER: Price looks far below market rate — likely bait.',
];

async function seedReports(adIds: string[], reporterIds: string[]) {
  for (const [i, adId] of adIds.entries()) {
    const index = i + 1;
    const reportId = `seed-report-${index}`;
    const report = {
      adId,
      reporterId: reporterIds[index % reporterIds.length],
      reason: reportReasons[index % reportReasons.length],
      status:
        index % 4 === 0
          ? ReportStatus.REVIEWED
          : index % 7 === 0
            ? ReportStatus.DISMISSED
            : ReportStatus.PENDING,
      createdAt: daysAgo(60 - index),
    };

    await prisma.report.upsert({
      where: { id: reportId },
      update: report,
      create: { id: reportId, ...report },
    });
  }
}

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

  const extraUsers = generateUsers(44);
  for (const user of extraUsers) {
    const { id, ...data } = user;
    await prisma.user.upsert({
      where: { id },
      update: data,
      create: { id, passwordHash, ...data },
    });
  }

  const advertiserIds = [
    advertiser.id,
    ...extraUsers.filter((user) => user.isAdvertiser).map((user) => user.id),
  ];
  const customerIds = [
    customer.id,
    ...extraUsers.filter((user) => !user.isAdvertiser).map((user) => user.id),
  ];

  const landAds: SeedAd[] = [
    {
      id: 'seed-ad-land-1',
      title: '5 Katha Residential Land in Bashundhara',
      description:
        'Prime residential plot, ready for construction, clear title.',
      price: 8500000,
      locationArea: 'Bashundhara R/A',
      locationDistrict: 'Dhaka',
      photos: photos(1018, 1015),
      attributes: { sizeKatha: 5, propertyType: 'Residential' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-land-2',
      title: '3 Katha Corner Plot in Bosila',
      description:
        'South-facing corner plot on a paved 20ft road, walking distance to the main bazar.',
      price: 4200000,
      locationArea: 'Bosila',
      locationDistrict: 'Dhaka',
      photos: photos(1016, 1019),
      attributes: { sizeKatha: 3, propertyType: 'Residential' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-land-3',
      title: '10 Katha Commercial Land on Mirpur Road',
      description:
        'High-visibility commercial frontage, ideal for a showroom or office complex.',
      price: 25000000,
      locationArea: 'Mirpur Road',
      locationDistrict: 'Dhaka',
      photos: photos(1021, 1024),
      attributes: { sizeKatha: 10, propertyType: 'Commercial' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-land-4',
      title: '6 Katha Land in Purbachal, Sector 12',
      description:
        'Plot allotment in a planned sector with underground utilities already laid.',
      price: 6000000,
      locationArea: 'Purbachal Sector 12',
      locationDistrict: 'Dhaka',
      photos: photos(1033, 1035),
      attributes: { sizeKatha: 6, propertyType: 'Residential' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-land-5',
      title: '4 Katha Agricultural Land near Gazipur Bypass',
      description:
        'Fertile farmland with an irrigation canal along the eastern border.',
      price: 1800000,
      locationArea: 'Gazipur Bypass',
      locationDistrict: 'Gazipur',
      photos: photos(1041, 1044),
      attributes: { sizeKatha: 4, propertyType: 'Agricultural' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-land-6',
      title: '8 Katha Land in Savar EPZ Area',
      description:
        'Close to Savar EPZ, suitable for warehousing or staff housing development.',
      price: 3500000,
      locationArea: 'Savar EPZ',
      locationDistrict: 'Dhaka',
      photos: photos(1048, 1049),
      attributes: { sizeKatha: 8, propertyType: 'Commercial' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-land-7',
      title: '5 Katha Plot in Halishahar',
      description:
        'Quiet residential plot near Halishahar Housing Estate, ready to build.',
      price: 7200000,
      locationArea: 'Halishahar',
      locationDistrict: 'Chattogram',
      photos: photos(1050, 1052),
      attributes: { sizeKatha: 5, propertyType: 'Residential' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-land-8',
      title: '2 Katha Land in Ambarkhana',
      description:
        'Compact residential plot in a well-established Sylhet neighborhood.',
      price: 2000000,
      locationArea: 'Ambarkhana',
      locationDistrict: 'Sylhet',
      photos: photos(1053, 1057),
      attributes: { sizeKatha: 2, propertyType: 'Residential' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-land-9',
      title: '15 Katha Land in Rajshahi City',
      description:
        'Large plot near the city center, previously used for agriculture.',
      price: 4500000,
      locationArea: 'Rajshahi City',
      locationDistrict: 'Rajshahi',
      photos: photos(1060, 1062),
      attributes: { sizeKatha: 15, propertyType: 'Agricultural' },
      status: 'REJECTED' as const,
      rejectionReason: 'Ownership documents unclear — please resubmit with an updated deed.',
    },
  ];

  const houseAds: SeedAd[] = [
    {
      id: 'seed-ad-house-1',
      title: '2 Bedroom Apartment in Uttara',
      description:
        'Family-friendly apartment near main road, gas + water included.',
      price: 25000,
      locationArea: 'Sector 7',
      locationDistrict: 'Uttara',
      photos: photos(1040, 1043),
      attributes: { bedrooms: 2, bathrooms: 2, furnished: false, propertyType: 'Flat' },
      status: 'PENDING' as const,
    },
    {
      id: 'seed-ad-house-2',
      title: '3 Bedroom Flat in Dhanmondi',
      description:
        'Spacious flat with a balcony overlooking the lake, close to Road 8.',
      price: 45000,
      locationArea: 'Dhanmondi',
      locationDistrict: 'Dhaka',
      photos: photos(1015, 1018),
      attributes: { bedrooms: 3, bathrooms: 2, furnished: false, propertyType: 'Flat' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-house-3',
      title: 'Studio Apartment in Gulshan',
      description:
        'Modern studio in a serviced building, ideal for a single professional.',
      price: 30000,
      locationArea: 'Gulshan 2',
      locationDistrict: 'Dhaka',
      photos: photos(1019, 1016),
      attributes: { bedrooms: 1, bathrooms: 1, furnished: true, propertyType: 'Flat' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-house-4',
      title: '2 Bedroom Flat in Banani',
      description:
        'Bright corner unit on the 4th floor, two minutes from Banani Road 11.',
      price: 38000,
      locationArea: 'Banani',
      locationDistrict: 'Dhaka',
      photos: photos(1024, 1021),
      attributes: { bedrooms: 2, bathrooms: 2, furnished: false, propertyType: 'Flat' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-house-5',
      title: '4 Bedroom House in Bashundhara',
      description:
        'Full-floor house with rooftop access, generator backup, and parking.',
      price: 60000,
      locationArea: 'Bashundhara R/A',
      locationDistrict: 'Dhaka',
      photos: photos(1035, 1033),
      attributes: { bedrooms: 4, bathrooms: 3, furnished: false, propertyType: 'House' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-house-6',
      title: '1 Bedroom Sublet in Mohammadpur',
      description:
        'Furnished room with attached bath, shared kitchen, bills included.',
      price: 12000,
      locationArea: 'Mohammadpur',
      locationDistrict: 'Dhaka',
      photos: photos(1044, 1041),
      attributes: { bedrooms: 1, bathrooms: 1, furnished: true, propertyType: 'Sublet' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-house-7',
      title: '3 Bedroom Flat in Agrabad',
      description:
        'Well-maintained flat close to Agrabad commercial area, ready to move in.',
      price: 28000,
      locationArea: 'Agrabad',
      locationDistrict: 'Chattogram',
      photos: photos(1049, 1048),
      attributes: { bedrooms: 3, bathrooms: 2, furnished: false, propertyType: 'Flat' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-house-8',
      title: '2 Bedroom Flat in Zindabazar',
      description: 'Central location, walking distance to shops and restaurants.',
      price: 18000,
      locationArea: 'Zindabazar',
      locationDistrict: 'Sylhet',
      photos: photos(1052, 1050),
      attributes: { bedrooms: 2, bathrooms: 1, furnished: false, propertyType: 'Flat' },
      status: 'LIVE' as const,
    },
    {
      id: 'seed-ad-house-9',
      title: 'Furnished Studio in Baridhara',
      description: 'Fully furnished studio in a diplomatic-zone-adjacent building.',
      price: 35000,
      locationArea: 'Baridhara',
      locationDistrict: 'Dhaka',
      photos: photos(1057, 1053),
      attributes: { bedrooms: 1, bathrooms: 1, furnished: true, propertyType: 'Flat' },
      status: 'SOLD' as const,
    },
  ];

  const allLandAds = [...landAds, ...generateLandAds(32, 1)];
  const allHouseAds = [...houseAds, ...generateHouseAds(32, 1)];

  // Ads are spread across every advertiser so the admin tables can be grouped,
  // sorted and filtered by owner rather than showing one name on every row.
  const ownerByAdId = new Map<string, string>();
  const upsertAd = async (ad: SeedAd, sector: 'LAND' | 'HOUSE_RENT', i: number) => {
    const { id, ...data } = ad;
    const ownerId = advertiserIds[i % advertiserIds.length];
    ownerByAdId.set(id, ownerId);

    await prisma.ad.upsert({
      where: { id },
      update: { ...data, ownerId },
      create: { id, ownerId, sector, ...data },
    });
  };

  for (const [i, ad] of allLandAds.entries()) {
    await upsertAd(ad, 'LAND', i);
  }

  for (const [i, ad] of allHouseAds.entries()) {
    await upsertAd(ad, 'HOUSE_RENT', i + allLandAds.length);
  }

  const boostableAdIds = [...allLandAds, ...allHouseAds]
    .filter((ad) => ad.status === 'LIVE' || ad.status === 'SOLD')
    .map((ad) => ad.id)
    .filter((_, index) => index % 2 === 0);
  await seedTransactions(boostableAdIds, ownerByAdId);

  const reportableAdIds = [...allLandAds, ...allHouseAds]
    .filter((ad) => ad.status === 'LIVE')
    .map((ad) => ad.id)
    .filter((_, index) => index % 5 === 0);
  await seedReports(reportableAdIds, customerIds);

  console.log({
    admin: admin.email,
    advertiser: advertiser.email,
    customer: customer.email,
    users: extraUsers.length + 3,
    ads: allLandAds.length + allHouseAds.length,
    transactions: boostableAdIds.length,
    reports: reportableAdIds.length,
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
