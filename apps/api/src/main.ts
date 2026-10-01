import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter'
import { SanitizeInputPipe } from './presentation/pipes/sanitize-input.pipe'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // rawBody: true allows access to req.rawBody in webhook handler for HMAC verification
    rawBody: true,
  })
  // Ảnh mobile được gửi dưới dạng base64 để tránh lỗi FormData của React Native.
  app.useBodyParser('json', { limit: '7mb' })

  const configService = app.get(ConfigService)
  const port = Number(configService.getOrThrow<string>('PORT'))
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535')
  }
  const host = configService.getOrThrow<string>('HOST')
  const apiPublicUrl = configService.getOrThrow<string>('API_PUBLIC_URL').replace(/\/$/, '')

  app.use(helmet())
  const configuredOrigins = configService
    .getOrThrow<string>('CORS_ORIGIN')
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
  console.log(`API running on ${apiPublicUrl}/api/v1`)
  console.log(`Swagger docs: ${apiPublicUrl}/api/docs`)
}

bootstrap()
