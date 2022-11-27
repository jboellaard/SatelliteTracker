import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SatelliteModule } from '../satellite/satellite.module';
import { SatelliteService } from '../satellite/satellite.service';

@Module({
  controllers: [UserController],
  providers: [UserService, SatelliteService],
})
export class UserModule {}
