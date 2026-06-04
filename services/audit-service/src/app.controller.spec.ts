import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './infrastructure/persistence/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      $queryRaw: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return ok when DB is reachable', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await appController.health();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('audit-service');
      expect(result.timestamp).toBeDefined();
    });

    it('should return degraded when DB query fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await appController.health();

      expect(result.status).toBe('degraded');
      expect(result.service).toBe('audit-service');
    });
  });
});
