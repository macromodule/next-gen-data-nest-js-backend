# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-12

### Added
- **NestJS 10 Architecture**: Modern modular TypeScript framework setup with strict type checking.
- **Drizzle ORM & PostgreSQL**: Connection pooling, type-safe schema definitions (`users`, `posts`), relations, indexes, and standalone migration runner.
- **Drizzle Studio**: Visual GUI integration for local database management.
- **Redis Multi-Tier Caching**: Global `RedisService` with key-value operations, TTLs, and atomic wildcard pattern invalidations.
- **Declarative Cache Interceptors**: Custom `@Cacheable` and `@InvalidateCache` method decorators.
- **BullMQ Background Queues**: Distributed async job queues powered by Redis with automatic retries and exponential backoff.
- **Mock Seeding Engine**: Instant database seeding script powered by Faker.js (`npm run db:seed`).
- **Generic Pagination**: Reusable `PaginationQueryDto` with search, sorting, and structured `PaginatedResponseDto`.
- **Enterprise Observability**: High-throughput structured JSON logging via `nestjs-pino` with correlation ID tracking.
- **Hardened Security**: Helmet security headers, Gzip compression, payload size limits, and `@nestjs/throttler` rate limiting.
- **Interactive OpenAPI / Swagger**: Auto-generated documentation playground at `/docs`.
- **Devcontainer & Codespaces**: 1-click cloud container development configuration.
- **Continuous Integration**: GitHub Actions CI workflow for linting, testing, and migration verification.
- **Community Standards**: ESLint, Prettier, Husky, lint-staged, GitHub issue & PR templates, and Dependabot.
