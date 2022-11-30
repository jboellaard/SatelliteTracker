import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SatelliteModule } from './satellite/satellite.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    SatelliteModule,
    // MongooseModule.forRoot('mongodb://localhost:27017/'),
    RouterModule.register([]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
