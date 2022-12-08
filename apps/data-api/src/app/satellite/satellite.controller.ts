import {
    Controller,
    Get,
    Post,
    Body,
    Request,
    Patch,
    Param,
    Delete,
    Logger,
    UseGuards,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import { SatelliteService } from './satellite.service';
import { SatelliteDto, UpdateSatelliteDto } from './dto/satellite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrbitDto, UpdateOrbitDto } from './dto/orbit.dto';

@Controller('satellites')
export class SatelliteController {
    private readonly logger = new Logger(SatelliteController.name);
    constructor(private readonly satelliteService: SatelliteService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req: any, @Body() newSatellite: SatelliteDto) {
        this.logger.log('POST satellites called');
        newSatellite.createdById = req.user.userId;
        return this.satelliteService.create(req.user.username, newSatellite);
    }

    @Get()
    findAll() {
        this.logger.log('GET satellites called');
        return this.satelliteService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        this.logger.log('GET satellites/:id called');
        return this.satelliteService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(@Request() req: any, @Param('id') id: string, @Body() updateSatelliteDto: UpdateSatelliteDto) {
        this.logger.log('PATCH satellites/:id called');
        try {
            return await this.satelliteService.update(req.user.userId, id, updateSatelliteDto);
        } catch (error) {
            throw new HttpException('You are not authorized to update this satellite', HttpStatus.UNAUTHORIZED);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async remove(@Request() req: any, @Param('id') id: string) {
        Logger.debug('DELETE satellites/:id called');
        try {
            return await this.satelliteService.remove(req.user.userId, id);
        } catch (error) {
            throw new HttpException('You are not authorized to delete this satellite', HttpStatus.UNAUTHORIZED);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/orbit')
    async createOrbit(@Request() req: any, @Param('id') id: string, @Body() orbit: OrbitDto) {
        this.logger.log('POST satellites/:id/orbit called');
        try {
            return await this.satelliteService.createOrbit(req.user.userId, id, orbit);
        } catch (error) {
            throw new HttpException(
                'You are not authorized to create an orbit for this satellite',
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/orbit')
    async updateOrbit(@Request() req: any, @Param('id') id: string, @Body() orbit: UpdateOrbitDto) {
        this.logger.log('PATCH satellites/:id/orbit called');
        try {
            return await this.satelliteService.updateOrbit(req.user.userId, id, orbit);
        } catch (error) {
            throw new HttpException(
                'You are not authorized to update an orbit for this satellite',
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/orbit')
    async removeOrbit(@Request() req: any, @Param('id') id: string) {
        this.logger.log('DELETE satellites/:id/orbit called');
        try {
            return await this.satelliteService.removeOrbit(req.user.userId, id);
        } catch (error) {
            throw new HttpException(
                'You are not authorized to delete an orbit for this satellite',
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    /**
     * Launch is temporarily disabled, as it has little use in the current state of the application
     * (instead an orbit now has a datetime of launch)
     * In the future it could be re-enabled, with more attributes and front-end support
     */

    /**
    @UseGuards(JwtAuthGuard)
    @Post(':id/launch')
    async createLaunch(@Request() req: any, @Param('id') id: string, @Body() launch: ILaunch) {
        this.logger.log('POST satellites/:id/launch called');
        try {
            return await this.satelliteService.createLaunch(req.user.userId, id, launch);
        } catch (error) {
            throw new HttpException(
                'You are not authorized to create a launch for this satellite',
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/launch')
    async updateLaunch(@Request() req: any, @Param('id') id: string, @Body() launch: LaunchDto) {
        this.logger.log('PATCH satellites/:id/launch called');
        try {
            return await this.satelliteService.updateLaunch(req.user.userId, id, launch);
        } catch (error) {
            throw new HttpException(
                'You are not authorized to update a launch for this satellite',
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/launch')
    async removeLaunch(@Request() req: any, @Param('id') id: string) {
        this.logger.log('DELETE satellites/:id/launch called');
        try {
            return await this.satelliteService.removeLaunch(req.user.userId, id);
        } catch (error) {
            throw new HttpException(
                'You are not authorized to delete a launch for this satellite',
                HttpStatus.UNAUTHORIZED
            );
        }
    }
     */
}
