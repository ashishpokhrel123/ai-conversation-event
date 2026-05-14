import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ConfigService } from '@nestjs/config';

const getAllowedOrigins = (frontendUrl: string | undefined): string[] => {
  return frontendUrl
    ? frontendUrl.split(',').map((url) => url.trim())
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
      ];
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.enableShutdownHooks();

  app.enableCors({
    origin: getAllowedOrigins(configService.get<string>('FRONTEND_URL')),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // For Vercel, we don't call listen() if we're being imported
  if (process.env.NODE_ENV !== 'production') {
    const port = configService.get<number>('PORT') || 3005;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  }

  return app.getHttpAdapter().getInstance();
}

// Export for Vercel
export default bootstrap();
