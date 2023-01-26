import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AccessJwtAuthGuard } from '../auth/guards/access-jwt-auth.guard';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    @UseGuards(AccessJwtAuthGuard)
    @Get('tracked-satellites')
    async getSatellitesFeed(@Request() req: any) {
        return await this.feedService.getSatellitesFeed(req.user.username);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Get('following')
    async getFollowingFeed(@Request() req: any) {
        return await this.feedService.getFollowingFeed(req.user.username);
    }
}
