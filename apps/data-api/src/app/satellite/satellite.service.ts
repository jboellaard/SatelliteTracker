import { Injectable, Logger } from '@nestjs/common';
import { SatelliteDto, UpdateSatelliteDto } from './dto/satellite.dto';
import { Id } from 'shared/domain';
import { Satellite } from './satellite.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/user.schema';
import mongoose, { Model } from 'mongoose';
import { SatelliteNeoQueries } from './neo4j/satellite.cypher';
import { Neo4jService } from '../neo4j/neo4j.service';
import { OrbitDto, UpdateOrbitDto } from './dto/orbit.dto';

@Injectable()
export class SatelliteService {
    private logger = new Logger(SatelliteService.name);

    constructor(
        @InjectModel(User.name, 'satellitetrackerdb') private userModel: Model<UserDocument>,
        @InjectModel(Satellite.name, 'satellitetrackerdb') private satelliteModel: Model<Satellite>,
        @InjectConnection('satellitetrackerdb') private connection: mongoose.Connection,
        private readonly neo4jService: Neo4jService
    ) {}

    async create(username: string, newSatellite: SatelliteDto) {
        this.logger.debug(newSatellite.createdById);
        const satellite = new this.satelliteModel(newSatellite);
        this.neo4jService.write(SatelliteNeoQueries.addSatellite, {
            satelliteName: newSatellite.satelliteName,
            username: username,
        });

        return satellite.save();
    }

    async findAll() {
        return this.satelliteModel.find();
    }

    async findOne(id: Id) {
        return this.satelliteModel.findById(id);
    }

    async getSatellitesOfUserWithId(id: Id) {
        return this.satelliteModel.find({ createdBy: id });
    }

    async update(userId: Id, id: Id, updateSatelliteDto: UpdateSatelliteDto) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            await satellite?.updateOne({ ...updateSatelliteDto }, { new: true });
            if (updateSatelliteDto.satelliteName) {
                this.neo4jService.write(SatelliteNeoQueries.updateSatelliteName, {
                    newSatelliteName: updateSatelliteDto.satelliteName,
                });
            }
            // if (updateSatelliteDto.launch?.launchSite) {
            //     this.neo4jService.write(SatelliteNeoQueries.updateSatelliteLaunchLocation, {
            //         satelliteName: satellite?.satelliteName,
            //         launchLongitude: updateSatelliteDto.launch.launchSite.coordinates?.longitude,
            //         launchLatitude: updateSatelliteDto.launch.launchSite.coordinates?.latitude,
            //     });
            // }
            return satellite;
        } else {
            throw new Error('Unauthorized');
        }
    }

    async remove(userId: Id, id: Id) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            const user = await this.userModel.findById(userId);
            if (user?.satellites && id) {
                // unable to implement delete/remove hook for removing satellite from user upon deleting
                user.satellites = user.satellites.filter((satelliteId) => satelliteId.toString() !== id.toString());
                await user.save();
            }
            satellite?.delete();
            this.neo4jService.write(SatelliteNeoQueries.deleteSatelliteByName, {
                satelliteName: satellite?.satelliteName,
            });
            return satellite;
        } else {
            throw new Error('Unauthorized');
        }
    }

    async createOrbit(userId: Id, id: Id, orbit: OrbitDto) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            satellite?.updateOne({ orbit: orbit }, { new: true });
            if (orbit.dateTimeOfLaunch) {
                this.neo4jService.write(SatelliteNeoQueries.updateSatelliteLaunchDate, {
                    satelliteName: satellite?.satelliteName,
                    launchDate: orbit.dateTimeOfLaunch,
                });
            }
            return satellite;
        } else {
            throw new Error('Unauthorized');
        }
    }

    async updateOrbit(userId: Id, id: Id, orbit: UpdateOrbitDto) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            satellite?.updateOne({ orbit: { ...orbit } }, { new: true });
            if (orbit.dateTimeOfLaunch) {
                this.neo4jService.write(SatelliteNeoQueries.updateSatelliteLaunchDate, {
                    satelliteName: satellite?.satelliteName,
                    launchDate: orbit.dateTimeOfLaunch,
                });
            }
            return satellite;
        } else {
            throw new Error('Unauthorized');
        }
    }

    async removeOrbit(userId: Id, id: Id) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            if (satellite?.orbit?.dateTimeOfLaunch && satellite?.orbit?.dateTimeOfLaunch > new Date()) {
                satellite?.updateOne({ $unset: { orbit: 1 } }, { new: true });
                this.neo4jService.write(SatelliteNeoQueries.removeSatelliteLaunchDate, {});
                return satellite;
            } else {
                throw new Error('Cannot remove orbit, as the satellite is already in orbit');
            }
        } else {
            throw new Error('Unauthorized');
        }
    }

    /**
     * Launch is temporarily disabled, as it has little use in the current state of the application
     * (instead an orbit now has a datetime of launch)
     * In the future it could be re-enabled, with more attributes and front-end support
     */

    /**
    async createLaunch(userId: Id, id: Id, launch: LaunchDto) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            satellite?.updateOne({ launch: launch }, { new: true });
            if (launch.launchSite) {
                this.neo4jService.write(SatelliteNeoQueries.updateSatelliteLaunchLocation, {
                    satelliteName: satellite?.satelliteName,
                    launchLongitude: launch.launchSite.coordinates?.longitude,
                    launchLatitude: launch.launchSite.coordinates?.latitude,
                });
            }
            return satellite;
        } else {
            throw new Error('Unauthorized');
        }
    }

    async updateLaunch(userId: Id, id: Id, launch: UpdateLaunchDto) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            satellite?.updateOne({ launch: { ...launch } }, { new: true });
            if (launch.launchSite) {
                this.neo4jService.write(SatelliteNeoQueries.updateSatelliteLaunchLocation, {
                    satelliteName: satellite?.satelliteName,
                    launchLongitude: launch.launchSite.coordinates?.longitude,
                    launchLatitude: launch.launchSite.coordinates?.latitude,
                });
            }
            return satellite;
        } else {
            throw new Error('Unauthorized');
        }
    }

    async removeLaunch(userId: any, id: string) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            satellite?.updateOne({ $unset: { launch: 1 } }, { new: true });
            this.neo4jService.write(SatelliteNeoQueries.removeSatelliteLaunchLocation, {});
            return satellite;
        } else {
            throw new Error('Unauthorized');
        }
    }
     */
}
