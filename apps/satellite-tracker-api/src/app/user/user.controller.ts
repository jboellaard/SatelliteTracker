import { Controller, Get, Param, Logger, Post, UseGuards, Request, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { SatelliteService } from '../satellite/satellite.service';
import { Id } from 'shared/domain';
import { AccessJwtAuthGuard } from '../auth/guards/access-jwt-auth.guard';

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

    @UseGuards(AccessJwtAuthGuard)
    @Post(':username/follows')
    async followUser(@Request() req: any, @Param('username') username: string) {
        this.logger.log('POST users/:username/follows called');
        return await this.userService.followUser(req.user.username, username);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Delete(':username/follows')
    async unfollowUser(@Request() req: any, @Param('username') username: string) {
        this.logger.log('DELETE users/:username/follows called');
        return await this.userService.unfollowUser(req.user.username, username);
    }
}
