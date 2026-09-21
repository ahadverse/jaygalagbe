import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

export interface HealthReport {
  status: 'ok' | 'degraded';
  uptime: number;
  database: 'up' | 'down';
}

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Jayga Lagbe API';
  }

  /**
   * What the platform's health check hits. It touches the database rather than
   * only proving the process is alive, because a server that cannot reach
   * Postgres serves nothing useful and should not be rolled out over a
   * working one.
   */
  async getHealth(): Promise<HealthReport> {
    let database: 'up' | 'down' = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      uptime: Math.round(process.uptime()),
      database,
    };
  }
}
