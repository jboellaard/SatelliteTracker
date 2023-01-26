import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { APIResult, ISatellite, IUser } from 'shared/domain';
import { AccessJwtAuthGuard } from '../auth/guards/access-jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
    constructor(private readonly recommendationsService: RecommendationsService) {}

    @UseGuards(AccessJwtAuthGuard)
    @Get('similar-creators')
    async getRecommendedUsers(@Req() req: any): Promise<APIResult<IUser[]>> {
        return await this.recommendationsService.getSimilarCreators(req.user.username);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Get('to-follow')
    async getFollowRecommendations(@Req() req: any): Promise<APIResult<IUser[]>> {
        return await this.recommendationsService.getFollowRecommendations(req.user.username);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Get('to-track')
    async getSatelliteRecommendations(@Req() req: any): Promise<APIResult<ISatellite[]>> {
        return await this.recommendationsService.getSatelliteRecommendations(req.user.username);
    }

    @Get('popular-satellites')
    async getPopularSatellites(): Promise<APIResult<ISatellite[]>> {
        return await this.recommendationsService.getPopularSatellites();
    }

    @Get('popular-creators')
    async getPopularCreators(): Promise<APIResult<IUser[]>> {
        return await this.recommendationsService.getPopularCreators();
    }

    @Get('new-satellites')
    async getNewSatellites(): Promise<APIResult<ISatellite[]>> {
        return await this.recommendationsService.getRecentlyCreatedSatellites();
    }
}
