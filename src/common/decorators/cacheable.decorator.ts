import { SetMetadata } from '@nestjs/common';

export const CACHEABLE_OPTIONS = 'CACHEABLE_OPTIONS';

export interface CacheableOptions {
  key: string;
  ttl?: number; // In seconds
}

export const Cacheable = (options: CacheableOptions) => SetMetadata(CACHEABLE_OPTIONS, options);
