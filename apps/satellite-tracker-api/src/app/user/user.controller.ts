import { Controller, Get, Param, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { SatelliteService } from '../satellite/satellite.service';
import { Id } from 'shared/domain';

@Controller('users')
export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(private readonly userService: UserService, private readonly satelliteService: SatelliteService) {}

    @Get(':username')
    async findOne(@Param('username') id: Id) {
        this.logger.log('GET users/:username called');
        return await this.userService.findOne(id);
    }

    @Get(':username/satellites')
    async getSatellites(@Param('username') username: string) {
        this.logger.log('GET users/:username/satellites called');
        return await this.satelliteService.getSatellitesOfUserWithUsername(username);
    }
}
