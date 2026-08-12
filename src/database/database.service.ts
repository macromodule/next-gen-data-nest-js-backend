import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE_DB = 'DRIZZLE_DATABASE_CONNECTION';
export type DrizzleDb = NodePgDatabase<typeof schema>;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;
  private db: DrizzleDb;

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.get<string>('database.url');
    const max = this.configService.get<number>('database.maxConnections', 20);

    this.pool = new Pool({
      connectionString,
      max,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      client.release();
      this.logger.log('Successfully connected to PostgreSQL database with Drizzle ORM');
    } catch (error) {
      this.logger.error(`Failed to connect to PostgreSQL database: ${error.message}`, error.stack);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('PostgreSQL connection pool closed');
  }

  getDb(): DrizzleDb {
    return this.db;
  }

  async ping(): Promise<boolean> {
    try {
      const res = await this.pool.query('SELECT 1');
      return (res?.rowCount ?? 0) > 0;
    } catch (error: any) {
      this.logger.error(`Database ping failed: ${error?.message || error}`);
      return false;
    }
  }
}
