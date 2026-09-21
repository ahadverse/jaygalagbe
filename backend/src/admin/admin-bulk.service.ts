import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AdsService } from '../ads/ads.service.js';
import { AdminAdsService } from './admin-ads.service.js';
import { AdminUsersService } from './admin-users.service.js';
import { AdminReportsService } from './admin-reports.service.js';
import type {
  BulkAdActionDto,
  BulkReportActionDto,
  BulkResult,
  BulkUserActionDto,
} from './dto/bulk-action.dto.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

function describe(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Unknown error';
}

/**
 * Runs a per-row action across a selection, sequentially and best-effort.
 *
 * Sequential on purpose: these calls each read-then-write a row and emit a
 * notification, and a moderator's selection is at most one page. Firing 100
 * concurrent transactions at the pool to save a second is not a trade worth
 * making here.
 */
async function runBatch<T>(
  ids: string[],
  batchId: string,
  run: (id: string) => Promise<T>,
): Promise<BulkResult> {
  const unique = [...new Set(ids)];
  const succeeded: string[] = [];
  const failed: { id: string; reason: string }[] = [];

  for (const id of unique) {
    try {
      await run(id);
      succeeded.push(id);
    } catch (error) {
      failed.push({ id, reason: describe(error) });
    }
  }

  return { batchId, requested: unique.length, succeeded, failed };
}

@Injectable()
export class AdminBulkService {
  constructor(
    private readonly adsService: AdsService,
    private readonly adminAdsService: AdminAdsService,
    private readonly usersService: AdminUsersService,
    private readonly reportsService: AdminReportsService,
  ) {}

  async runAdAction(
    dto: BulkAdActionDto,
    admin: AuthenticatedUser,
  ): Promise<BulkResult> {
    const batchId = randomUUID();

    switch (dto.action) {
      case 'APPROVE':
        return runBatch(dto.ids, batchId, (id) =>
          this.adsService.approve(id, admin.id, batchId),
        );

      case 'REJECT': {
        if (!dto.reasonCode) {
          throw new BadRequestException(
            'A rejection reason is required when rejecting in bulk',
          );
        }
        const { reasonCode, note } = dto;
        return runBatch(dto.ids, batchId, (id) =>
          this.adsService.reject(id, { reasonCode, note }, admin.id, batchId),
        );
      }

      case 'REMOVE':
        return runBatch(dto.ids, batchId, (id) =>
          this.adsService.softDelete(id, admin),
        );

      /* Straight through the single-row delete, so its guards still apply per
       * row: a listing with settled payments is refused and comes back in
       * `failed` while the rest of the selection goes ahead. */
      case 'DELETE':
        return runBatch(dto.ids, batchId, (id) =>
          this.adminAdsService.remove(id, admin, batchId),
        );
    }
  }

  async runUserAction(
    dto: BulkUserActionDto,
    admin: AuthenticatedUser,
  ): Promise<BulkResult> {
    const batchId = randomUUID();

    switch (dto.action) {
      case 'SUSPEND':
        return runBatch(dto.ids, batchId, (id) =>
          this.usersService.suspend(id, admin, batchId),
        );

      case 'UNSUSPEND':
        return runBatch(dto.ids, batchId, (id) =>
          this.usersService.unsuspend(id, admin, batchId),
        );

      /* Per-row guards stand: an account with listings, payments or messages
       * behind it is refused, as is an admin and the caller's own account. */
      case 'DELETE':
        return runBatch(dto.ids, batchId, (id) =>
          this.usersService.remove(id, admin, batchId),
        );
    }
  }

  async runReportAction(
    dto: BulkReportActionDto,
    admin: AuthenticatedUser,
  ): Promise<BulkResult> {
    const batchId = randomUUID();

    if (dto.action === 'DELETE') {
      return runBatch(dto.ids, batchId, (id) =>
        this.reportsService.remove(id, admin, batchId),
      );
    }

    const status = dto.action;
    return runBatch(dto.ids, batchId, (id) =>
      this.reportsService.resolve(id, { status }, admin, batchId),
    );
  }
}
