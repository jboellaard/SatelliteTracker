import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { APIResponseInterceptor } from './app/api-response.interceptor';

import { AppModule } from './app/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    // app.useGlobalInterceptors(new APIResponseInterceptor());
    app.enableCors();

    const port = process.env.PORT || 3333;
    await app.listen(port);

    Logger.log(`🚀 Data API is running on: ${await app.getUrl()}`);
}

bootstrap();
