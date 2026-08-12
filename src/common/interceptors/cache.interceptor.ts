import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { RedisService } from '../../redis/redis.service';
import { CACHEABLE_OPTIONS, CacheableOptions } from '../decorators/cacheable.decorator';
import { INVALIDATE_CACHE_PATTERNS } from '../decorators/invalidate-cache.decorator';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest<Request>();

    const cacheOptions = this.reflector.get<CacheableOptions>(CACHEABLE_OPTIONS, handler);

    const invalidatePatterns = this.reflector.get<string[]>(INVALIDATE_CACHE_PATTERNS, handler);

    // 1. Handle @Cacheable (Read Caching)
    if (cacheOptions && request.method === 'GET') {
      const resolvedKey = this.resolveKey(cacheOptions.key, request);
      const cachedData = await this.redisService.get(resolvedKey);

      if (cachedData !== null) {
        this.logger.debug(`Cache HIT: ${resolvedKey}`);
        return of(cachedData);
      }

      this.logger.debug(`Cache MISS: ${resolvedKey}`);
      return next.handle().pipe(
        tap(async (responseData) => {
          if (responseData !== undefined && responseData !== null) {
            await this.redisService.set(resolvedKey, responseData, cacheOptions.ttl);
            this.logger.debug(`Cached result for key: ${resolvedKey}`);
          }
        }),
      );
    }

    // 2. Handle @InvalidateCache (Write / Mutation Invalidation)
    return next.handle().pipe(
      tap(async () => {
        if (invalidatePatterns && invalidatePatterns.length > 0) {
          for (const rawPattern of invalidatePatterns) {
            const resolvedPattern = this.resolveKey(rawPattern, request);
            if (resolvedPattern.includes('*')) {
              await this.redisService.invalidatePattern(resolvedPattern);
            } else {
              await this.redisService.del(resolvedPattern);
            }
            this.logger.debug(`Invalidated cache pattern: ${resolvedPattern}`);
          }
        }
      }),
    );
  }

  private resolveKey(template: string, request: Request): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
      if (request.params && request.params[key] !== undefined) {
        return request.params[key];
      }
      if (request.query && request.query[key] !== undefined) {
        return String(request.query[key]);
      }
      if (request.body && request.body[key] !== undefined) {
        return String(request.body[key]);
      }
      return `{${key}}`;
    });
  }
}
