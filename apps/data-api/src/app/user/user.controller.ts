import { Controller, Get, Post, Body, Param, Logger, Put, Delete, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { IUser } from 'shared/domain';
import { SatelliteService } from '../satellite/satellite.service';

@Controller('users')
export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(private readonly userService: UserService, private readonly satelliteService: SatelliteService) {}

    @Get()
    findAll(): Promise<IUser[]> {
        this.logger.log('getAll');
        return this.userService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        this.logger.log('findOne');
        return this.userService.findOne(id);
    }

    // @Get(':id/satellites')
    // getSatellites(@Param('id') id: string) {
    //     this.logger.log('getSatellites ' + id);
    //     return this.satelliteService.getSatellitesOfUserWithId(id);
    // }
}
