import { Controller, Get, Param, Logger, Post, UseGuards, Request, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { SatelliteService } from '../satellite/satellite.service';
import { APIResult, Id, ISatellite, IUser, IUserInfo } from 'shared/domain';
import { AccessJwtAuthGuard } from '../auth/guards/access-jwt-auth.guard';

@Controller('users')
export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(private readonly userService: UserService, private readonly satelliteService: SatelliteService) {}

    @Get(':username')
    async findOne(@Param('username') username: string): Promise<APIResult<IUser>> {
        this.logger.log('GET users/:username called');
        return await this.userService.findOne(username);
    }

    @Get(':username/satellites')
    async getSatellites(@Param('username') username: string): Promise<APIResult<ISatellite[]>> {
        this.logger.log('GET users/:username/satellites called');
        return await this.satelliteService.getSatellitesOfUserWithUsername(username);
    }

    @Get(':username/following')
    async getFollows(@Param('username') username: string): Promise<APIResult<IUserInfo[]>> {
        this.logger.log('GET users/:username/follows called');
        return await this.userService.getUserFollowing(username);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Post(':username/follow')
    async followUser(
        @Request() req: any,
        @Param('username') username: string
    ): Promise<APIResult<{ message: string }>> {
        this.logger.log('POST users/:username/follows called');
        return await this.userService.followUser(req.user.username, username);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Delete(':username/follow')
    async unfollowUser(
        @Request() req: any,
        @Param('username') username: string
    ): Promise<APIResult<{ message: string }>> {
        this.logger.log('DELETE users/:username/follows called');
        return await this.userService.unfollowUser(req.user.username, username);
    }

    @Get(':username/followers')
    async getFollowers(@Param('username') username: string): Promise<APIResult<IUserInfo[]>> {
        this.logger.log('GET users/:username/followers called');
        return await this.userService.getUserFollowers(username);
    }

    @Get(':username/tracking')
    async getTracking(@Param('username') username: string): Promise<APIResult<ISatellite[]>> {
        this.logger.log('GET users/:username/tracking called');
        return await this.userService.getUserTracking(username);
    }
}
