import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { assertRequiredEnv, getCorsOrigins, isProduction } from './config/env.js';

const BODY_LIMIT = '256kb';

async function bootstrap() {
  assertRequiredEnv();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.useBodyParser('json', { limit: BODY_LIMIT });
  app.useBodyParser('urlencoded', { limit: BODY_LIMIT, extended: true });
  app.set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // The admin panel is a separate origin (Vite), so it needs CORS; the Next.js
  // app only calls the API server-side but is allowlisted for local dev.
  app.enableCors({
    origin: getCorsOrigins(),
    credentials: true,
  });

  // Swagger documents every route including the admin surface, so it stays off
  // in production unless explicitly opted back in.
  if (!isProduction() || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Jayga Lagbe API')
      .setDescription('Backend API for the Jayga Lagbe marketplace platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  }

  // Bound to every interface, not just loopback: a managed host routes to the
  // container's address, and a server listening only on localhost looks dead
  // to it. The platform hands the port over in PORT.
  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
}
await bootstrap();
