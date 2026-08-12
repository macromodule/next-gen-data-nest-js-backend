import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { DRIZZLE_DB } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';
import { EmailQueueService } from '../../jobs/email/email.queue';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto, SortOrder } from '../../common/dto/pagination.dto';

describe('UsersService', () => {
  let service: UsersService;
  let mockDb: any;
  let mockRedis: any;
  let mockEmailQueue: any;

  const mockUser = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    bio: 'Software Engineer',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    posts: [],
  };

  beforeEach(async () => {
    mockDb = {
      query: {
        users: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ count: 1 }]),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockUser]),
        }),
      }),
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ ...mockUser, name: 'Alice Updated' }]),
          }),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(true),
      }),
    };

    mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      invalidatePattern: jest.fn().mockResolvedValue(undefined),
    };

    mockEmailQueue = {
      queueWelcomeEmail: jest.fn().mockResolvedValue({ id: 'job-123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DRIZZLE_DB,
          useValue: mockDb,
        },
        {
          provide: RedisService,
          useValue: mockRedis,
        },
        {
          provide: EmailQueueService,
          useValue: mockEmailQueue,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      bio: 'Software Engineer',
    };

    it('should successfully create a user, invalidate cache, and queue welcome email', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);

      const result = await service.create(dto);

      expect(result).toEqual(mockUser);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockRedis.invalidatePattern).toHaveBeenCalledWith('users:page:*');
      expect(mockEmailQueue.queueWelcomeEmail).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockEmailQueue.queueWelcomeEmail).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const query: PaginationQueryDto = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: SortOrder.DESC,
      offset: 0,
    };

    it('should return cached response on cache HIT', async () => {
      const cachedPayload = { data: [mockUser], meta: { totalItems: 1, page: 1, limit: 10 } };
      mockRedis.get.mockResolvedValue(cachedPayload);

      const result = await service.findAll(query);

      expect(result).toEqual(cachedPayload);
      expect(mockDb.query.users.findMany).not.toHaveBeenCalled();
    });

    it('should query Drizzle and cache result on cache MISS', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockDb.query.users.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll(query);

      expect(result.data).toEqual([mockUser]);
      expect(result.meta.totalItems).toBe(1);
      expect(mockDb.query.users.findMany).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return cached user on cache HIT', async () => {
      mockRedis.get.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockDb.query.users.findFirst).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache on cache MISS', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockRedis.set).toHaveBeenCalledWith(`user:${mockUser.id}`, mockUser, 120);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockDb.query.users.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = { name: 'Alice Updated' };

    it('should update user and invalidate cache', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.update(mockUser.id, updateDto);

      expect(result.name).toBe('Alice Updated');
      expect(mockRedis.del).toHaveBeenCalledWith(`user:${mockUser.id}`);
      expect(mockRedis.invalidatePattern).toHaveBeenCalledWith('users:page:*');
    });

    it('should throw ConflictException if new email is already taken by another user', async () => {
      mockDb.query.users.findFirst
        .mockResolvedValueOnce(mockUser) // findOne check
        .mockResolvedValueOnce({ id: 'other-user-id', email: 'taken@example.com' }); // uniqueness check

      await expect(service.update(mockUser.id, { email: 'taken@example.com' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove user and invalidate cache', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.remove(mockUser.id);

      expect(result.success).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith(`user:${mockUser.id}`);
      expect(mockRedis.invalidatePattern).toHaveBeenCalledWith('users:page:*');
    });
  });
});
