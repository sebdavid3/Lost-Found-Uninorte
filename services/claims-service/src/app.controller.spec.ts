import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './infrastructure/app.controller';
import { AppService } from './infrastructure/app.service';
import { ServiceDiscoveryService } from './infrastructure/service-discovery/service-discovery.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ServiceDiscoveryService,
          useValue: {
            getAllInstances: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
