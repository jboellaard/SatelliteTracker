import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SatelliteModule } from './satellite/satellite.module';

@Module({
  imports: [AuthModule, UserModule, SatelliteModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
