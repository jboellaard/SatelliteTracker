import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { SatelliteService } from './satellite.service';
import { CreateSatelliteDto } from './dto/create-satellite.dto';
import { UpdateSatelliteDto } from './dto/update-satellite.dto';

@Controller('satellites')
export class SatelliteController {
  constructor(private readonly satelliteService: SatelliteService) {}

  @Post()
  create(@Body() createSatelliteDto: CreateSatelliteDto) {
    return this.satelliteService.create(createSatelliteDto);
  }

  @Get()
  findAll() {
    return this.satelliteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.satelliteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSatelliteDto: UpdateSatelliteDto) {
    return this.satelliteService.update(+id, updateSatelliteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    Logger.debug('remove');
    return this.satelliteService.remove(+id);
  }
}
