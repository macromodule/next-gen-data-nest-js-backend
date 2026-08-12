# 🚀 Next-Gen Data Starter
### Production-Ready NestJS Backend with Drizzle ORM, PostgreSQL, Redis, BullMQ & CI/CD

<div align="center">

[![CI Workflow](https://github.com/your-username/next-gen-data-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/next-gen-data-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.32+-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Background_Jobs-8A2BE2)](https://bullmq.io/)
[![Swagger Docs](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?logo=swagger&logoColor=black)](http://localhost:3000/docs)

<p align="center">
  A state-of-the-art, developer-first Node.js backend starter designed to eliminate boilerplate, optimize query performance with <b>Drizzle ORM</b>, accelerate response times with <b>Redis</b>, manage async tasks with <b>BullMQ</b>, and automate delivery with <b>GitHub Actions</b>.
</p>

[Quickstart](#-30-second-quickstart) • [Architecture](#-architecture--data-flow) • [Docker Guide](#-docker-local-infrastructure) • [Drizzle Workflow](#️-working-with-drizzle-orm) • [Add a Module Guide](#-step-by-step-how-to-add-a-new-domain-module) • [API Documentation](#-interactive-swagger-documentation)

---

</div>

## 📑 Table of Contents

- [🌟 Key Features & Highlights](#-key-features--highlights)
- [📊 Drizzle ORM vs. Prisma: Why We Swapped](#-drizzle-orm-vs-prisma-why-we-swapped)
- [⚡ 30-Second Quickstart](#-30-second-quickstart)
- [🐳 Docker: Local Infrastructure](#-docker-local-infrastructure)
  - [Services Overview](#services-overview)
  - [Common Docker Commands](#common-docker-commands)
  - [Customizing Services](#customizing-services-via-env)
  - [Running the App in Docker](#running-the-full-app-in-docker-production-mode)
- [📦 1-Click Cloud Devcontainer & Codespaces](#-1-click-cloud-devcontainer--codespaces)
- [📐 Architecture & Data Flow](#-architecture--data-flow)
- [📂 Directory Hierarchy](#-directory-hierarchy)
- [🌱 Database Seeding (Faker.js)](#-database-seeding-fakerjs)
- [🛠️ Working with Drizzle ORM](#️-working-with-drizzle-orm)
  - [1. Defining Tables & Relations](#1-defining-tables--relations)
  - [2. Generating Migrations](#2-generating-migrations)
  - [3. Running Migrations](#3-running-migrations)
  - [4. Visualizing with Drizzle Studio](#4-visualizing-with-drizzle-studio)
- [📄 Generic Pagination, Sorting & Filtering](#-generic-pagination-sorting--filtering)
- [⚡ Redis Caching & Invalidation](#-redis-caching--invalidation)
  - [Declarative Decorators (`@Cacheable`, `@InvalidateCache`)](#declarative-caching-decorators)
  - [Programmatic Cache Operations](#programmatic-cache-operations)
- [⏱️ Async Background Job Processing (BullMQ)](#️-async-background-job-processing-bullmq)
- [📊 Structured Observability (Pino) & Security](#-structured-observability-pino--security)
- [🧩 Step-by-Step: How to Add a New Domain Module](#-step-by-step-how-to-add-a-new-domain-module)
- [📖 Interactive Swagger Documentation](#-interactive-swagger-documentation)
- [🚀 CI/CD & Migration Deployment Pipeline](#-cicd--migration-deployment-pipeline)
- [🧪 Testing Suite](#-testing-suite)
- [⚙️ Environment Variables Reference](#️-environment-variables-reference)
- [📜 Available NPM Scripts](#-available-npm-scripts)
- [🤝 Contributing & License](#-contributing--license)

---

## 🌟 Key Features & Highlights

- **⚡ Zero-Overhead Drizzle ORM**: Native SQL query execution with pure TypeScript inference, zero binary engines, and zero cold starts.
- **🚀 Multi-Tier Redis Caching**: Declarative method decorators (`@Cacheable`, `@InvalidateCache`) and atomic wildcard pattern clearing (`user:*`, `users:page:*`).
- **⏱️ Async Task Queues (BullMQ)**: Distributed background worker queues backed by Redis with automated retry mechanisms and exponential backoff.
- **🐳 Docker-First Infrastructure**: One command (`npm run docker:up`) spins up PostgreSQL 16 and Redis 7 with health checks, named volumes, and env-driven configuration.
- **🌱 Instant Mock Database Seeder**: Generates 20 users and 40 relational posts in seconds using `@faker-js/faker`.
- **📄 Standardized Pagination & Search Engine**: Reusable pagination DTOs, full-text ILIKE search, and structured metadata (`totalItems`, `totalPages`, `hasNextPage`).
- **📊 Enterprise Observability**: High-throughput JSON logging via `nestjs-pino` with automatic request correlation ID tracking (`x-correlation-id`).
- **🛡️ Production Hardened**: Pre-configured with Helmet security headers, Gzip compression, CORS with `ALLOWED_ORIGINS`, 10MB payload limit, `@nestjs/throttler` rate limiting, and Zod runtime `.env` schema validation.
- **📚 Interactive OpenAPI 3.0 (Swagger)**: Auto-generated interactive documentation with DTO validation examples at `/docs`. Disabled by default in production.
- **📦 1-Click Devcontainer**: Zero-configuration setup inside VS Code Remote Containers and GitHub Codespaces.
- **🔄 Complete CI/CD Workflows**: Automated linting, testing, build, and remote database migration pipelines via GitHub Actions.

---

## 📊 Drizzle ORM vs. Prisma: Why We Swapped

| Metric / Feature | Traditional ORMs (Prisma / TypeORM) | Drizzle ORM (This Starter) |
| :--- | :--- | :--- |
| **Engine Architecture** | Heavy Rust binary query engine (~40MB+) | Zero binary dependencies (Pure TypeScript) |
| **Serverless Cold Starts**| Slow (1,500ms - 4,000ms engine boot) | Instant (< 50ms native SQL execution) |
| **Type Inference** | Generated client from custom DSL schema | Native TypeScript types directly inferred |
| **Memory Footprint** | High memory allocation per process | Minimal memory overhead |
| **Query Control** | Abstracted queries with N+1 gotchas | Direct SQL builder with complete relational query control |
| **Migration Tooling** | Heavy CLI runtime | Lightweight `drizzle-kit` CLI with visual Studio GUI |

---

## ⚡ 30-Second Quickstart

### Prerequisites
- **Node.js**: v20.x or higher
- **Docker & Docker Compose**: Installed and running (required for PostgreSQL & Redis)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/next-gen-data-starter.git
cd next-gen-data-starter
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
cp .env.example .env
```

### Step 4: Boot Local PostgreSQL 16 & Redis 7
```bash
npm run docker:up
```

### Step 5: Run Migrations & Seed Sample Data
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Step 6: Start Development Server
```bash
npm run start:dev
```

### 🎯 Instant Verification Links:
- 🌐 **API Base Endpoint**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- 📚 **Swagger Documentation**: [http://localhost:3000/docs](http://localhost:3000/docs)
- 💚 **Infrastructure Health Status**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)
- 🗄️ **Drizzle Studio GUI**: Run `npm run db:studio` -> [https://local.drizzle.studio](https://local.drizzle.studio)

---

## 🐳 Docker: Local Infrastructure

This starter uses **Docker Compose** to provision a fully isolated, production-equivalent local infrastructure with a single command. No need to install PostgreSQL or Redis on your machine.

> **⚠️ Required Before Starting the App**: The application **requires Docker containers to be running** before `npm run start:dev`. If you see `ECONNREFUSED` errors on startup, run `npm run docker:up` first.

### Services Overview

The `docker-compose.yml` at the project root defines two services:

| Service | Image | Container Name | Port | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **postgres** | `postgres:16-alpine` | `nextgen-postgres` | `5432` | Primary database for all application data |
| **redis** | `redis:7-alpine` | `nextgen-redis` | `6379` | Caching layer + BullMQ job queue backend |

Both services:
- Restart automatically (`unless-stopped`) if Docker restarts.
- Use named **persistent volumes** (`pgdata`, `redisdata`) to survive container restarts without data loss.
- Have built-in **health checks** that ensure they are fully ready before the app connects.
- Read port and credential configuration from your `.env` file.

```yaml
# docker-compose.yml (abbreviated overview)
services:
  postgres:
    image: postgres:16-alpine
    container_name: nextgen-postgres
    ports:
      - "${DATABASE_PORT:-5432}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: nextgen-redis
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      retries: 5
```

---

### Common Docker Commands

| Command | Description |
| :--- | :--- |
| `npm run docker:up` | Start PostgreSQL & Redis in the background (detached mode) |
| `npm run docker:down` | Stop and remove containers (data is preserved in volumes) |
| `npm run docker:logs` | Stream real-time logs from both containers |
| `docker ps` | View all running containers and their status |
| `docker exec -it nextgen-postgres psql -U postgres -d nextgen_db` | Open a PostgreSQL interactive shell |
| `docker exec -it nextgen-redis redis-cli` | Open a Redis interactive CLI |

**Full lifecycle example:**
```bash
# Boot up infrastructure
npm run docker:up

# Verify both containers are healthy
docker ps

# Tail live logs from both services
npm run docker:logs

# Tear down (data is preserved in named volumes)
npm run docker:down

# Tear down AND delete all stored data (full reset)
docker compose down -v
```

---

### Customizing Services via `.env`

All service ports and credentials are driven by `.env` variables with sensible defaults:

```dotenv
# .env — these values are passed directly to docker-compose.yml
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=nextgen_db

REDIS_PORT=6379
```

To change the PostgreSQL port to `5433` (e.g., to avoid conflicts with a local install), simply update `DATABASE_PORT=5433` in your `.env` and re-run `npm run docker:up`.

---

### Running the Full App in Docker (Production Mode)

To run the **entire stack** (NestJS app + PostgreSQL + Redis) inside Docker for production-like testing:

**Step 1: Add an `app` service to `docker-compose.yml`:**
```yaml
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nextgen-app
    ports:
      - "3000:3000"
    env_file: .env
    environment:
      DATABASE_HOST: postgres
      REDIS_HOST: redis
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
```

**Step 2: Create a production `Dockerfile`:**
```dockerfile
# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

**Step 3: Build and run the full stack:**
```bash
docker compose up --build
```

> **💡 Note:** When running in Docker, use the service names (`postgres`, `redis`) as hostnames rather than `localhost` for `DATABASE_HOST` and `REDIS_HOST`.

---

## 📦 1-Click Cloud Devcontainer & Codespaces

Develop entirely inside a cloud container without installing Node.js, PostgreSQL, or Redis on your machine:

1. Click **Open in GitHub Codespaces** on GitHub, or
2. Open this folder in **VS Code** with the **Remote - Containers** extension and select **Reopen in Container**.
3. All dependencies, databases, Redis instances, Drizzle Studio, and VS Code linters will boot automatically!

---

## 📐 Architecture & Data Flow

```
[ Client Request ] ────> [ Helmet / Compression / CORS / Request-ID ]
                                      │
                                      ▼
                        [ Throttler Guard (Rate Limit) ]
                                      │
                                      ▼
                      [ HttpCacheInterceptor (Redis) ]
                             │               │
                      (Cache HIT)       (Cache MISS)
                             │               │
                             │               ▼
                             │      [ Controller / DTO Validation ]
                             │               │
                             │               ▼
                             │      [ Service Business Logic ]
                             │         │             │
                             │         ▼             ▼
                             │    [Drizzle ORM]   [BullMQ Queue]
                             │         │             │
                             │         ▼             ▼
                             │    [PostgreSQL]    [Redis Worker]
                             │         │
                             ▼         ▼
                      [ TransformInterceptor & Logging (Pino) ]
                                      │
                                      ▼
                             [ Standardized JSON ]
```

---

## 📂 Directory Hierarchy

```
next-gen-data/
├── .devcontainer/                 # 1-Click VS Code & GitHub Codespaces dev configuration
│   ├── devcontainer.json
│   └── docker-compose.devcontainer.yml
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md          # Structured bug report template
│   │   └── feature_request.md     # Feature request template
│   ├── workflows/
│   │   ├── ci.yml                 # Automated lint, typecheck, test, and build CI
│   │   └── db-migrate.yml         # Automated DB migration deployment workflow
│   ├── dependabot.yml             # Automated weekly dependency update PRs
│   └── pull_request_template.md   # PR checklist template
├── src/
│   ├── common/                    # Shared reusable cross-cutting components
│   │   ├── decorators/            # @Cacheable, @InvalidateCache decorators
│   │   ├── dto/                   # Generic PaginationQueryDto, PaginatedResponseDto
│   │   ├── filters/               # Standardized HttpExceptionFilter
│   │   └── interceptors/          # TransformInterceptor, HttpCacheInterceptor
│   ├── config/                    # Type-safe configuration
│   │   ├── configuration.ts       # Typed configuration loader
│   │   └── env.validation.ts      # Strict Zod schema for .env validation
│   ├── database/                  # Drizzle ORM infrastructure
│   │   ├── schema/                # Drizzle schema definitions & relations
│   │   │   ├── index.ts           # Schema barrel export & relational definitions
│   │   │   ├── users.schema.ts    # Users table schema & types
│   │   │   └── posts.schema.ts    # Posts table schema with foreign keys
│   │   ├── migrations/            # Auto-generated SQL migration files
│   │   ├── database.module.ts     # Global NestJS provider for Drizzle client
│   │   ├── database.service.ts    # Connection pool & healthcheck provider
│   │   ├── migrate.ts             # Programmatic migration runner for CI/CD
│   │   └── seed.ts                # Realistic mock data seeder using Faker.js
│   ├── jobs/                      # BullMQ background job queues & workers
│   │   ├── constants.ts           # Centralized queue name & job type constants
│   │   ├── email/                 # Email queue producer & consumer processor
│   │   │   ├── email.queue.ts
│   │   │   └── email.processor.ts
│   │   └── jobs.module.ts         # Global BullMQ configuration
│   ├── redis/                     # Distributed caching layer
│   │   ├── redis.module.ts        # Global Redis provider module
│   │   └── redis.service.ts       # Cache get, set, del, and pattern invalidation
│   ├── modules/                   # Domain business modules
│   │   ├── health/                # System health check (PostgreSQL + Redis)
│   │   │   ├── health.controller.ts
│   │   │   └── health.module.ts
│   │   └── users/                 # Reference CRUD domain module
│   │       ├── dto/               # CreateUserDto, UpdateUserDto, UserResponseDto
│   │       ├── users.controller.ts# REST endpoints with Swagger & pagination
│   │       ├── users.service.ts   # Business logic, Drizzle queries & Redis cache
│   │       └── users.module.ts
│   ├── app.module.ts              # Root NestJS application module
│   └── main.ts                    # Bootstrap: Swagger, Pino, Compression, Helmet, CORS
├── test/                          # E2E integration test suite
├── docker-compose.yml             # Local PostgreSQL 16 + Redis 7 services
├── .eslintrc.js                   # ESLint rules (@typescript-eslint + prettier)
├── .prettierrc                    # Prettier code formatting config
├── nest-cli.json                  # NestJS CLI compiler configuration
├── drizzle.config.ts              # Drizzle Kit CLI configuration
├── package.json                   # Scripts and project dependencies
├── tsconfig.json                  # TypeScript compiler settings with path aliases
├── CHANGELOG.md                   # Version history (Keep a Changelog format)
├── CONTRIBUTING.md                # Open-source contribution guidelines
└── LICENSE                        # MIT License
```

---

## 🌱 Database Seeding (Faker.js)

Populate your database with realistic mock data in 2 seconds:
```bash
npm run db:seed
```

This runs [src/database/seed.ts](src/database/seed.ts) to generate:
- 20 realistic user accounts with bios, emails (unique-guarded), and active flags.
- 40 relational blog posts linked via foreign keys to authors.
- All data is cleared and re-seeded on each run for a clean slate.

Inspect the seeded data visually in your browser with **Drizzle Studio**:
```bash
npm run db:studio
```

---

## 🛠️ Working with Drizzle ORM

### 1. Defining Tables & Relations
Create schema files inside `src/database/schema/`:

```typescript
// src/database/schema/products.schema.ts
import { pgTable, uuid, varchar, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    priceInCents: integer('price_in_cents').notNull(),
    isAvailable: boolean('is_available').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('products_name_idx').on(table.name),
  }),
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
```

Export your new table from `src/database/schema/index.ts`:
```typescript
export * from './users.schema';
export * from './posts.schema';
export * from './products.schema'; // Add your schema export
```

### 2. Generating Migrations
Drizzle Kit detects schema changes and generates optimized SQL migration files:
```bash
npm run db:generate
```

### 3. Running Migrations
Apply all pending migrations to PostgreSQL:
```bash
npm run db:migrate
```

### 4. Visualizing with Drizzle Studio
Launch the visual database manager:
```bash
npm run db:studio
```
Navigate to [https://local.drizzle.studio](https://local.drizzle.studio) to view, search, and edit records.

---

## 📄 Generic Pagination, Sorting & Filtering

Standardized pagination is built into [src/common/dto/pagination.dto.ts](src/common/dto/pagination.dto.ts).

### Example Query Request:
```http
GET /api/v1/users?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=Alice
```

### Standardized Paginated JSON Response:
```json
{
  "statusCode": 200,
  "data": {
    "data": [
      {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "bio": "Senior Backend Engineer",
        "isActive": true,
        "createdAt": "2026-08-12T10:00:00.000Z",
        "posts": []
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "timestamp": "2026-08-12T11:45:00.000Z"
}
```

---

## ⚡ Redis Caching & Invalidation

### Declarative Caching Decorators

Use `@Cacheable` and `@InvalidateCache` for clean, declarative caching:

```typescript
// Automatically caches responses in Redis using dynamic key placeholders
@Get(':id')
@Cacheable({ key: 'user:{id}', ttl: 120 })
findOne(@Param('id') id: string) {
  return this.usersService.findOne(id);
}

// Automatically invalidates exact keys and wildcard patterns on mutation
@Patch(':id')
@InvalidateCache(['user:{id}', 'users:page:*'])
update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
  return this.usersService.update(id, dto);
}
```

### Programmatic Cache Operations
Inject `RedisService` anywhere in your application:
```typescript
// Store data with custom TTL (in seconds)
await this.redisService.set('custom_key', data, 60);

// Retrieve cached data
const cached = await this.redisService.get<Product>('custom_key');

// Invalidate all keys matching a wildcard pattern
await this.redisService.invalidatePattern('users:*');
```

---

## ⏱️ Async Background Job Processing (BullMQ)

Manage long-running tasks in background worker queues powered by Redis.

### 1. Enqueue a Job (Producer):
```typescript
@Injectable()
export class UsersService {
  constructor(private readonly emailQueue: EmailQueueService) {}

  async create(dto: CreateUserDto) {
    const newUser = await this.db.insert(users).values(dto).returning();
    
    // Non-blocking async job dispatch
    await this.emailQueue.queueWelcomeEmail({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return newUser;
  }
}
```

### 2. Process the Job (Consumer Worker):
```typescript
@Processor('email_queue')
export class EmailProcessor extends WorkerHost implements OnModuleDestroy {
  async process(job: Job) {
    // Executes in background worker thread with:
    // - Automatic 3x retries on failure
    // - Exponential backoff (1s, 2s, 4s)
    // - Graceful shutdown via OnModuleDestroy
    console.log(`Delivering email to ${job.data.email}`);
  }

  async onModuleDestroy() {
    await this.worker.close(); // Drain pending jobs before shutdown
  }
}
```

---

## 📊 Structured Observability (Pino) & Security

- **Structured JSON Logging**: Powered by `nestjs-pino` with automatic `x-correlation-id` request tracing for tools like Datadog, Grafana Loki, or AWS CloudWatch.
- **HTTP Compression**: Gzip / Deflate compression via `compression` middleware reduces payload size by up to 70%.
- **Rate Limiting**: `@nestjs/throttler` with Redis backing protects against DDoS and brute-force attacks (100 req / 60s per IP by default).
- **Security Headers**: [Helmet](https://helmetjs.github.io/) is enabled with 15+ secure default HTTP response headers.
- **CORS Hardening**: `ALLOWED_ORIGINS` environment variable controls which origins are permitted. Defaults to `*` in development.
- **Payload Protection**: Global 10MB body size limit prevents memory exhaustion attacks.
- **Swagger Disabled by Default in Production**: `SWAGGER_ENABLED` defaults to `false`. If enabled in production, a startup warning is logged.

---

## 🧩 Step-by-Step: How to Add a New Domain Module

Follow this 5-step blueprint to create a new domain module (e.g. `Articles`):

### Step 1: Define Drizzle Schema
Create `src/database/schema/articles.schema.ts` and re-export in `src/database/schema/index.ts`:
```typescript
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
```

Generate and run the migration:
```bash
npm run db:generate
npm run db:migrate
```

### Step 2: Create DTOs
Create `src/modules/articles/dto/create-article.dto.ts`:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ example: 'Next-Gen Node.js Architecture' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'Article content goes here...' })
  @IsString()
  @IsNotEmpty()
  body: string;
}
```

### Step 3: Create Service
Create `src/modules/articles/articles.service.ts`:
```typescript
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB, DrizzleDb } from '../../database/database.service';
import { articles } from '../../database/schema';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async create(dto: CreateArticleDto) {
    const [article] = await this.db.insert(articles).values(dto).returning();
    return article;
  }

  async findAll() {
    return this.db.select().from(articles);
  }

  async findOne(id: string) {
    const article = await this.db.query.articles.findFirst({
      where: eq(articles.id, id),
    });
    if (!article) throw new NotFoundException(`Article ${id} not found`);
    return article;
  }
}
```

### Step 4: Create Controller
Create `src/modules/articles/articles.controller.ts`:
```typescript
import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Cacheable } from '../../common/decorators/cacheable.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @InvalidateCache(['articles:all'])
  @ApiOperation({ summary: 'Create a new article' })
  create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Get()
  @Cacheable({ key: 'articles:all', ttl: 60 })
  @ApiOperation({ summary: 'Get all articles' })
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  @Cacheable({ key: 'article:{id}', ttl: 120 })
  @ApiOperation({ summary: 'Get article by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.findOne(id);
  }
}
```

### Step 5: Register Module in AppModule
Create `src/modules/articles/articles.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
```

Import `ArticlesModule` in `src/app.module.ts`:
```typescript
@Module({
  imports: [
    // ...
    ArticlesModule,
  ],
})
export class AppModule {}
```

---

## 📖 Interactive Swagger Documentation

OpenAPI 3.0 documentation is auto-generated and available at:
```
http://localhost:3000/docs
```

> **💡 Note**: Swagger is **disabled by default in production** (when `NODE_ENV=production`). Set `SWAGGER_ENABLED=true` in your `.env` to enable it in development.

Features included:
- Full OpenAPI 3.0 interactive UI playground.
- Real-time schema validation models with example payloads.
- Bearer token authentication support.

---

## 🚀 CI/CD & Migration Deployment Pipeline

### 1. Continuous Integration (`.github/workflows/ci.yml`)
Runs automatically on every Pull Request or Push to `main`:
- Boots up ephemeral PostgreSQL & Redis containers in GitHub Actions.
- Runs Prettier and ESLint code quality checks.
- Validates Drizzle schema integrity (`drizzle-kit generate`).
- Executes Jest unit test suites.
- Verifies TypeScript production compilation (`nest build`).

### 2. Database Migration Pipeline (`.github/workflows/db-migrate.yml`)
- Triggers on merges to `main` touching `schema/**` or `migrations/**`.
- Supports manual deployment (`workflow_dispatch`) with environment selection (`staging` or `production`).

### 3. Dependency Security (`.github/dependabot.yml`)
- **Weekly**: Scans npm dependencies for updates and opens automated PRs.
- **Monthly**: Scans GitHub Actions versions for updates.

---

## 🧪 Testing Suite

The project ships with **26 behavioral unit tests** across 5 test suites covering every critical path:

| Test File | What It Covers |
| :--- | :--- |
| `users.service.spec.ts` | Full CRUD lifecycle: create (conflict, success, email dispatch), findAll (cache HIT/MISS), findOne (not found), update (email conflict, cache invalidation), remove |
| `cache.interceptor.spec.ts` | `@Cacheable` cache HIT (bypasses handler), cache MISS (stores result); `@InvalidateCache` pattern purge |
| `http-exception.filter.spec.ts` | 400 validation error arrays, 404 not found, 500 uncaught exceptions |
| `health.controller.spec.ts` | `200 OK` healthy state, `503` on DB failure, `503` on Redis failure |
| `redis.service.spec.ts` | JSON get/set serialization, key deletion, wildcard pattern invalidation, ping health |

```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Generate code coverage report
npm run test:cov

# Run end-to-end (E2E) integration tests
npm run test:e2e
```

---

## ⚙️ Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`) |
| `PORT` | `3000` | HTTP application port |
| `API_PREFIX` | `api/v1` | Global API route prefix |
| `ALLOWED_ORIGINS` | `*` | Comma-separated CORS allowed origins. Use `*` for dev, specific domains for prod |
| `DATABASE_URL` | *(auto-built from parts)* | PostgreSQL connection URI (overrides individual parts if set) |
| `DATABASE_HOST` | `localhost` | PostgreSQL host |
| `DATABASE_PORT` | `5432` | PostgreSQL port |
| `DATABASE_USER` | `postgres` | PostgreSQL username |
| `DATABASE_PASSWORD` | `postgres` | PostgreSQL password |
| `DATABASE_NAME` | `nextgen_db` | PostgreSQL database name |
| `DATABASE_MAX_CONNECTIONS`| `20` | PostgreSQL connection pool size |
| `REDIS_HOST` | `localhost` | Redis host (`redis` when running in Docker) |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | *(empty)* | Redis authentication password |
| `REDIS_TTL` | `60` | Default cache TTL in seconds |
| `THROTTLE_TTL` | `60000` | Rate limiter window in milliseconds |
| `THROTTLE_LIMIT` | `100` | Max requests permitted per window |
| `SWAGGER_ENABLED` | `false` | Enable OpenAPI Swagger UI. **Always `false` in production.** |
| `SWAGGER_PATH` | `docs` | Swagger endpoint path |

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run start:dev` | Starts the NestJS development server with hot-reload |
| `npm run build` | Compiles TypeScript into the `dist/` directory |
| `npm run start:prod` | Runs the compiled production application |
| `npm run db:generate` | Generates SQL migration files from Drizzle schemas |
| `npm run db:migrate` | Applies pending migrations to PostgreSQL |
| `npm run db:seed` | Populates database with mock users & posts via Faker.js |
| `npm run db:studio` | Launches visual Drizzle Studio web manager |
| `npm run db:push` | Directly synchronizes schema changes with database |
| `npm run docker:up` | Starts local PostgreSQL 16 & Redis 7 Docker containers |
| `npm run docker:down` | Stops and removes local Docker containers |
| `npm run docker:logs` | Streams live logs from Docker containers |
| `npm run lint` | Runs ESLint with automated fixes |
| `npm run format` | Formats all files using Prettier |
| `npm test` | Runs the Jest unit test suite |
| `npm run test:e2e` | Runs End-to-End integration tests |
| `npm run test:cov` | Generates test coverage report |

---

## 🤝 Contributing & License

Contributions are always welcome! Check out our [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
