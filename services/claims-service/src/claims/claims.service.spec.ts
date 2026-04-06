import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsService } from '../application/services/claims.service';
import { PrismaService } from '../infrastructure/prisma.service';
import { ClaimFactoryProvider } from '../application/factories/claim-factory.provider';

describe('ClaimsService', () => {
  let service: ClaimsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimsService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ClaimFactoryProvider,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ClaimsService>(ClaimsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
