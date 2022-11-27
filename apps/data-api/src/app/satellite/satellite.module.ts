import { Module } from '@nestjs/common';
import { SatelliteService } from './satellite.service';
import { SatelliteController } from './satellite.controller';

@Module({
  controllers: [SatelliteController],
  providers: [SatelliteService]
})
export class SatelliteModule {}
