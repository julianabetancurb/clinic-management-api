import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global /api
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Clinic Management API')
    .setDescription(
      'API para gestión de doctores, pacientes y citas médicas.\n\n' +
      '**v1** — CRUD completo de entidades.\n\n' +
      '**v2** — Cadena multicloud: el mensaje viaja por Doctor (GCP) → Actor → siguiente entidad (AWS).',
    )
    .setVersion('2.0')
    .addTag('Doctores')
    .addTag('Doctores v2')
    .addTag('Pacientes')
    .addTag('Citas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();