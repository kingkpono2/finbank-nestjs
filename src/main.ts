import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';
import {
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';

import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // RabbitMQ Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'finbank_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  app.use(helmet());

  app.enableCors();

  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Almond FinBank Pro API')
    .setDescription('Production Banking API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  SwaggerModule.setup(
    `${apiPrefix}/docs`,
    app,
    document,
  );

  // Start RabbitMQ Consumer
  await app.startAllMicroservices();

  // Start HTTP Server
  await app.listen(process.env.PORT || 3000);

  console.log(`🚀 Server running on http://localhost:3000`);
  console.log(`🐇 RabbitMQ consumer connected`);
}

bootstrap();