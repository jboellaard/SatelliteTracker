import { Controller, Get, Post, Body, Param, Logger, Put, Delete, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'shared/domain';
import { APIResponse } from 'shared/domain';
import { SatelliteService } from '../satellite/satellite.service';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService, private readonly satelliteService: SatelliteService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): APIResponse<User> {
    this.logger.log('create');
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(): APIResponse<User[]> {
    this.logger.log('getAll');
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log('findOne');
    return this.userService.findOne(+id);
  }

  @Get(':id/satellites')
  getSatellites(@Param('id') id: string) {
    this.logger.log('getSatellites ' + id);
    return this.satelliteService.getSatellitesOfUserWithId(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log('update');
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log('remove');
    return this.userService.remove(+id);
  }
}
