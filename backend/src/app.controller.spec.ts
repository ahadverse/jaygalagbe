import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('AppController', () => {
  let appController: AppController;
  let queryRaw: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    queryRaw = vi.fn().mockResolvedValue([{ '?column?': 1 }]);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PrismaService, useValue: { $queryRaw: queryRaw } },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('names the service', () => {
      expect(appController.getHello()).toBe('Jayga Lagbe API');
    });
  });

  describe('health', () => {
    it('reports ok while the database answers', async () => {
      await expect(appController.getHealth()).resolves.toMatchObject({
        status: 'ok',
        database: 'up',
      });
    });

    /* The check has to stay reachable when Postgres is down — that is the
     * moment its answer matters most. */
    it('reports degraded instead of throwing when the database is down', async () => {
      queryRaw.mockRejectedValue(new Error('connection refused'));

      await expect(appController.getHealth()).resolves.toMatchObject({
        status: 'degraded',
        database: 'down',
      });
    });
  });
});
