/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiResponseInterceptor } from './app/api-response.interceptor';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const globalPrefix = 'data-api';
  // app.setGlobalPrefix(globalPrefix);

  app.useGlobalInterceptors(new ApiResponseInterceptor());

  const port = process.env.PORT || 3333;
  await app.listen(port);
  
  Logger.log(
    `🚀 Data API is running on: ${await app.getUrl()}`
  );
}

bootstrap();
