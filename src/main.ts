import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import helmet from 'helmet';

import { AppModule } from './app.module';
import { MetricsService } from './metrics/metrics.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          scriptSrcAttr: ["'unsafe-inline'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          upgradeInsecureRequests: [],
        },
      },
    }),
  );

  app.enableCors();

  app.use((req: any, res: any, next: any) => {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    req.correlationId = Array.isArray(correlationId)
      ? correlationId[0]
      : correlationId;
    res.setHeader('x-correlation-id', req.correlationId);
    next();
  });

  const metricsService = app.get(MetricsService);
  app.use((req: any, res: any, next: any) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      const labels = {
        method: req.method,
        route: req.route?.path || req.path,
        status: res.statusCode,
      };
      metricsService.increment('finbank_http_requests_total', labels);
      metricsService.observe(
        'finbank_http_requests_total',
        Date.now() - startedAt,
        labels,
      );
    });
    next();
  });

  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(`/${apiPrefix}/docs-json`, (_req, res, next) => {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  app.use(`/${apiPrefix}/docs`, (_req, res, next) => {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Almond FinBank Pro API')
    .setDescription('Production Banking API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const demoPayloadSchemas: Record<string, any> = {
    [`/${apiPrefix}/auth/register`]: {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'password'],
      properties: {
        firstName: { type: 'string', example: 'Kpono-Abasi' },
        lastName: { type: 'string', example: 'Akpabio' },
        email: { type: 'string', example: 'change-me+001@finbank.test' },
        phone: { type: 'string', example: '+2348011112201' },
        password: { type: 'string', example: 'Password1', minLength: 8 },
      },
      example: {
        firstName: 'Kpono-Abasi',
        lastName: 'Akpabio',
        email: 'change-me+001@finbank.test',
        phone: '+2348011112201',
        password: 'Password1',
      },
    },
    [`/${apiPrefix}/auth/login`]: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'change-me+001@finbank.test' },
        password: { type: 'string', example: 'Password1' },
      },
      example: {
        email: 'change-me+001@finbank.test',
        password: 'Password1',
      },
    },
    [`/${apiPrefix}/auth/refresh`]: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: {
          type: 'string',
          example: 'paste-refresh-token-from-login-response',
        },
      },
      example: {
        refreshToken: 'paste-refresh-token-from-login-response',
      },
    },
    [`/${apiPrefix}/accounts`]: {
      type: 'object',
      required: ['type'],
      properties: {
        type: {
          type: 'string',
          enum: ['SAVINGS', 'CURRENT'],
          example: 'SAVINGS',
        },
        initialBalance: { type: 'number', minimum: 0, example: 50000 },
      },
      example: {
        type: 'SAVINGS',
        initialBalance: 50000,
      },
    },
    [`/${apiPrefix}/transactions/transfer`]: {
      type: 'object',
      required: ['fromAccount', 'toAccount', 'amount', 'narration'],
      properties: {
        fromAccount: {
          type: 'string',
          example: 'replace-with-source-accountNumber',
        },
        toAccount: {
          type: 'string',
          example: 'replace-with-destination-accountNumber',
        },
        amount: { type: 'number', minimum: 1, example: 2500 },
        narration: { type: 'string', example: 'Live Swagger demo transfer' },
        idempotencyKey: {
          type: 'string',
          example: 'demo-transfer-20260727-001',
        },
      },
      example: {
        fromAccount: 'replace-with-source-accountNumber',
        toAccount: 'replace-with-destination-accountNumber',
        amount: 2500,
        narration: 'Live Swagger demo transfer',
        idempotencyKey: 'demo-transfer-20260727-001',
      },
    },
    [`/${apiPrefix}/mock/sms`]: {
      type: 'object',
      required: ['phone', 'message'],
      properties: {
        phone: { type: 'string', example: '+2348011112299' },
        message: {
          type: 'string',
          example:
            'Your Almond FinBank demo transfer of NGN 2,500.00 was successful.',
        },
        correlationId: { type: 'string', example: 'swagger-correlation-001' },
      },
      example: {
        phone: '+2348011112299',
        message:
          'Your Almond FinBank demo transfer of NGN 2,500.00 was successful.',
        correlationId: 'swagger-correlation-001',
      },
    },
    [`/${apiPrefix}/webhooks/payment`]: {
      type: 'object',
      required: [
        'provider',
        'reference',
        'accountNumber',
        'amount',
        'currency',
        'status',
      ],
      properties: {
        provider: { type: 'string', example: 'flutterwave' },
        reference: { type: 'string', example: 'FLW-DEMO-20260727-001' },
        accountNumber: {
          type: 'string',
          example: 'replace-with-accountNumber',
        },
        amount: { type: 'number', example: 25000 },
        currency: { type: 'string', example: 'NGN' },
        status: { type: 'string', example: 'SUCCESS' },
        paidAt: { type: 'string', example: '2026-07-27T12:00:00.000Z' },
      },
      example: {
        provider: 'flutterwave',
        reference: 'FLW-DEMO-20260727-001',
        accountNumber: 'replace-with-accountNumber',
        amount: 25000,
        currency: 'NGN',
        status: 'SUCCESS',
        paidAt: '2026-07-27T12:00:00.000Z',
      },
    },
  };

  for (const [path, schema] of Object.entries(demoPayloadSchemas)) {
    const content = (document.paths[path]?.post?.requestBody as any)?.content?.[
      'application/json'
    ];

    if (content) {
      content.example = schema.example;
      content.examples = {
        demo: {
          summary: 'Demo JSON payload',
          value: schema.example,
        },
      };
      content.schema = schema;
    }
  }

  const noBodyExamples: Record<string, string> = {
    [`/${apiPrefix}/auth/logout`]:
      'Send with Bearer token. No JSON body required.',
    [`/${apiPrefix}/mock/payments/transfer`]:
      'No JSON body required. Returns a random mock gateway status.',
  };

  for (const [path, description] of Object.entries(noBodyExamples)) {
    const operation = document.paths[path]?.post as any;
    if (operation) {
      operation.description = description;
      operation.requestBody = {
        required: false,
        content: {
          'application/json': {
            example: {},
            schema: {
              type: 'object',
              example: {},
              description,
            },
          },
        },
      };
    }
  }

  const getExamples: Record<
    string,
    { description: string; parameters?: Record<string, string> }
  > = {
    [`/${apiPrefix}/health`]: {
      description: 'Health check endpoint. No JSON payload required.',
    },
    [`/${apiPrefix}/metrics`]: {
      description:
        'Prometheus-style application metrics. No JSON payload required.',
    },
    [`/${apiPrefix}/accounts`]: {
      description:
        'List accounts for the authenticated user. Send only the Bearer token; no JSON payload required.',
    },
    [`/${apiPrefix}/mock/name-enquiry`]: {
      description:
        'Legacy demo name enquiry. Use query parameters, not a JSON body.',
      parameters: {
        accountNumber: '20583521311',
        bankCode: '044',
      },
    },
    [`/${apiPrefix}/nibss/name-enquiry`]: {
      description:
        'NIBSS-style name enquiry mock. Use query parameters, not a JSON body.',
      parameters: {
        accountNumber: '0123456789',
        bankCode: '044',
      },
    },
    [`/${apiPrefix}/reconciliation/daily`]: {
      description:
        'Admin/support daily reconciliation summary. Send Bearer token for ADMIN or SUPPORT.',
      parameters: {
        date: '2026-07-27',
      },
    },
    [`/${apiPrefix}/settlements/daily`]: {
      description:
        'Admin/support daily settlement summary. Send Bearer token for ADMIN or SUPPORT.',
      parameters: {
        date: '2026-07-27',
      },
    },
    [`/${apiPrefix}/admin/dashboard`]: {
      description:
        'Admin-only operational dashboard endpoint. Send Bearer token for ADMIN.',
    },
  };

  for (const [path, routeConfig] of Object.entries(getExamples)) {
    const operation = (document.paths[path]?.get ??
      document.paths[path]?.post) as any;
    if (operation) {
      operation.description = routeConfig.description;
      if (operation.parameters && routeConfig.parameters) {
        operation.parameters = operation.parameters.map((parameter: any) => ({
          ...parameter,
          example:
            routeConfig.parameters?.[parameter.name] ?? parameter.example,
          schema: {
            ...(parameter.schema ?? {}),
            example:
              routeConfig.parameters?.[parameter.name] ??
              parameter.schema?.example,
          },
        }));
      }
    }
  }

  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);

  console.log('Server running on http://localhost:3000');
  console.log('RabbitMQ consumer connected');
}

bootstrap();
