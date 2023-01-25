import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AccessJwtAuthGuard } from '../auth/guards/access-jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
    constructor(private readonly recommendationsService: RecommendationsService) {}

    @UseGuards(AccessJwtAuthGuard)
    @Get('similar-creators')
    async getRecommendedUsers(@Req() req: any) {
        return await this.recommendationsService.getSimilarCreators(req.user.username);
    }
}
