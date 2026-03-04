import { PrismaService } from './prisma.service';

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({ type: 'adapter' })),
}));

jest.mock('@prisma/client', () => {
  class MockPrismaClient {
    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);
    constructor(_opts?: any) {}
  }
  return { PrismaClient: MockPrismaClient };
});

describe('PrismaService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://test:test@localhost:5432/testdb',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should be defined when DATABASE_URL is set', () => {
    const service = new PrismaService();
    expect(service).toBeDefined();
  });

  it('should throw if DATABASE_URL is not set', () => {
    delete process.env.DATABASE_URL;
    expect(() => new PrismaService()).toThrow('DATABASE_URL is not defined');
  });

  it('should call $connect on onModuleInit', async () => {
    const service = new PrismaService();
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalledTimes(1);
  });

  it('should call $disconnect on onModuleDestroy', async () => {
    const service = new PrismaService();
    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalledTimes(1);
  });
});