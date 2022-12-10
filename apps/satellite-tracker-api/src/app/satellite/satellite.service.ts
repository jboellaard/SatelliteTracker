import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { SatelliteDto, UpdateSatelliteDto } from './dto/satellite.dto';
import { Id } from 'shared/domain';
import { Satellite, SatellitePart } from './schemas/satellite.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
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
        @InjectModel(SatellitePart.name, 'satellitetrackerdb') private satellitePartModel: Model<SatellitePart>,
        @InjectConnection('satellitetrackerdb') private connection: mongoose.Connection,
        private readonly neo4jService: Neo4jService
    ) {}

    async create(username: string, newSatellite: SatelliteDto) {
        const stSession = await this.connection.startSession();
        const neo4jSession = this.neo4jService.getWriteSession();

        stSession.startTransaction();
        const transaction = neo4jSession.beginTransaction();
        try {
            const newSatelliteModel = new this.satelliteModel(newSatellite);
            const satellite = await newSatelliteModel.save({ session: stSession });
            try {
                transaction.run(SatelliteNeoQueries.addSatellite, {
                    satelliteName: newSatellite.satelliteName,
                    username: username,
                });
                if (newSatellite.orbit?.dateTimeOfLaunch) {
                    this.neo4jService.write(SatelliteNeoQueries.updateSatelliteLaunchDate, {
                        satelliteName: newSatellite.satelliteName,
                        launchDate: newSatellite.orbit.dateTimeOfLaunch,
                    });
                }
            } catch (error) {
                transaction.rollback();
                if (error instanceof Error) throw new Error(error.message);
                throw new Error('Could not add satellite');
            }

            await transaction.commit();
            await stSession.commitTransaction();
            return satellite;
        } catch (error) {
            this.logger.error(error);
            await stSession.abortTransaction();
            this.logger.error('Rolled back transaction for creating satellite');
            if (error instanceof Error) return new HttpException(error.message, HttpStatus.BAD_REQUEST);
            return new HttpException('Could not create satellite', HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await Promise.all([stSession.endSession(), neo4jSession.close()]);
        }
    }

    async findAll() {
        return await this.satelliteModel
            .find()
            .populate('createdById', 'username')
            .populate('satelliteParts.satellitePart');
    }

    async findOne(id: Id) {
        const satellite = await this.satelliteModel
            .findById(id)
            .populate('createdById', 'username')
            .populate('satelliteParts.satellitePart');
        if (satellite) {
            return satellite;
        } else {
            return new HttpException('Satellite not found', HttpStatus.NOT_FOUND);
        }
    }

    async getSatellitesOfUserWithId(id: Id) {
        return await this.satelliteModel.find({ createdBy: id }).populate('satelliteParts.satellitePart');
    }

    async update(userId: Id, id: Id, updateSatelliteDto: UpdateSatelliteDto) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            const stSession = await this.connection.startSession();
            const neo4jSession = this.neo4jService.getWriteSession();
            stSession.startTransaction();
            const transaction = neo4jSession.beginTransaction();
            try {
                try {
                    if (updateSatelliteDto.orbit?.dateTimeOfLaunch) {
                        transaction.run(SatelliteNeoQueries.updateSatelliteLaunchDate, {
                            satelliteName: satellite?.satelliteName,
                            launchDate: updateSatelliteDto.orbit.dateTimeOfLaunch,
                        });
                    }
                    if (updateSatelliteDto.satelliteName) {
                        transaction.run(SatelliteNeoQueries.updateSatelliteName, {
                            satelliteName: satellite?.satelliteName,
                            newSatelliteName: updateSatelliteDto.satelliteName,
                        });
                    }
                    // if (updateSatelliteDto.launch?.launchSite) {
                    //     transaction.run(SatelliteNeoQueries.updateSatelliteLaunchLocation, {
                    //         satelliteName: satellite?.satelliteName,
                    //         launchLongitude: updateSatelliteDto.launch.launchSite.coordinates?.longitude,
                    //         launchLatitude: updateSatelliteDto.launch.launchSite.coordinates?.latitude,
                    //     });
                    // }
                } catch (error) {
                    transaction.rollback();
                    if (error instanceof Error) throw new Error(error.message);
                    throw new Error('Could not update satellite');
                }

                const updatedSatellite = await this.satelliteModel.findByIdAndUpdate(
                    id,
                    { ...updateSatelliteDto },
                    { session: stSession, new: true }
                );

                await transaction.commit();
                await stSession.commitTransaction();
                return updatedSatellite;
            } catch (error) {
                await stSession.abortTransaction();
                if (error instanceof Error) return new HttpException(error.message, HttpStatus.BAD_REQUEST);
                return new HttpException('Could not update satellite', HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
                await Promise.all([stSession.endSession(), neo4jSession.close()]);
            }
        } else {
            return new HttpException('You are not authorized to update this satellite', HttpStatus.UNAUTHORIZED);
        }
    }

    async remove(userId: Id, id: Id) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            const stSession = await this.connection.startSession();
            const neo4jSession = this.neo4jService.getWriteSession();
            stSession.startTransaction();
            const transaction = neo4jSession.beginTransaction();
            try {
                const user = await this.userModel.findById(userId);
                if (user?.satellites && id) {
                    // unable to implement delete/remove hook for removing satellite from user upon deleting
                    user.satellites = user.satellites.filter((satelliteId) => satelliteId.toString() !== id.toString());
                    await user.save({ session: stSession });
                }
                satellite?.delete({ session: stSession });
                try {
                    transaction.run(SatelliteNeoQueries.deleteSatelliteByName, {
                        satelliteName: satellite?.satelliteName,
                    });
                } catch (error) {
                    transaction.rollback();
                    if (error instanceof Error) throw new Error(error.message);
                    throw new Error('Could not delete satellite');
                }
                await transaction.commit();
                await stSession.commitTransaction();
                return satellite;
            } catch {
                stSession.abortTransaction();
                throw new Error('Could not delete satellite');
            } finally {
                await Promise.all([stSession.endSession(), neo4jSession.close()]);
            }
        } else {
            throw new Error('Unauthorized');
        }
    }

    async getAllSatelliteParts() {
        return await this.satellitePartModel.find().populate('dependsOn');
    }

    async getSatellitePart(id: Id) {
        return await this.satellitePartModel.findById(id);
    }

    async createOrbit(userId: Id, id: Id, orbit: OrbitDto) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            const stSession = await this.connection.startSession();
            stSession.startTransaction();
            try {
                const updatedSatellite = await this.satelliteModel.findByIdAndUpdate(
                    id,
                    { orbit: orbit },
                    { session: stSession, new: true }
                );
                if (orbit.dateTimeOfLaunch) {
                    const neo4jSession = this.neo4jService.getWriteSession();
                    const transaction = neo4jSession.beginTransaction();
                    try {
                        transaction.run(SatelliteNeoQueries.updateSatelliteLaunchDate, {
                            satelliteName: satellite?.satelliteName,
                            launchDate: orbit.dateTimeOfLaunch,
                        });
                    } catch (error) {
                        transaction.rollback();
                        if (error instanceof Error) throw new Error(error.message);
                        throw new Error('Could not create orbit');
                    }
                    await transaction.commit();
                    await neo4jSession.close();
                }

                await stSession.commitTransaction();
                return updatedSatellite;
            } catch (error) {
                stSession.abortTransaction();
                if (error instanceof Error) return new HttpException(error.message, HttpStatus.BAD_REQUEST);
                return new HttpException('Could not create orbit', HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
                await stSession.endSession();
            }
        } else {
            return new HttpException(
                'You are not authorized to create an orbit for this satellite',
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    async updateOrbit(userId: Id, id: Id, orbit: UpdateOrbitDto) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            const stSession = await this.connection.startSession();
            stSession.startTransaction();
            try {
                const updatedSatellite = await this.satelliteModel.findByIdAndUpdate(
                    id,
                    { orbit: orbit },
                    { session: stSession, new: true }
                );
                if (orbit.dateTimeOfLaunch) {
                    const neo4jSession = this.neo4jService.getWriteSession();
                    const transaction = neo4jSession.beginTransaction();
                    try {
                        transaction.run(SatelliteNeoQueries.updateSatelliteLaunchDate, {
                            satelliteName: satellite?.satelliteName,
                            launchDate: orbit.dateTimeOfLaunch,
                        });
                    } catch (error) {
                        transaction.rollback();
                        if (error instanceof Error) throw new Error(error.message);
                        throw new Error('Could not update orbit');
                    }
                    await transaction.commit();
                    await neo4jSession.close();
                }

                await stSession.commitTransaction();
                return updatedSatellite;
            } catch (error) {
                stSession.abortTransaction();
                if (error instanceof Error) return new HttpException(error.message, HttpStatus.BAD_REQUEST);
                return new HttpException('Could not update orbit', HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
                await stSession.endSession();
            }
        } else {
            return new HttpException('You are not authorized to update this orbit', HttpStatus.UNAUTHORIZED);
        }
    }

    async removeOrbit(userId: Id, id: Id) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdById?.toString() == userId) {
            const stSession = await this.connection.startSession();
            stSession.startTransaction();
            try {
                const updatedSatellite = await this.satelliteModel.findByIdAndUpdate(
                    id,
                    { $unset: { orbit: 1 } },
                    { session: stSession, new: true }
                );
                const neo4jSession = this.neo4jService.getWriteSession();
                const transaction = neo4jSession.beginTransaction();
                try {
                    transaction.run(SatelliteNeoQueries.removeSatelliteLaunchDate, {});
                } catch (error) {
                    transaction.rollback();
                    if (error instanceof Error) throw new Error(error.message);
                    throw new Error('Could not remove orbit');
                }
                await transaction.commit();
                await neo4jSession.close();

                await stSession.commitTransaction();
                return updatedSatellite;
            } catch (error) {
                stSession.abortTransaction();
                if (error instanceof Error) return new HttpException(error.message, HttpStatus.BAD_REQUEST);
                return new HttpException('Could not remove orbit', HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
                await stSession.endSession();
            }
        } else {
            return new HttpException('You are not authorized to remove this orbit', HttpStatus.UNAUTHORIZED);
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
