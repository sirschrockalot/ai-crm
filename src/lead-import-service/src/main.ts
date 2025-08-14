import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enhanced Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Lead Import/Export Service API')
    .setDescription(`
# Lead Import/Export Service

A microservice for the Presidential Digs CRM that handles importing and exporting lead data from various file formats.

## Overview

This service provides RESTful APIs for:
- **Importing leads** from CSV and Excel files
- **Validating file structure** before import
- **Exporting leads** in multiple formats (CSV, Excel, JSON)
- **Tracking import/export progress** with real-time status updates
- **Downloading templates** for consistent data formatting

## Key Features

- **Multi-format Support**: Import from CSV, Excel (.xlsx, .xls) files
- **Batch Processing**: Handle large files efficiently with configurable batch sizes
- **Field Mapping**: Custom mapping between CSV columns and database fields
- **Duplicate Detection**: Intelligent duplicate handling with configurable strategies
- **Progress Tracking**: Real-time import/export progress monitoring
- **Validation**: Comprehensive data validation before import
- **Error Handling**: Detailed error reporting with row-level feedback

## Authentication

This service uses Bearer token authentication. Include your API key in the Authorization header:
\`\`\`
Authorization: Bearer your-api-key-here
\`\`\`

## Rate Limiting

The service implements rate limiting to prevent abuse:
- **Default**: 100 requests per minute per IP
- **Import operations**: 10 requests per minute per user
- **Export operations**: 20 requests per minute per user

## File Size Limits

- **Maximum file size**: 10MB
- **Supported formats**: CSV, XLSX, XLS
- **Recommended batch size**: 1000 records per batch

## Error Handling

All endpoints return consistent error responses:
- **400 Bad Request**: Invalid input data or file format
- **401 Unauthorized**: Missing or invalid API key
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error

## Support

For technical support or questions about this API, please contact:
- **Email**: support@presidential-digs.com
- **Documentation**: https://docs.presidential-digs.com
- **GitHub**: https://github.com/sirschrockalot/Lead-Import-Service
    `)
    .setVersion('1.0.0')
    .setContact(
      'Presidential Digs CRM Team',
      'https://presidential-digs.com',
      'support@presidential-digs.com'
    )
    .setLicense(
      'MIT License',
      'https://github.com/sirschrockalot/Lead-Import-Service/blob/main/LICENSE'
    )
    .addServer('http://localhost:3005', 'Development Server')
    .addServer('https://api-staging.presidential-digs.com', 'Staging Server')
    .addServer('https://api.presidential-digs.com', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: 'Enter your API key in the format: Bearer your-api-key-here'
      },
      'api-key'
    )
    .addTag('Lead Import/Export', 'Operations for importing and exporting lead data')
    .addTag('File Validation', 'File structure validation and template operations')
    .addTag('Progress Tracking', 'Import and export progress monitoring')
    .build();
  
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // Custom Swagger UI options
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tryItOutEnabled: true,
      requestInterceptor: (req: any) => {
        // Add default headers for testing
        req.headers['Content-Type'] = 'application/json';
        return req;
      },
    },
    customSiteTitle: 'Lead Import/Export Service API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; font-size: 36px; }
      .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    `,
  });

  const port = process.env.PORT || 3005;
  await app.listen(port);
  
  console.log(`🚀 Lead Import/Export Service running on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api`);
  console.log(`🔧 Health check available at http://localhost:${port}/health`);
}

bootstrap();
