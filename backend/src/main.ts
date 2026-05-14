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

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.use(helmet());
    
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

    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

// Export the handler for Vercel
export default async (req: any, res: any) => {
  const app = await bootstrap();
  return app(req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  const startLocal = async () => {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3005;
    
    app.enableCors();
    await app.listen(port);
    console.log(`Local server running on: http://localhost:${port}`);
  };
  startLocal();
}
