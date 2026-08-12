import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';

@ApiTags('Health & Readiness')
@Controller('health')
export class HealthController {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check API and infrastructure health status' })
  @ApiResponse({ status: 200, description: 'All systems operational' })
  @ApiResponse({ status: 503, description: 'One or more services unavailable' })
  async check() {
    const [dbHealthy, redisHealthy] = await Promise.all([
      this.dbService.ping(),
      this.redisService.ping(),
    ]);

    const isHealthy = dbHealthy && redisHealthy;
    const status = {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: dbHealthy ? 'up' : 'down',
        },
        redis: {
          status: redisHealthy ? 'up' : 'down',
        },
      },
    };

    if (!isHealthy) {
      throw new HttpException(status, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return status;
  }
}
