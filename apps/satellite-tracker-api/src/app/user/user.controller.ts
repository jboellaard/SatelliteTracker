import { Controller, Get, Param, Logger, Res, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { SatelliteService } from '../satellite/satellite.service';

@Controller('users')
export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(private readonly userService: UserService, private readonly satelliteService: SatelliteService) {}

    @Get(':username')
    async findOne(@Res() res: any, @Param('username') id: string) {
        this.logger.log('GET users/:username called');
        const user = await this.userService.findOne(id);
        return res.status(HttpStatus.OK).json(user);
    }

    @Get(':username/satellites')
    async getSatellites(@Res() res: any, @Param('username') id: string) {
        this.logger.log('GET users/:username/satellites called');
        const satellites = await this.satelliteService.getSatellitesOfUserWithId(id);
        return res.status(HttpStatus.OK).json(satellites);
    }
}
