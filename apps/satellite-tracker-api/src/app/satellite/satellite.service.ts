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
        @InjectModel(User.name, `${process.env.MONGO_DATABASE}`) private userModel: Model<UserDocument>,
        @InjectModel(Satellite.name, `${process.env.MONGO_DATABASE}`) private satelliteModel: Model<Satellite>,
        @InjectModel(SatellitePart.name, `${process.env.MONGO_DATABASE}`)
        private satellitePartModel: Model<SatellitePart>,
        @InjectConnection(`${process.env.MONGO_DATABASE}`) private connection: mongoose.Connection,
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
            return { status: HttpStatus.CREATED, result: satellite };
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
        const satellites = await this.satelliteModel
            .find()
            .populate('createdBy', 'username')
            .populate('satelliteParts.satellitePart');
        return { status: HttpStatus.OK, result: satellites };
    }

    async findOne(id: Id) {
        const satellite = await this.satelliteModel.findById(id).populate('satelliteParts.satellitePart');
        if (satellite) {
            return { status: HttpStatus.OK, result: satellite };
        } else {
            return new HttpException('Satellite not found', HttpStatus.NOT_FOUND);
        }
    }

    async getSatellitesOfUserWithId(id: Id) {
        const satellites = await this.satelliteModel.find({ createdBy: id }).populate('satelliteParts.satellitePart');
        return { status: HttpStatus.OK, result: satellites };
    }

    async getSatellitesOfUserWithUsername(username: string) {
        const user = await this.userModel.findOne({ username });
        const satellites = await this.satelliteModel
            .find({ createdBy: user._id })
            .populate('satelliteParts.satellitePart');
        return { status: HttpStatus.OK, result: satellites };
    }

    async update(userId: Id, id: Id, updateSatelliteDto: UpdateSatelliteDto) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdBy?.toString() == userId) {
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
                return { status: HttpStatus.OK, result: updatedSatellite };
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
        if (satellite?.createdBy?.toString() == userId) {
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
                return { status: HttpStatus.OK, result: satellite };
            } catch (error) {
                await stSession.abortTransaction();
                if (error instanceof Error) return new HttpException(error.message, HttpStatus.BAD_REQUEST);
                return new HttpException('Could not delete satellite', HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
                await Promise.all([stSession.endSession(), neo4jSession.close()]);
            }
        } else {
            throw new HttpException('You are not authorized to delete this satellite', HttpStatus.UNAUTHORIZED);
        }
    }

    async getAllSatelliteParts() {
        const satelliteParts = await this.satellitePartModel.find().populate('dependsOn');
        return { status: HttpStatus.OK, result: satelliteParts };
    }

    async getSatellitePart(id: Id) {
        const satellitePart = await this.satellitePartModel.findById(id);
        return { status: HttpStatus.OK, result: satellitePart };
    }

    async createOrbit(userId: Id, id: Id, orbit: OrbitDto) {
        const satellite = await this.satelliteModel.findById(id);
        if (satellite?.createdBy?.toString() == userId) {
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
                return { status: HttpStatus.OK, result: updatedSatellite };
            } catch (error) {
                await stSession.abortTransaction();
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
        if (satellite?.createdBy?.toString() == userId) {
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
                return { status: HttpStatus.OK, result: updatedSatellite };
            } catch (error) {
                await stSession.abortTransaction();
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
        if (satellite?.createdBy?.toString() == userId) {
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
                    transaction.run(SatelliteNeoQueries.removeSatelliteLaunchDate, {
                        satelliteName: satellite?.satelliteName,
                    });
                } catch (error) {
                    transaction.rollback();
                    if (error instanceof Error) throw new Error(error.message);
                    throw new Error('Could not remove orbit');
                }
                await transaction.commit();
                await neo4jSession.close();

                await stSession.commitTransaction();
                return { status: HttpStatus.OK, result: updatedSatellite };
            } catch (error) {
                await stSession.abortTransaction();
                if (error instanceof Error) return new HttpException(error.message, HttpStatus.BAD_REQUEST);
                return new HttpException('Could not remove orbit', HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
                await stSession.endSession();
            }
        } else {
            return new HttpException('You are not authorized to remove this orbit', HttpStatus.UNAUTHORIZED);
        }
    }

    async trackSatellite(username: string, id: Id) {
        const satellite = await this.satelliteModel.findById(id).populate('createdBy');
        if (satellite) {
            const createdBy = eval(satellite.createdBy);
            try {
                const result = await this.neo4jService.write(SatelliteNeoQueries.trackSatellite, {
                    username,
                    createdBy: createdBy.username,
                    satelliteName: satellite.satelliteName,
                });
                console.log(result);
                return { status: HttpStatus.OK, result: { message: 'Satellite tracked.' } };
            } catch (error) {
                if (error instanceof Error) return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
                return new HttpException('Could not track satellite', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            return new HttpException('Could not find satellite', HttpStatus.NOT_FOUND);
        }
    }

    async untrackSatellite(username: string, id: Id) {
        const satellite = await this.satelliteModel.findById(id).populate('createdBy');
        if (satellite) {
            const createdBy = eval(satellite.createdBy);
            try {
                const result = await this.neo4jService.write(SatelliteNeoQueries.untrackSatellite, {
                    username,
                    createdBy: createdBy.username,
                    satelliteName: satellite.satelliteName,
                });
                console.log(result);
                return { status: HttpStatus.OK, result: { message: 'No longer tracking this satellite' } };
            } catch (error) {
                if (error instanceof Error) return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
                return new HttpException('Could not track satellite', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            return new HttpException('Could not find satellite', HttpStatus.NOT_FOUND);
        }
    }
}
