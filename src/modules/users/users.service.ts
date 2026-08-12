import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq, desc, asc, ilike, count } from 'drizzle-orm';
import { DRIZZLE_DB, DrizzleDb } from '../../database/database.service';
import { users } from '../../database/schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisService } from '../../redis/redis.service';
import { PaginationQueryDto, SortOrder } from '../../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { EmailQueueService } from '../../jobs/email/email.queue';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly USER_CACHE_PREFIX = 'user:';
  private readonly USERS_LIST_CACHE_PREFIX = 'users:page:';

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDb,
    private readonly redisService: RedisService,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check if email is already taken
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, createUserDto.email),
    });

    if (existing) {
      throw new ConflictException(`User with email "${createUserDto.email}" already exists`);
    }

    const newUserData: typeof users.$inferInsert = {
      name: createUserDto.name,
      email: createUserDto.email,
      bio: createUserDto.bio || null,
    };

    const [newUser] = await this.db.insert(users).values(newUserData).returning();

    // 1. Invalidate paginated users cache
    await this.redisService.invalidatePattern(`${this.USERS_LIST_CACHE_PREFIX}*`);

    // 2. Dispatch background welcome email job via BullMQ
    await this.emailQueueService.queueWelcomeEmail({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    this.logger.log(`Created new user with ID: ${newUser.id}`);
    return newUser;
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { page, limit, offset, sortBy, sortOrder, search } = paginationQuery;
    const cacheKey = `${this.USERS_LIST_CACHE_PREFIX}${page}:${limit}:${sortBy}:${sortOrder}:${search || ''}`;

    // 1. Try cache first
    const cached = await this.redisService.get<PaginatedResponseDto<any>>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for ${cacheKey}`);
      return cached;
    }

    // 2. Build where filter for search
    const filter = search ? ilike(users.name, `%${search}%`) : undefined;

    // 3. Count total matching rows
    const [totalCountResult] = await this.db.select({ count: count() }).from(users).where(filter);

    const totalItems = totalCountResult ? Number(totalCountResult.count) : 0;

    // 4. Fetch paginated records
    const sortField = sortBy === 'name' ? users.name : users.createdAt;
    const orderDirection = sortOrder === SortOrder.ASC ? asc(sortField) : desc(sortField);

    const data = await this.db.query.users.findMany({
      where: filter,
      orderBy: [orderDirection],
      limit,
      offset,
      with: {
        posts: true,
      },
    });

    const response = new PaginatedResponseDto(data, totalItems, page, limit);

    // 5. Store in Redis cache for 60 seconds
    await this.redisService.set(cacheKey, response, 60);

    return response;
  }

  async findOne(id: string) {
    const cacheKey = `${this.USER_CACHE_PREFIX}${id}`;

    // Check Redis cache first
    const cachedUser = await this.redisService.get(cacheKey);
    if (cachedUser) {
      this.logger.debug(`Returning user ${id} from Redis cache`);
      return cachedUser;
    }

    // Query Postgres using Drizzle relational queries
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        posts: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Cache the user object for 120 seconds
    await this.redisService.set(cacheKey, user, 120);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Ensure user exists
    await this.findOne(id);

    // If updating email, verify uniqueness
    if (updateUserDto.email) {
      const existing = await this.db.query.users.findFirst({
        where: eq(users.email, updateUserDto.email),
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Email "${updateUserDto.email}" is already in use`);
      }
    }

    const [updatedUser] = await this.db
      .update(users)
      .set(updateUserDto)
      .where(eq(users.id, id))
      .returning();

    // Cache Invalidation
    await this.redisService.del(`${this.USER_CACHE_PREFIX}${id}`);
    await this.redisService.invalidatePattern(`${this.USERS_LIST_CACHE_PREFIX}*`);

    this.logger.log(`Updated user ${id} and invalidated cache`);
    return updatedUser;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.db.delete(users).where(eq(users.id, id));

    // Invalidate Redis cache
    await this.redisService.del(`${this.USER_CACHE_PREFIX}${id}`);
    await this.redisService.invalidatePattern(`${this.USERS_LIST_CACHE_PREFIX}*`);

    this.logger.log(`Deleted user ${id} and invalidated cache`);
    return { success: true, message: `User ${id} successfully deleted` };
  }
}
