import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model, disconnect } from 'mongoose';
import { SatelliteDocument, SatelliteSchema } from './satellite.schema';
import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { Shape, getPeriod } from 'shared/domain';
import { SatellitePartDocument, SatellitePartSchema } from './satellite-part.schema';
import { UserDocument, UserSchema } from '../../user/schemas/user.schema';

describe.skip('Satellite Schema', () => {
    let mongod: MongoMemoryServer;
    let satelliteModel: Model<SatelliteDocument>;
    let satellitePartModel: Model<SatellitePartDocument>;
    let userModel: Model<UserDocument>;

    let satelliteProperties = {
        satelliteName: 'test',
        mass: 100,
        sizeOfBase: 10,
        colorOfBase: '#ffffff',
        shapeOfBase: Shape.Cube,
        purpose: 'test',
        createdBy: '5f9f1c9d9b9b9b9b9b9b9b9b',
    };

    let satellitePartProperties = [
        {
            partName: 'test',
            function: 'test',
            description: 'test',
            material: 'test',
        },
        {
            partName: 'test2',
            function: 'test2',
            description: 'test2',
            material: 'test2',
        },
    ];

    let satelliteParts;

    beforeAll(async () => {
        const app = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: async () => {
                        mongod = await MongoMemoryServer.create();
                        const uri = mongod.getUri();
                        return {
                            uri,
                        };
                    },
                }),
                MongooseModule.forFeature([{ name: 'Satellite', schema: SatelliteSchema }]),
                MongooseModule.forFeature([{ name: 'SatellitePart', schema: SatellitePartSchema }]),
                MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
            ],
        }).compile();

        satelliteModel = app.get('SatelliteModel');
        satellitePartModel = app.get('SatellitePartModel');
        userModel = app.get('UserModel');

        satelliteParts = await satellitePartModel.create(satellitePartProperties);
        const part = await satellitePartModel.create({
            partName: 'test3',
            function: 'test3',
            description: 'test3',
            dependsOn: [satelliteParts[0]._id],
        });
        satelliteParts = [...satelliteParts, part];
    });

    afterAll(async () => {
        await disconnect();
        if (mongod) await mongod.stop();
    });

    afterEach(async () => {
        if (satelliteModel) await satelliteModel.deleteMany({});
    });

    describe('validation and required fields', () => {
        it('has a required createdBy', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                createdBy: undefined,
            });
            const error = satellite.validateSync();
            expect(error.errors.createdBy).toBeInstanceOf(Error);
        });

        it('expects createdBy to be an id', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                createdBy: 'test',
            });
            const error = satellite.validateSync();
            expect(error.errors.createdBy).toBeInstanceOf(Error);

            const satellite2 = new satelliteModel(satelliteProperties);
            const error2 = satellite2.validateSync();
            expect(error2).toBeUndefined();
        });

        it('has a required satelliteName', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                satelliteName: undefined,
            });
            const error = satellite.validateSync();
            expect(error.errors.satelliteName).toBeInstanceOf(Error);
        });

        it('has a required mass', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                mass: undefined,
            });
            const error = satellite.validateSync();
            expect(error.errors.mass).toBeInstanceOf(Error);
        });

        it('has a required sizeOfBase', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                sizeOfBase: undefined,
            });
            const error = satellite.validateSync();
            expect(error.errors.sizeOfBase).toBeInstanceOf(Error);
        });

        it('has a required colorOfBase', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                colorOfBase: undefined,
            });
            const error = satellite.validateSync();
            expect(error.errors.colorOfBase).toBeInstanceOf(Error);
        });

        it('has a default value for the shapeOfBase', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                shapeOfBase: undefined,
            });
            expect(satellite.shapeOfBase).toBe(Shape.Cube);
        });

        it('has a set of allowed values for the shapeOfBase', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                shapeOfBase: 'test',
            });
            const error = satellite.validateSync();
            expect(error.errors.shapeOfBase).toBeInstanceOf(Error);
        });

        it('has a default value for the purpose', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                purpose: undefined,
            });
            expect(satellite.purpose).toBe('TBD');
        });

        it('should create if it contains all the required fields', async () => {
            const satellite = new satelliteModel(satelliteProperties);
            const error = satellite.validateSync();
            expect(error).toBeUndefined();
        });

        it('has a createdAt and updatedAt field', async () => {
            const satellite = await satelliteModel.create(satelliteProperties);
            expect(satellite.createdAt).toBeInstanceOf(Date);
            expect(satellite.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe('indexes', () => {
        it('should have a unique combination of satelliteName and createdBy', async () => {
            await satelliteModel.create(satelliteProperties);
            expect(
                new Promise((resolve) => new satelliteModel(satelliteProperties).validateSync((err) => resolve(err)))
            ).rejects.toBeInstanceOf(Error);

            const satellite3 = new satelliteModel({
                ...satelliteProperties,
                satelliteName: 'test2',
            });
            const error2 = satellite3.validateSync();
            expect(error2).toBeUndefined();

            const satellite4 = new satelliteModel({
                ...satelliteProperties,
                createdBy: '5f9f1c9d9b9b9b9b9b9b9b9c',
            });
            const error3 = satellite4.validateSync();
            expect(error3).toBeUndefined();
        });
    });

    describe('pre validate hooks', () => {
        it('should throw an error if you add more than 50 satellite parts', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                satelliteParts: new Array(51).fill({
                    satellitePart: '5f9f1c9d9b9b9b9b9b9b9b9c',
                    quantity: 1,
                    size: 1,
                    color: '#ffffff',
                }),
            });
            expect(satellite.validate).toThrow();
        });

        it('should not throw an error if you add 50 satellite parts', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                satelliteParts: new Array(50).fill({
                    satellitePart: '5f9f1c9d9b9b9b9b9b9b9b9c',
                    quantity: 1,
                    size: 1,
                    color: '#ffffff',
                }),
            });
            const error = satellite.validateSync();
            expect(error).toBeUndefined();
        });

        it('should create a satellite if all satellite parts have at least one of their dependencies', async () => {
            const satellite2 = new satelliteModel({
                ...satelliteProperties,
                satelliteParts: [
                    {
                        satellitePart: satelliteParts[1],
                        quantity: 1,
                        size: 1,
                        color: '#ffffff',
                    },
                ],
            });
            const error2 = satellite2.validateSync();
            expect(error2).toBeUndefined();
        });

        it('should throw an error if a satellitepart does not have any of its dependencies', async () => {
            const satellite = new satelliteModel({
                ...satelliteProperties,
                satelliteParts: [
                    {
                        satellitePart: satelliteParts[2],
                        quantity: 1,
                        size: 1,
                        color: '#ffffff',
                    },
                ],
            });
            expect(satellite.validate).toThrow();

            const satellite2 = new satelliteModel({
                ...satelliteProperties,
                satelliteParts: [
                    {
                        satellitePart: satelliteParts[1],
                        quantity: 1,
                        size: 1,
                        color: '#ffffff',
                    },
                ],
            });
            const error2 = satellite2.validateSync();
            expect(error2).toBeUndefined();

            const satellite3 = new satelliteModel({
                ...satelliteProperties,
                satelliteParts: [
                    {
                        satellitePart: satelliteParts[0],
                        quantity: 1,
                        size: 1,
                        color: '#ffffff',
                    },
                    {
                        satellitePart: satelliteParts[2],
                        quantity: 1,
                        size: 1,
                        color: '#ffffff',
                    },
                ],
            });
            expect(satellite3.validate).toThrow();
        });
    });

    describe('post save hooks', () => {
        it('should update the list of satellites of a user when a satellite is created', async () => {
            const user = await userModel.create({ username: 'test' });
            const satellite = await new satelliteModel({ ...satelliteProperties, createdBy: user._id }).save();
            const updatedUser = await userModel.findById(user._id);
            expect(updatedUser.satellites).toContainEqual(satellite._id);
        });
    });

    describe('virtual property', () => {
        it('should have period as virtual property when retrieving a satellite with its orbit', async () => {
            const satellite = await satelliteModel.create({
                ...satelliteProperties,
                orbit: {
                    semiMajorAxis: 1,
                    eccentricity: 0,
                    inclination: 0,
                    longitudeOfAscendingNode: 0,
                    argumentOfPerigee: 0,
                    dateTimeOfLaunch: new Date(),
                },
            });
            const satelliteWithPeriod = (await satelliteModel.findById(satellite._id)).toObject();
            expect(satelliteWithPeriod.orbit.period).toBe(
                getPeriod(satellite.orbit.semiMajorAxis * 1000) / (24 * 60 * 60)
            );
        });
    });

    describe('embedded document', () => {
        it('should populate satellitepart', async () => {
            const satellite = await satelliteModel.create({
                ...satelliteProperties,
                satelliteParts: [
                    {
                        satellitePart: satelliteParts[0]._id,
                        quantity: 1,
                        size: 1,
                        color: '#ffffff',
                    },
                ],
            });
            const satelliteWithParts = await satelliteModel
                .findById(satellite._id)
                .populate('satelliteParts.satellitePart');
            expect(satelliteWithParts.satelliteParts[0]).toHaveProperty('satellitePart');
            expect(satelliteWithParts.satelliteParts[0].satellitePart).toHaveProperty('partName');
        });
    });

    describe('schema with property of schema', () => {
        it('should reference a different satellitepart', async () => {
            const satellite = await satelliteModel.create({
                ...satelliteProperties,
                satelliteParts: [
                    {
                        satellitePart: satelliteParts[2]._id,
                        quantity: 1,
                        size: 1,
                        color: '#ffffff',
                    },
                ],
            });
            const satelliteWithParts = await satelliteModel
                .findById(satellite._id)
                .populate('satelliteParts.satellitePart')
                .populate({
                    path: 'satelliteParts.satellitePart',
                    populate: { path: 'dependsOn', model: 'SatellitePart', select: 'partName' },
                })
                .exec();
            expect(satelliteWithParts.satelliteParts[0].satellitePart.dependsOn[0].partName).toBe(
                satelliteParts[0].partName
            );
        });

        it('should should depend on a part that depends on the first part', async () => {
            satelliteParts[0].dependsOn = [satelliteParts[2]._id];
            await satelliteParts[0].save();
            const satellite = await satelliteModel.create({
                ...satelliteProperties,
                satelliteParts: [
                    {
                        satellitePart: satelliteParts[0]._id,
                        quantity: 1,
                        size: 1,
                        color: '#ffffff',
                    },
                    {
                        satellitePart: satelliteParts[2]._id,
                        quantity: 1,
                        size: 1,
                        color: '#ffffff',
                    },
                ],
            });
            const satelliteWithParts = await satelliteModel
                .findById(satellite._id)
                .populate('satelliteParts.satellitePart')
                .populate({
                    path: 'satelliteParts.satellitePart',
                    populate: { path: 'dependsOn', model: 'SatellitePart', select: 'partName' },
                })
                .exec();
            expect(satelliteWithParts.satelliteParts[0].satellitePart.dependsOn[0].partName).toBe(
                satelliteParts[2].partName
            );
            expect(satelliteWithParts.satelliteParts[1].satellitePart.dependsOn[0].partName).toBe(
                satelliteParts[0].partName
            );
        });
    });
});
