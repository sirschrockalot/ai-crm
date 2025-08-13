import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure Express with larger header limits
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('maxHeaderSize', 32768);
  

  
  // Security middleware (temporarily disabled for testing)
  // app.use(helmet({
  //   contentSecurityPolicy: false,
  // }));
  // app.use(compression());
  // app.use(cors({
  //   origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  //   credentials: true,
  // }));
  
  // Global validation pipe (temporarily disabled for testing)
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,
  //   forbidNonWhitelisted: true,
  //   transform: true,
  // }));
  
  // Global prefix
  app.setGlobalPrefix('api/auth');
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Authentication service is running on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/auth`);
}

bootstrap();
