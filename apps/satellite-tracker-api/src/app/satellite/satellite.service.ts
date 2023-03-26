import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { SatelliteDto, UpdateSatelliteDto } from './dto/satellite.dto';
import { APIResult, Id, ISatellite, ISatellitePart, IUser } from 'shared/domain';
import { Satellite, SatellitePart } from './schemas/satellite.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { SatelliteNeoQueries } from './neo4j/satellite.cypher';
import { Neo4jService } from '../neo4j/neo4j.service';
import { OrbitDto, UpdateOrbitDto } from './dto/orbit.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class SatelliteService {
    private logger = new Logger(SatelliteService.name);

    constructor(
        @InjectModel(User.name, `${process.env.MONGO_DATABASE}`) private userModel: Model<UserDocument>,
        @InjectModel(Satellite.name, `${process.env.MONGO_DATABASE}`) private satelliteModel: Model<Satellite>,
        @InjectModel(SatellitePart.name, `${process.env.MONGO_DATABASE}`)
        private satellitePartModel: Model<SatellitePart>,
        @InjectConnection(`${process.env.MONGO_DATABASE}`) private connection: mongoose.Connection,
        private readonly neo4jService: Neo4jService,
        private userService: UserService
    ) {}

    async create(username: string, newSatellite: SatelliteDto): Promise<APIResult<ISatellite>> {
        const stSession = await this.connection.startSession();
        const neo4jSession = this.neo4jService.getWriteSession();

        stSession.startTransaction();
        const transaction = neo4jSession.beginTransaction();
        try {
            const newSatelliteModel = new this.satelliteModel(newSatellite);
            let satellite = await newSatelliteModel.save({ session: stSession });
            try {
                await transaction.run(SatelliteNeoQueries.addSatellite, {
                    satelliteName: newSatellite.satelliteName,
                    username: username,
                });
                if (newSatellite.orbit?.dateTimeOfLaunch) {
                    await transaction.run(SatelliteNeoQueries.updateSatelliteLaunchDate, {
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

            let result = {
                ...satellite.toObject(),
                createdBy: username,
                id: satellite._id.toString(),
                _id: satellite._id.toString(),
            };
            return { status: HttpStatus.CREATED, result };
        } catch (error) {
            this.logger.error(error);
            await stSession.abortTransaction();
            this.logger.error('Rolled back transaction for creating satellite');
            if (error instanceof Error) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            throw new HttpException('Could not create satellite', HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await Promise.all([stSession.endSession(), neo4jSession.close()]);
        }
    }

    async findAll(): Promise<APIResult<ISatellite[]>> {
        let satellites = await this.satelliteModel
            .find()
            .populate('createdBy', 'username')
            .populate('satelliteParts.satellitePart')
            .exec();
        let result = satellites.map((satellite) => {
            return {
                ...satellite.toObject(),
                id: satellite._id.toString(),
                _id: satellite._id.toString(),
                createdBy: (satellite.createdBy as any).username,
            };
        });
        return { status: HttpStatus.OK, result };
    }

    async findOne(id: Id): Promise<APIResult<ISatellite>> {
        let satellite = await this.satelliteModel
            .findById(id)
            .populate('createdBy', 'username')
            .populate('satelliteParts.satellitePart')
            .populate({
                path: 'satelliteParts.satellitePart',
                populate: { path: 'dependsOn', model: 'SatellitePart', select: 'partName' },
            })
            .exec();
        if (satellite) {
            let result = {
                ...satellite.toObject(),
                _id: satellite._id.toString(),
                id: satellite._id.toString(),
                createdBy: (satellite.createdBy as any).username,
            };

            return { status: HttpStatus.OK, result };
        } else {
            throw new HttpException('Satellite not found', HttpStatus.NOT_FOUND);
        }
    }

    async getSatellitesOfUserWithId(id: Id): Promise<APIResult<ISatellite[]>> {
        let satellites = await this.satelliteModel
            .find({ createdBy: id })
            .populate('satelliteParts.satellitePart')
            .exec();
        let result = satellites.map((satellite) => {
            return {
                ...satellite.toObject(),
                id: satellite._id.toString(),
                _id: satellite._id.toString(),
            };
        });
        return { status: HttpStatus.OK, result };
    }

    async getSatellitesOfUserWithUsername(username: string): Promise<APIResult<ISatellite[]>> {
        const user = await this.userModel.findOne({ username }).exec();
        let satellites = await this.satelliteModel
            .find({ createdBy: user._id })
            .populate('satelliteParts.satellitePart')
            .exec();
        let result = satellites.map((satellite) => {
            return {
                ...satellite.toObject(),
                id: satellite._id.toString(),
                _id: satellite._id.toString(),
            };
        });
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return { status: HttpStatus.OK, result };
    }

    async update(userId: Id, id: Id, updateSatelliteDto: UpdateSatelliteDto): Promise<APIResult<ISatellite>> {
        const satellite = await this.satelliteModel.findById(id).exec();
        if (satellite?.createdBy?.toString() == userId) {
            const stSession = await this.connection.startSession();
            const neo4jSession = this.neo4jService.getWriteSession();
            stSession.startTransaction();
            const transaction = neo4jSession.beginTransaction();
            try {
                try {
                    if (updateSatelliteDto.orbit?.dateTimeOfLaunch) {
                        await transaction.run(SatelliteNeoQueries.updateSatelliteLaunchDate, {
                            satelliteName: satellite?.satelliteName,
                            launchDate: updateSatelliteDto.orbit.dateTimeOfLaunch,
                        });
                    }
                    if (updateSatelliteDto.satelliteName) {
                        await transaction.run(SatelliteNeoQueries.updateSatelliteName, {
                            satelliteName: satellite?.satelliteName,
                            newSatelliteName: updateSatelliteDto.satelliteName,
                        });
                    }
                } catch (error) {
                    await transaction.rollback();
                    if (error instanceof Error) throw new Error(error.message);
                    throw new Error('Could not update satellite');
                }

                updateSatelliteDto.createdBy = satellite.createdBy.toString();
                let updatedSatellite = await this.satelliteModel
                    .findByIdAndUpdate(id, { ...updateSatelliteDto }, { session: stSession, new: true })
                    .exec();

                await transaction.commit();
                await stSession.commitTransaction();

                let result = {
                    ...updatedSatellite.toObject(),
                    id: updatedSatellite._id.toString(),
                    _id: updatedSatellite._id.toString(),
                };
                return { status: HttpStatus.OK, result };
            } catch (error) {
                await stSession.abortTransaction();
                if (error instanceof Error) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
                throw new HttpException('Could not update satellite', HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
                await Promise.all([stSession.endSession(), neo4jSession.close()]);
            }
        } else {
            throw new HttpException('You are not authorized to update this satellite', HttpStatus.UNAUTHORIZED);
        }
    }

    async remove(userId: Id, id: Id): Promise<APIResult<any>> {
        const satellite = await this.satelliteModel.findById(id).exec();
        if (satellite?.createdBy?.toString() == userId) {
            const stSession = await this.connection.startSession();
            const neo4jSession = this.neo4jService.getWriteSession();
            stSession.startTransaction();
            const transaction = neo4jSession.beginTransaction();
            try {
                const user = await this.userModel.findById(userId).exec();
                if (user?.satellites && id) {
                    // unable to implement delete/remove hook for removing satellite from user upon deleting
                    user.satellites = user.satellites.filter((satelliteId) => satelliteId.toString() !== id.toString());
                    await user.save({ session: stSession });
                }
                satellite?.delete({ session: stSession });
                try {
                    await transaction.run(SatelliteNeoQueries.deleteSatelliteByName, {
                        satelliteName: satellite?.satelliteName,
                    });
                } catch (error) {
                    transaction.rollback();
                    if (error instanceof Error) throw new Error(error.message);
                    throw new Error('Could not delete satellite');
                }
                await transaction.commit();
                await stSession.commitTransaction();

                let result = {
                    ...satellite?.toObject(),
                    id: satellite?._id.toString(),
                    _id: satellite._id.toString(),
                };
                return { status: HttpStatus.OK, result };
            } catch (error) {
                await stSession.abortTransaction();
                if (error instanceof Error) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
                throw new HttpException('Could not delete satellite', HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
                await Promise.all([stSession.endSession(), neo4jSession.close()]);
            }
        } else {
            throw new HttpException('You are not authorized to delete this satellite', HttpStatus.UNAUTHORIZED);
        }
    }

    async getAllSatelliteParts(): Promise<APIResult<ISatellitePart[]>> {
        let satelliteParts = await this.satellitePartModel.find().populate('dependsOn').exec();
        let result = satelliteParts.map((satellitePart) => {
            return {
                ...satellitePart.toObject(),
                id: satellitePart._id.toString(),
                _id: satellitePart._id.toString(),
            };
        });

        return { status: HttpStatus.OK, result };
    }

    async getSatellitePart(id: Id): Promise<APIResult<ISatellitePart>> {
        const satellitePart = await this.satellitePartModel.findById(id).exec();
        let result = {
            ...satellitePart.toObject(),
            id: satellitePart._id.toString(),
            _id: satellitePart._id.toString(),
        };
        return { status: HttpStatus.OK, result };
    }

    async createOrbit(userId: Id, id: Id, orbit: OrbitDto): Promise<APIResult<ISatellite>> {
        const satellite = await this.satelliteModel.findById(id).exec();
        if (satellite?.createdBy?.toString() == userId) {
            const stSession = await this.connection.startSession();
            stSession.startTransaction();
            try {
                const updatedSatellite = await this.satelliteModel
                    .findByIdAndUpdate(id, { orbit: orbit }, { session: stSession, new: true })
                    .exec();
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

                let result = {
                    ...updatedSatellite.toObject(),
                    id: updatedSatellite._id.toString(),
                    _id: updatedSatellite._id.toString(),
                };
                return { status: HttpStatus.OK, result };
            } catch (error) {
                await stSession.abortTransaction();
                if (error instanceof Error) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
                throw new HttpException('Could not create orbit', HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
                await stSession.endSession();
            }
        } else {
            throw new HttpException(
                'You are not authorized to create an orbit for this satellite',
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    async updateOrbit(userId: Id, id: Id, orbit: UpdateOrbitDto): Promise<APIResult<ISatellite>> {
        const satellite = await this.satelliteModel.findById(id).exec();
        if (satellite?.createdBy?.toString() == userId) {
            const stSession = await this.connection.startSession();
            stSession.startTransaction();
            try {
                let $valuesToUpdate = {};
                for (const [key, value] of Object.entries(orbit)) {
                    $valuesToUpdate['orbit.' + key] = value;
                }

                const updatedSatellite = await this.satelliteModel
                    .findByIdAndUpdate(id, { $set: $valuesToUpdate }, { session: stSession, new: true })
                    .exec();
                if (orbit.dateTimeOfLaunch) {
                    const neo4jSession = this.neo4jService.getWriteSession();
                    const transaction = neo4jSession.beginTransaction();
                    try {
                        await transaction.run(SatelliteNeoQueries.updateSatelliteLaunchDate, {
                            satelliteName: satellite?.satelliteName,
                            launchDate: orbit.dateTimeOfLaunch,
                        });
                    } catch (error) {
                        await transaction.rollback();
                        if (error instanceof Error) throw new Error(error.message);
                        throw new Error('Could not update orbit');
                    }
                    await transaction.commit();
                    await neo4jSession.close();
                }

                await stSession.commitTransaction();
                let result = {
                    ...updatedSatellite.toObject(),
                    id: updatedSatellite._id.toString(),
                    _id: updatedSatellite._id.toString(),
                };
                return { status: HttpStatus.OK, result };
            } catch (error) {
                await stSession.abortTransaction();
                if (error instanceof Error) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
                throw new HttpException('Could not update orbit', HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
                await stSession.endSession();
            }
        } else {
            throw new HttpException('You are not authorized to update this orbit', HttpStatus.UNAUTHORIZED);
        }
    }

    async removeOrbit(userId: Id, id: Id): Promise<APIResult<ISatellite>> {
        const satellite = await this.satelliteModel.findById(id).exec();
        if (satellite?.createdBy?.toString() == userId) {
            const stSession = await this.connection.startSession();
            stSession.startTransaction();
            try {
                const updatedSatellite = await this.satelliteModel
                    .findByIdAndUpdate(id, { $unset: { orbit: 1 } }, { session: stSession, new: true })
                    .exec();
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
                let result = {
                    ...updatedSatellite.toObject(),
                    id: updatedSatellite._id.toString(),
                    _id: updatedSatellite._id.toString(),
                };
                return { status: HttpStatus.OK, result };
            } catch (error) {
                await stSession.abortTransaction();
                if (error instanceof Error) throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
                throw new HttpException('Could not remove orbit', HttpStatus.INTERNAL_SERVER_ERROR);
            } finally {
                await stSession.endSession();
            }
        } else {
            throw new HttpException('You are not authorized to remove this orbit', HttpStatus.UNAUTHORIZED);
        }
    }

    async getTrackers(id: Id): Promise<APIResult<IUser[]>> {
        const satellite = await this.satelliteModel.findById(id).populate('createdBy').exec();
        if (satellite) {
            try {
                const result = await this.neo4jService.read(SatelliteNeoQueries.getTrackers, {
                    satelliteName: satellite.satelliteName,
                    creator: eval(satellite.createdBy).username,
                });
                const trackers = result.records.map((record) => {
                    return { username: record.get('tracker').properties.username };
                });
                return { status: HttpStatus.OK, result: trackers };
            } catch (error) {
                if (error instanceof Error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
                throw new HttpException('Could not get trackers', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            throw new HttpException('Could not find satellite', HttpStatus.NOT_FOUND);
        }
    }

    async trackSatellite(username: string, id: Id): Promise<APIResult<ISatellite[]>> {
        const satellite = await this.satelliteModel.findById(id).populate('createdBy').exec();
        if (satellite) {
            const createdBy = eval(satellite.createdBy);
            try {
                const result = await this.neo4jService.write(SatelliteNeoQueries.trackSatellite, {
                    username,
                    creator: createdBy.username,
                    satelliteName: satellite.satelliteName,
                });
                if (result.summary.counters.updates().relationshipsCreated == 0)
                    throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
                return this.userService.getUserTracking(username);
            } catch (error) {
                if (error instanceof Error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
                throw new HttpException('Could not track satellite', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            throw new HttpException('Could not find satellite', HttpStatus.NOT_FOUND);
        }
    }

    async untrackSatellite(username: string, id: Id): Promise<APIResult<ISatellite[]>> {
        const satellite = await this.satelliteModel.findById(id).populate('createdBy').exec();
        if (satellite) {
            const createdBy = eval(satellite.createdBy);
            try {
                const result = await this.neo4jService.write(SatelliteNeoQueries.untrackSatellite, {
                    username,
                    creator: createdBy.username,
                    satelliteName: satellite.satelliteName,
                });
                if (result.summary.counters.updates().relationshipsDeleted == 0)
                    throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
                return this.userService.getUserTracking(username);
            } catch (error) {
                if (error instanceof Error) throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
                throw new HttpException('Could not track satellite', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            throw new HttpException('Could not find satellite', HttpStatus.NOT_FOUND);
        }
    }
}
