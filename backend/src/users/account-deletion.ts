import type { Prisma } from '../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';

/**
 * Removes a user and everything that would otherwise block the delete.
 *
 * MongoDB gives Prisma no cascade, so every required relation has to be
 * cleared by hand, children before parents, inside one transaction so a
 * failure half-way leaves the account intact.
 *
 * Payments and boosts on the user's ads are deleted with the ad: both have a
 * required link to a user and an ad that will no longer exist, and a row
 * pointing at nothing breaks every admin list that includes its relations.
 * Optional-relation analytics (impressions, visits) are detached instead, so
 * the traffic numbers survive.
 *
 * Admin audit entries require their actor, and the log is append-only, so an
 * account that has acted as an admin cannot be removed here at all — revoke
 * admin first, and the log keeps pinning it. That also covers the last-admin
 * rule: an admin can never delete themselves out of existence.
 */
export async function deleteUserAndData(
  prisma: Pick<PrismaService, '$transaction'>,
  id: string,
) {
  await prisma.$transaction(async (tx) => {
    const adIds = (
      await tx.ad.findMany({ where: { ownerId: id }, select: { id: true } })
    ).map((ad) => ad.id);

    const conversationIds = (
      await tx.conversation.findMany({
        where: {
          OR: [
            { customerId: id },
            { advertiserId: id },
            { adId: { in: adIds } },
          ],
        },
        select: { id: true },
      })
    ).map((conversation) => conversation.id);

    await tx.message.deleteMany({
      where: {
        OR: [{ conversationId: { in: conversationIds } }, { senderId: id }],
      },
    });
    await tx.conversation.deleteMany({
      where: { id: { in: conversationIds } },
    });

    const onTheirAds: Prisma.AdConversionWhereInput = { adId: { in: adIds } };
    await tx.adConversion.deleteMany({
      where: { OR: [onTheirAds, { userId: id }] },
    });
    await tx.adImpression.deleteMany({ where: { adId: { in: adIds } } });
    await tx.adVisit.deleteMany({ where: { adId: { in: adIds } } });
    await tx.report.deleteMany({
      where: { OR: [{ adId: { in: adIds } }, { reporterId: id }] },
    });
    await tx.boost.deleteMany({ where: { adId: { in: adIds } } });
    await tx.payment.deleteMany({
      where: { OR: [{ adId: { in: adIds } }, { userId: id }] },
    });
    await tx.savedAd.deleteMany({
      where: { OR: [{ userId: id }, { adId: { in: adIds } }] },
    });
    await tx.ad.deleteMany({ where: { ownerId: id } });

    await tx.review.deleteMany({
      where: { OR: [{ advertiserId: id }, { customerId: id }] },
    });

    await tx.adImpression.updateMany({
      where: { viewerId: id },
      data: { viewerId: null },
    });
    await tx.adVisit.updateMany({
      where: { viewerId: id },
      data: { viewerId: null },
    });

    await tx.user.delete({ where: { id } });
  });
}
