import { Controller, Get, Post, Body, Request, Patch, Param, Delete, Logger, UseGuards } from '@nestjs/common';
import { SatelliteService } from './satellite.service';
import { SatelliteDto, UpdateSatelliteDto } from './dto/satellite.dto';
import { AccessJwtAuthGuard } from '../auth/guards/access-jwt-auth.guard';
import { OrbitDto, UpdateOrbitDto } from './dto/orbit.dto';
import { APIResult, ISatellite, ISatellitePart, IUser } from 'shared/domain';

@Controller('satellites')
export class SatelliteController {
    private readonly logger = new Logger(SatelliteController.name);
    constructor(private readonly satelliteService: SatelliteService) {}

    @UseGuards(AccessJwtAuthGuard)
    @Post()
    async create(@Request() req: any, @Body() newSatellite: SatelliteDto): Promise<APIResult<ISatellite>> {
        this.logger.verbose('POST satellites called');
        newSatellite.createdBy = req.user.userId;
        return await this.satelliteService.create(req.user.username, newSatellite);
    }

    @Get()
    async findAll(): Promise<APIResult<ISatellite[]>> {
        this.logger.verbose('GET satellites called');
        return await this.satelliteService.findAll();
    }

    @Get('parts')
    async getAllSatelliteParts(): Promise<APIResult<ISatellitePart[]>> {
        this.logger.verbose('GET satellites/parts called');
        return await this.satelliteService.getAllSatelliteParts();
    }

    @Get('parts/:id')
    async getSatellitePart(@Param('id') id: string): Promise<APIResult<ISatellitePart>> {
        this.logger.verbose('GET satellites/parts/:id called');
        return await this.satelliteService.getSatellitePart(id);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<APIResult<ISatellite>> {
        this.logger.verbose('GET satellites/:id called');
        return await this.satelliteService.findOne(id);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Patch(':id')
    async update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateSatelliteDto: UpdateSatelliteDto
    ): Promise<APIResult<ISatellite>> {
        this.logger.verbose('PATCH satellites/:id called');
        return await this.satelliteService.update(req.user.userId, id, updateSatelliteDto);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Delete(':id')
    async remove(@Request() req: any, @Param('id') id: string): Promise<APIResult<ISatellite>> {
        this.logger.verbose('DELETE satellites/:id called');
        return await this.satelliteService.remove(req.user.userId, id);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Post(':id/orbit')
    async createOrbit(
        @Request() req: any,
        @Param('id') id: string,
        @Body() orbit: OrbitDto
    ): Promise<APIResult<ISatellite>> {
        this.logger.verbose('POST satellites/:id/orbit called');
        return await this.satelliteService.createOrbit(req.user.userId, id, orbit);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Patch(':id/orbit')
    async updateOrbit(
        @Request() req: any,
        @Param('id') id: string,
        @Body() orbit: UpdateOrbitDto
    ): Promise<APIResult<ISatellite>> {
        this.logger.verbose('PATCH satellites/:id/orbit called');
        return await this.satelliteService.updateOrbit(req.user.userId, id, orbit);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Delete(':id/orbit')
    async removeOrbit(@Request() req: any, @Param('id') id: string): Promise<APIResult<ISatellite>> {
        this.logger.verbose('DELETE satellites/:id/orbit called');
        return await this.satelliteService.removeOrbit(req.user.userId, id);
    }

    @Get(':id/track')
    async getTrackers(@Param('id') id: string): Promise<APIResult<IUser[]>> {
        this.logger.verbose('GET satellites/:id/track called');
        return await this.satelliteService.getTrackers(id);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Post(':id/track')
    async trackSatellite(@Request() req: any, @Param('id') id: string): Promise<APIResult<ISatellite[]>> {
        this.logger.verbose('POST satellites/:id/track called');
        return await this.satelliteService.trackSatellite(req.user.username, id);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Delete(':id/track')
    async untrackSatellite(@Request() req: any, @Param('id') id: string): Promise<APIResult<ISatellite[]>> {
        this.logger.verbose('DELETE satellites/:id/track called');
        return await this.satelliteService.untrackSatellite(req.user.username, id);
    }
}
