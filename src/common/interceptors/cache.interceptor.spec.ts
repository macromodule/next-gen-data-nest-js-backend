import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { HttpCacheInterceptor } from './cache.interceptor';
import { RedisService } from '../../redis/redis.service';
import { CACHEABLE_OPTIONS } from '../decorators/cacheable.decorator';
import { INVALIDATE_CACHE_PATTERNS } from '../decorators/invalidate-cache.decorator';

describe('HttpCacheInterceptor', () => {
  let interceptor: HttpCacheInterceptor;
  let reflector: Reflector;
  let redisService: RedisService;

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    invalidatePattern: jest.fn(),
  };

  beforeEach(() => {
    reflector = new Reflector();
    redisService = mockRedisService as unknown as RedisService;
    interceptor = new HttpCacheInterceptor(reflector, redisService);
    jest.clearAllMocks();
  });

  const createMockContext = (method: string, params = {}, query = {}, body = {}) => {
    return {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method,
          params,
          query,
          body,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should return cached data on Cache HIT without executing handler', async () => {
    const context = createMockContext('GET', { id: '123' });
    const callHandler: CallHandler = { handle: jest.fn() };

    jest.spyOn(reflector, 'get').mockImplementation((key) => {
      if (key === CACHEABLE_OPTIONS) return { key: 'user:{id}', ttl: 60 };
      return undefined;
    });

    mockRedisService.get.mockResolvedValue({ id: '123', name: 'Alice' });

    const result$ = await interceptor.intercept(context, callHandler);
    const result = await result$.toPromise();

    expect(result).toEqual({ id: '123', name: 'Alice' });
    expect(mockRedisService.get).toHaveBeenCalledWith('user:123');
    expect(callHandler.handle).not.toHaveBeenCalled();
  });

  it('should call handler and cache result on Cache MISS', async () => {
    const context = createMockContext('GET', { id: '123' });
    const responseData = { id: '123', name: 'Alice' };
    const callHandler: CallHandler = { handle: jest.fn().mockReturnValue(of(responseData)) };

    jest.spyOn(reflector, 'get').mockImplementation((key) => {
      if (key === CACHEABLE_OPTIONS) return { key: 'user:{id}', ttl: 60 };
      return undefined;
    });

    mockRedisService.get.mockResolvedValue(null);

    const result$ = await interceptor.intercept(context, callHandler);
    const result = await result$.toPromise();

    expect(result).toEqual(responseData);
    expect(mockRedisService.get).toHaveBeenCalledWith('user:123');
    expect(mockRedisService.set).toHaveBeenCalledWith('user:123', responseData, 60);
  });

  it('should invalidate specific key and pattern on mutation', async () => {
    const context = createMockContext('PATCH', { id: '123' });
    const responseData = { id: '123', name: 'Updated' };
    const callHandler: CallHandler = { handle: jest.fn().mockReturnValue(of(responseData)) };

    jest.spyOn(reflector, 'get').mockImplementation((key) => {
      if (key === INVALIDATE_CACHE_PATTERNS) return ['user:{id}', 'users:*'];
      return undefined;
    });

    const result$ = await interceptor.intercept(context, callHandler);
    await result$.toPromise();

    expect(mockRedisService.del).toHaveBeenCalledWith('user:123');
    expect(mockRedisService.invalidatePattern).toHaveBeenCalledWith('users:*');
  });
});
