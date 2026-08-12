import { SetMetadata } from '@nestjs/common';

export const INVALIDATE_CACHE_PATTERNS = 'INVALIDATE_CACHE_PATTERNS';

export const InvalidateCache = (patterns: string[]) =>
  SetMetadata(INVALIDATE_CACHE_PATTERNS, patterns);
