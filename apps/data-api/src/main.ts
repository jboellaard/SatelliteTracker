import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// import serverlessExpress from '@vendia/serverless-express';
// import { Callback, Context, Handler } from 'aws-lambda';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3333;
  await app.listen(port);

  Logger.log(`🚀 Data API is running on: ${await app.getUrl()}`);
}

bootstrap();

// let server: Handler;

// async function bootstrap(): Promise<Handler> {
//   const app = await NestFactory.create(AppModule);
//   await app.init();

//   const expressApp = app.getHttpAdapter().getInstance();
//   return serverlessExpress({ app: expressApp });
// }

// export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
//   server = server ?? (await bootstrap());
//   return server(event, context, callback);
// };
