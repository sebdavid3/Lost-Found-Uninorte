import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsController } from '../infrastructure/controllers/claims.controller';
import { ClaimsService } from '../application/services/claims.service';
import { ClaimsServiceProxy } from '../infrastructure/controllers/claims.service.proxy';
import { PrismaService } from '../infrastructure/prisma.service';

describe('ClaimsController', () => {
  let controller: ClaimsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimsController],
      providers: [
        {
          provide: ClaimsService,
          useValue: {},
        },
        {
          provide: ClaimsServiceProxy,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ClaimsController>(ClaimsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
