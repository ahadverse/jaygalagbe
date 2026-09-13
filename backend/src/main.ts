import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

const DEFAULT_ORIGINS = 'http://localhost:3000,http://localhost:5174';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // The admin panel is a separate origin (Vite), so it needs CORS; the Next.js
  // app only calls the API server-side but is allowlisted for local dev.
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? DEFAULT_ORIGINS)
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Jayga Lagbe API')
    .setDescription('Backend API for the Jayga Lagbe marketplace platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 5000);
}
await bootstrap();
