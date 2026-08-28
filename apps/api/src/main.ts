import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './shared/presentation/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3001)

  app.use(helmet())
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  })

  app.useGlobalPipes(
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

  await app.listen(port)
  console.log('API running on http://localhost:' + port + '/api/v1')
  console.log('Swagger docs: http://localhost:' + port + '/api/docs')
}

bootstrap()
