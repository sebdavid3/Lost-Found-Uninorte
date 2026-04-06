import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterAll(() => {
    if (typeof originalDatabaseUrl === 'undefined') {
      delete process.env.DATABASE_URL;
      return;
    }

    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  beforeEach(async () => {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
      process.env.DATABASE_URL =
        'postgresql://admin:password123@localhost:5432/lost_found_uninorte?schema=public';
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
