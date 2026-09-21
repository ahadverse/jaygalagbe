import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AuditAction,
  AuditTargetType,
  type Prisma,
} from '../generated/prisma/client.js';

export interface AuditEntryInput {
  actorId: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Writes one entry. Deliberately swallows its own failures: an audit row that
   * cannot be written must not roll back the moderation decision the admin just
   * made and saw succeed. The failure is logged loudly instead.
   */
  async record(entry: AuditEntryInput): Promise<void> {
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          actorId: entry.actorId,
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId,
          summary: entry.summary,
          metadata: entry.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to record audit entry ${entry.action} on ${entry.targetType}:${entry.targetId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Bulk runs write one row per target, tied together by a shared batch id. */
  async recordMany(entries: AuditEntryInput[]): Promise<void> {
    if (entries.length === 0) return;

    try {
      await this.prisma.adminAuditLog.createMany({
        data: entries.map((entry) => ({
          actorId: entry.actorId,
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId,
          summary: entry.summary,
          metadata: entry.metadata as Prisma.InputJsonValue | undefined,
        })),
      });
    } catch (error) {
      this.logger.error(
        `Failed to record ${entries.length} audit entries`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
