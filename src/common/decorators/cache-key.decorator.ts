import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'custom_cache_key';
export const CACHE_TTL_METADATA = 'custom_cache_ttl';

export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
export const CacheTTL = (ttlSeconds: number) => SetMetadata(CACHE_TTL_METADATA, ttlSeconds);
