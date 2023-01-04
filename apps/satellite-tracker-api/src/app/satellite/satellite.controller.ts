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
    Res,
} from '@nestjs/common';
import { SatelliteService } from './satellite.service';
import { SatelliteDto, UpdateSatelliteDto } from './dto/satellite.dto';
import { AccessJwtAuthGuard } from '../auth/guards/access-jwt-auth.guard';
import { OrbitDto, UpdateOrbitDto } from './dto/orbit.dto';

@Controller('satellites')
export class SatelliteController {
    private readonly logger = new Logger(SatelliteController.name);
    constructor(private readonly satelliteService: SatelliteService) {}

    @UseGuards(AccessJwtAuthGuard)
    @Post()
    async create(@Res() res: any, @Request() req: any, @Body() newSatellite: SatelliteDto) {
        this.logger.log('POST satellites called');
        newSatellite.createdById = req.user.userId;
        const satellite = await this.satelliteService.create(req.user.username, newSatellite);
        return res.status(HttpStatus.CREATED).json(satellite);
    }

    @Get()
    async findAll(@Res() res: any) {
        this.logger.log('GET satellites called');
        const satellites = await this.satelliteService.findAll();
        return res.status(HttpStatus.OK).json(satellites);
    }

    @Get('parts')
    async getAllSatelliteParts(@Res() res: any) {
        this.logger.log('GET satellites/parts called');
        const parts = await this.satelliteService.getAllSatelliteParts();
        return res.status(HttpStatus.OK).json(parts);
    }

    @Get('parts/:id')
    async getSatellitePart(@Res() res: any, @Param('id') id: string) {
        this.logger.log('GET satellites/parts/:id called');
        const part = await this.satelliteService.getSatellitePart(id);
        return res.status(HttpStatus.OK).json(part);
    }

    @Get(':id')
    async findOne(@Res() res: any, @Param('id') id: string) {
        this.logger.log('GET satellites/:id called');
        const satellite = await this.satelliteService.findOne(id);
        return res.status(HttpStatus.OK).json(satellite);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Patch(':id')
    async update(
        @Res() res: any,
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateSatelliteDto: UpdateSatelliteDto
    ) {
        this.logger.log('PATCH satellites/:id called');
        const updatedSatellite = await this.satelliteService.update(req.user.userId, id, updateSatelliteDto);
        return res.status(HttpStatus.OK).json(updatedSatellite);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Delete(':id')
    async remove(@Res() res: any, @Request() req: any, @Param('id') id: string) {
        Logger.debug('DELETE satellites/:id called');
        const deletedSatellite = await this.satelliteService.remove(req.user.userId, id);
        return res.status(HttpStatus.OK).json(deletedSatellite);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Post(':id/orbit')
    async createOrbit(@Res() res: any, @Request() req: any, @Param('id') id: string, @Body() orbit: OrbitDto) {
        this.logger.log('POST satellites/:id/orbit called');
        const updatedSatellite = await this.satelliteService.createOrbit(req.user.userId, id, orbit);
        return res.status(HttpStatus.CREATED).json(updatedSatellite);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Patch(':id/orbit')
    async updateOrbit(@Res() res: any, @Request() req: any, @Param('id') id: string, @Body() orbit: UpdateOrbitDto) {
        this.logger.log('PATCH satellites/:id/orbit called');
        const updatedSatellite = await this.satelliteService.updateOrbit(req.user.userId, id, orbit);
        return res.status(HttpStatus.OK).json(updatedSatellite);
    }

    @UseGuards(AccessJwtAuthGuard)
    @Delete(':id/orbit')
    async removeOrbit(@Res() res: any, @Request() req: any, @Param('id') id: string) {
        this.logger.log('DELETE satellites/:id/orbit called');
        const updatedSatellite = await this.satelliteService.removeOrbit(req.user.userId, id);
        return res.status(HttpStatus.OK).json(updatedSatellite);
    }

    /**
     * Launch is temporarily disabled, as it has little use in the current state of the application
     * (instead an orbit now has a datetime of launch)
     * In the future it could be re-enabled, with more attributes and front-end support
     * The paths also need to updated in accordance with the new error handling
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
