import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

const mockRedisClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue(undefined),
  get: jest.fn(),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  keys: jest.fn().mockResolvedValue([]),
  ping: jest.fn().mockResolvedValue('PONG'),
  on: jest.fn(),
};

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockRedisClient),
  };
});

describe('RedisService', () => {
  let service: RedisService;
  let mockConfigService: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfigService = {
      get: jest.fn().mockImplementation((key, defaultValue) => {
        if (key === 'redis.host') return 'localhost';
        if (key === 'redis.port') return 6379;
        if (key === 'redis.ttl') return 60;
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get and parse json value', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockRedisClient.get.mockResolvedValue(JSON.stringify(mockData));

    const result = await service.get('my-key');
    expect(result).toEqual(mockData);
    expect(mockRedisClient.get).toHaveBeenCalledWith('my-key');
  });

  it('should return null on get miss or non-existent key', async () => {
    mockRedisClient.get.mockResolvedValue(null);

    const result = await service.get('non-existent');
    expect(result).toBeNull();
  });

  it('should set serialized JSON with TTL in Redis', async () => {
    mockRedisClient.set.mockResolvedValue('OK');

    await service.set('my-key', { foo: 'bar' }, 120);

    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'my-key',
      JSON.stringify({ foo: 'bar' }),
      'EX',
      120,
    );
  });

  it('should invalidate keys matching wildcard pattern', async () => {
    mockRedisClient.keys.mockResolvedValue(['users:1', 'users:2']);
    mockRedisClient.del.mockResolvedValue(2);

    await service.invalidatePattern('users:*');

    expect(mockRedisClient.keys).toHaveBeenCalledWith('users:*');
    expect(mockRedisClient.del).toHaveBeenCalledWith('users:1', 'users:2');
  });

  it('should return true on ping PONG', async () => {
    mockRedisClient.ping.mockResolvedValue('PONG');
    const isHealthy = await service.ping();
    expect(isHealthy).toBe(true);
  });
});
