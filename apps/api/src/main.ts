import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter'
import { SanitizeInputPipe } from './presentation/pipes/sanitize-input.pipe'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // rawBody: true allows access to req.rawBody in webhook handler for HMAC verification
    rawBody: true,
  })

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 8080)
  const host = configService.get<string>('HOST', '0.0.0.0')

  app.use(helmet())
  const configuredOrigins = configService
    .get<string>('CORS_ORIGIN', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  const isDevelopment = configService.get<string>('NODE_ENV', 'development') !== 'production'

  app.enableCors({
    origin(origin, callback) {
      // Requests without an Origin header are server-to-server or local tools.
      if (!origin || configuredOrigins.includes(origin)) return callback(null, true)

      if (isDevelopment) {
        try {
          const { hostname } = new URL(origin)
          const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1'
          const isPrivateNetwork =
            /^10\./.test(hostname) ||
            /^192\.168\./.test(hostname) ||
            /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
          if (isLocalHost || isPrivateNetwork) return callback(null, true)
        } catch {
          // Invalid origins are rejected below.
        }
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`), false)
    },
    credentials: true,
  })

  app.useGlobalPipes(
    new SanitizeInputPipe(),
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  app.setGlobalPrefix('api/v1')

  const doc = new DocumentBuilder()
    .setTitle('TechEnglish Pro API')
    .setDescription('Backend API for TechEnglish Pro - KLCN028')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, doc)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(port, host)
  console.log('API running on http://' + host + ':' + port + '/api/v1')
  console.log('Swagger docs: http://localhost:' + port + '/api/docs')
}

bootstrap()
