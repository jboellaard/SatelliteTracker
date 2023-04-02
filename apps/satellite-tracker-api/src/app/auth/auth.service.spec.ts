import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Satellite, SatelliteSchema } from '../satellite/schemas/satellite.schema';
import mongoose, { Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Identity, IdentitySchema } from './schemas/identity.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AccessJwtStrategy } from './guards/access-jwt.strategy';
import { RefreshJwtStrategy } from './guards/refresh-jwt.strategy';
import { Neo4jService } from '../neo4j/neo4j.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

describe('AuthService', () => {
    let service: AuthService;

    let mongod: MongoMemoryServer;
    let mongoc: MongoClient;
    let mongodId: MongoMemoryServer;
    let mongocId: MongoClient;

    let satelliteModel;
    let userModel;
    let identityModel;

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
        getWriteSession: jest.fn(() => {
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
        // getWriteSession() => {

        //     beginTransaction: {
        //         run: jest.fn(),
        //         commit: jest.fn(),
        //         rollback: jest.fn(),
        //     },
        //     close: jest.fn(),
        // },
        read: jest.fn(),
        write: jest.fn(),
    };

    const user = {
        email: 'anemail@mail.com',
        password: 'password',
        username: 'user',
    };

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create({ instance: { dbName: `${process.env.MONGO_DATABASE}` } });
        mongoc = await MongoClient.connect(mongod.getUri(), {});
        // connection = (await mongoose.connect(mongod.getUri())).connection;
        mongodId = await MongoMemoryServer.create({ instance: { dbName: `${process.env.MONGO_IDENTITYDB}` } });
        mongocId = await MongoClient.connect(mongodId.getUri(), {});
        // connectionId = (await mongoose.connect(mongodId.getUri())).connection;

        // satelliteModel = connection.model('satellite', SatelliteSchema);
        // userModel = connection.model('user', UserSchema);
        // identityModel = connectionId.model('identity', IdentitySchema);

        satelliteModel = mongoc.db(`${process.env.MONGO_DATABASE}`).collection('satellite');
        userModel = mongoc.db(`${process.env.MONGO_DATABASE}`).collection('user');
        identityModel = mongocId.db(`${process.env.MONGO_IDENTITYDB}`).collection('identity');

        const app = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: AccessJwtStrategy,
                    useValue: {
                        validate: jest.fn().mockResolvedValue(user),
                        constructor: jest.fn(),
                    },
                },
                {
                    provide: RefreshJwtStrategy,
                    useValue: {
                        validate: jest.fn().mockResolvedValue(user),
                        constructor: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('token'),
                    },
                },
                {
                    provide: getModelToken('User', `${process.env.MONGO_DATABASE}`),
                    useValue: userModel,
                },
                {
                    provide: getModelToken('Satellite', `${process.env.MONGO_DATABASE}`),
                    useValue: satelliteModel,
                },
                {
                    provide: getModelToken('Identity', `${process.env.MONGO_IDENTITYDB}`),
                    useValue: identityModel,
                },
                {
                    provide: getConnectionToken(`${process.env.MONGO_DATABASE}`),
                    useValue: mongoc,
                },
                {
                    provide: getConnectionToken(`${process.env.MONGO_IDENTITYDB}`),
                    useValue: mongocId,
                },
                {
                    provide: Neo4jService,
                    useValue: mockNeo4jService,
                },
            ],
        }).compile();

        service = app.get<AuthService>(AuthService);
    });

    afterAll(async () => {
        if (mongoc) await mongoc.close();
        if (mongod) await mongod.stop();
        if (mongocId) await mongocId.close();
        if (mongodId) await mongodId.stop();
    });

    // beforeAll(async () => {
    //     const app = await Test.createTestingModule({
    //         providers: [
    //             AuthService,
    //             {
    //                 provide: AccessJwtStrategy,
    //                 useValue: {
    //                     validate: jest.fn().mockResolvedValue(user),
    //                     constructor: jest.fn(),
    //                 },
    //             },
    //             {
    //                 provide: RefreshJwtStrategy,
    //                 useValue: {
    //                     validate: jest.fn().mockResolvedValue(user),
    //                     constructor: jest.fn(),
    //                 },
    //             },
    //             {
    //                 provide: JwtService,
    //                 useValue: {
    //                     sign: jest.fn().mockReturnValue('token'),
    //                 },
    //             },
    //             {
    //                 provide: getModelToken('User', `${process.env.MONGO_DATABASE}`),
    //                 useValue: {
    //                     create: jest.fn().mockResolvedValue({ username: user.username }),
    //                 },
    //             },
    //             {
    //                 provide: getModelToken('Satellite', `${process.env.MONGO_DATABASE}`),
    //                 useValue: mongoose.model('satellite', SatelliteSchema),
    //             },
    //             {
    //                 provide: getModelToken('Identity', `${process.env.MONGO_IDENTITYDB}`),
    //                 useValue: {
    //                     create: jest.fn().mockResolvedValue(user),
    //                 },
    //             },
    //             {
    //                 provide: getConnectionToken(`${process.env.MONGO_DATABASE}`),
    //                 useValue: {
    //                     startSession: {
    //                         startTransaction: jest.fn(),
    //                         commitTransaction: jest.fn(),
    //                         abortTransaction: jest.fn(),
    //                         endSession: jest.fn(),
    //                     },
    //                 },
    //             },
    //             {
    //                 provide: getConnectionToken(`${process.env.MONGO_IDENTITYDB}`),
    //                 useValue: {
    //                     startSession: {
    //                         startTransaction: jest.fn(),
    //                         commitTransaction: jest.fn(),
    //                         abortTransaction: jest.fn(),
    //                         endSession: jest.fn(),
    //                     },
    //                 },
    //             },
    //             {
    //                 provide: Neo4jService,
    //                 useValue: mockNeo4jService,
    //             },
    //         ],
    //     }).compile();

    //     service = app.get<AuthService>(AuthService);

    //     satelliteModel = app.get<Model<Satellite>>(getModelToken('Satellite', `${process.env.MONGO_DATABASE}`));
    //     userModel = app.get<Model<User>>(getModelToken('User', `${process.env.MONGO_DATABASE}`));
    //     identityModel = app.get<Model<Identity>>(getModelToken('Identity', `${process.env.MONGO_IDENTITYDB}`));
    // });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should register a new user', async () => {
        const user = {
            email: 'anemail@mail.com',
            password: 'password',
            username: 'test',
        };

        const result = await service.registerUser(user);
        expect(result).toBeDefined();
    });
});
