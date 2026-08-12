import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';

describe('HealthController', () => {
  let controller: HealthController;
  let mockDbService: any;
  let mockRedisService: any;

  beforeEach(async () => {
    mockDbService = {
      ping: jest.fn(),
    };
    mockRedisService = {
      ping: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return 200 ok when both database and redis are healthy', async () => {
    mockDbService.ping.mockResolvedValue(true);
    mockRedisService.ping.mockResolvedValue(true);

    const res = await controller.check();

    expect(res.status).toBe('ok');
    expect(res.services.database.status).toBe('up');
    expect(res.services.redis.status).toBe('up');
  });

  it('should throw 503 SERVICE_UNAVAILABLE if database ping fails', async () => {
    mockDbService.ping.mockResolvedValue(false);
    mockRedisService.ping.mockResolvedValue(true);

    await expect(controller.check()).rejects.toThrow(HttpException);
  });

  it('should throw 503 SERVICE_UNAVAILABLE if redis ping fails', async () => {
    mockDbService.ping.mockResolvedValue(true);
    mockRedisService.ping.mockResolvedValue(false);

    await expect(controller.check()).rejects.toThrow(HttpException);
  });
});
