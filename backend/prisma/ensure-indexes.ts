import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';

/**
 * MongoDB treats a missing/null field as a value in a unique index, so a plain
 * `@unique` on an optional field would allow only one user without a phone,
 * one pending payment without a gateway ref, and so on. These are partial
 * unique indexes that only cover documents where the field is actually set.
 * `prisma db push` knows nothing about them, so run this after it
 * (`npm run db:push` does). Idempotent.
 */
const prisma = new PrismaClient();

const partialUnique = (collection: string, field: string) => ({
  collection,
  index: {
    name: `${collection}_${field}_key`,
    key: { [field]: 1 },
    unique: true,
    partialFilterExpression: { [field]: { $type: 'string' } },
  },
});

const objectIdUnique = (collection: string, field: string) => ({
  collection,
  index: {
    name: `${collection}_${field}_key`,
    key: { [field]: 1 },
    unique: true,
    partialFilterExpression: { [field]: { $type: 'objectId' } },
  },
});

const indexes = [
  partialUnique('users', 'email'),
  partialUnique('users', 'phone'),
  partialUnique('payments', 'gatewayRef'),
  objectIdUnique('ad_conversions', 'visitId'),
];

async function main() {
  for (const { collection, index } of indexes) {
    await prisma.$runCommandRaw({
      createIndexes: collection,
      indexes: [index],
    });
    console.log(`ensured ${index.name}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
