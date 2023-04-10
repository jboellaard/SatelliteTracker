import { Test } from '@nestjs/testing';

import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { disconnect, model } from 'mongoose';
import { MongoClient } from 'mongodb';
import { FeedService } from './feed.service';
import { User, UserDocument, UserSchema } from '../user/schemas/user.schema';
import { Satellite, SatelliteDocument, SatelliteSchema } from '../satellite/schemas/satellite.schema';
import { Neo4jService } from '../neo4j/neo4j.service';
import { Shape } from 'shared/domain';

describe.skip('FeedService', () => {
    let service: FeedService;
    let mongod: MongoMemoryServer;
    let mongoc: MongoClient;
    let users;

    let mockNeo4jService = {
        getReadSession: jest.fn(() => {
            return {
                beginTransaction: jest.fn(() => {
                    return {
                        run: jest.fn(),
                        commit: jest.fn(),
                        rollback: jest.fn(),
                    };
                }),
                close: jest.fn(),
            };
        }),
        read: jest.fn(),
    };

    beforeAll(async () => {
        let uri: string;
        mongod = await MongoMemoryServer.create({ instance: { dbName: `${process.env.MONGO_DATABASE}` } });
        uri = mongod.getUri();
        mongoc = new MongoClient(uri);

        const app = await Test.createTestingModule({
            providers: [
                FeedService,
                {
                    provide: getModelToken(User.name, `${process.env.MONGO_DATABASE}`),
                    useValue: model<UserDocument>('User', UserSchema),
                },
                {
                    provide: getModelToken(Satellite.name, `${process.env.MONGO_DATABASE}`),
                    useValue: model<SatelliteDocument>('Satellite', SatelliteSchema),
                },
                {
                    provide: Neo4jService,
                    useValue: mockNeo4jService,
                },
            ],
        }).compile();

        service = app.get<FeedService>(FeedService);

        await mongoc.connect();

        await mongoc
            .db(`${process.env.MONGO_DATABASE}`)
            .collection('users')
            .insertMany([
                {
                    username: 'user',
                },
                {
                    username: 'user1',
                },
            ]);
        users = await mongoc.db(`${process.env.MONGO_DATABASE}`).collection('users').find({}).toArray();

        await mongoc
            .db(`${process.env.MONGO_DATABASE}`)
            .collection('satellites')
            .insertMany([
                {
                    satelliteName: 'satellite1',
                    createdBy: users[0]._id,
                    mass: 100,
                    sizeOfBase: 100,
                    shapeOfBase: Shape.Cube,
                    colorOfBase: '#ffffff',
                },
                {
                    satelliteName: 'satellite2',
                    createdBy: users[0]._id,
                    mass: 100,
                    sizeOfBase: 100,
                    shapeOfBase: Shape.Cube,
                    colorOfBase: '#ffffff',
                },
                {
                    satelliteName: 'satellite3',
                    createdBy: users[1]._id,
                    mass: 100,
                    sizeOfBase: 100,
                    shapeOfBase: Shape.Cube,
                    colorOfBase: '#ffffff',
                },
            ]);
    });

    afterAll(async () => {
        await mongoc.close();
        await disconnect();
        await mongod.stop();
    });

    describe('Get satellites feed', () => {
        jest.setTimeout(30000);
        it('should get the most recently updated satellites', async () => {
            const trackingSatellites = [
                {
                    satelliteName: 'satellite1',
                    createdBy: 'user',
                },
                {
                    satelliteName: 'satellite2',
                    createdBy: 'user',
                },
                {
                    satelliteName: 'satellite3',
                    createdBy: 'user1',
                },
            ];

            mockNeo4jService.read = jest.fn(() => {
                return {
                    records: [
                        {
                            get: jest.fn(() => {
                                return {
                                    properties: {
                                        satelliteName: 'satellite1',
                                        createdBy: 'user',
                                    },
                                };
                            }),
                        },
                        {
                            get: jest.fn(() => {
                                return {
                                    properties: {
                                        satelliteName: 'satellite2',
                                        createdBy: 'user',
                                    },
                                };
                            }),
                        },
                        {
                            get: jest.fn(() => {
                                return {
                                    properties: {
                                        satelliteName: 'satellite3',
                                        createdBy: 'user1',
                                    },
                                };
                            }),
                        },
                    ],
                };
            });

            const result = await service.getSatellitesFeed('user');
            console.log(result);
            console.log(trackingSatellites);
        });
    });
});
