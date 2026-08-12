import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import * as compression from 'compression';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);
  const apiPrefix = configService.get<string>('apiPrefix', 'api/v1');
  const allowedOrigins = configService.get<string>('allowedOrigins', '*');
  const isProd = configService.get<string>('env') === 'production';

  // Security & Performance Middlewares
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS Hardening
  app.enableCors({
    origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(',').map((o) => o.trim()),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix(apiPrefix);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Swagger Documentation Setup
  const swaggerEnabled = configService.get<boolean>('swagger.enabled', false);
  if (swaggerEnabled) {
    if (isProd) {
      logger.warn('⚠️  SECURITY WARNING: Swagger documentation is enabled in PRODUCTION mode.');
    }

    const swaggerConfig = new DocumentBuilder()
      .setTitle(configService.get<string>('swagger.title', 'Next-Gen Data Starter API'))
      .setDescription(
        configService.get<string>(
          'swagger.description',
          'High-performance NestJS backend boilerplate featuring Drizzle ORM, PostgreSQL, Redis, and BullMQ.',
        ),
      )
      .setVersion(configService.get<string>('swagger.version', '1.0'))
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    const swaggerPath = configService.get<string>('swagger.path', 'docs');
    SwaggerModule.setup(swaggerPath, app, document, {
      customSiteTitle: 'Next-Gen Data API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log(`📚 Swagger documentation available at: http://localhost:${port}/${swaggerPath}`);
  }

  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`💚 Healthcheck available at: http://localhost:${port}/${apiPrefix}/health`);
}

bootstrap();
