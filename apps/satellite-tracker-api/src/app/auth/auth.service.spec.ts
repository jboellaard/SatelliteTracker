import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { AccessJwtStrategy } from './guards/access-jwt.strategy';
import { RefreshJwtStrategy } from './guards/refresh-jwt.strategy';
import { Neo4jService } from '../neo4j/neo4j.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

class UserModel {
    constructor() {
        /* test constructor */
    }
    save = jest.fn().mockResolvedValue({});
    static create = jest.fn().mockResolvedValue({});
}

class SatelliteModel {
    constructor() {
        /* test constructor */
    }
    save = jest.fn();
    static create = jest.fn();
}

class IdentityModel {
    constructor() {
        /* test constructor */
    }
    save = jest.fn();
    static create = jest.fn();
}

describe('AuthService', () => {
    let service: AuthService;

    let mongod: MongoMemoryServer;
    let mongoc: MongoClient;
    let mongodId: MongoMemoryServer;
    let mongocId: MongoClient;

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
        mongodId = await MongoMemoryServer.create({ instance: { dbName: `${process.env.MONGO_IDENTITYDB}` } });
        mongocId = await MongoClient.connect(mongodId.getUri(), {});

        const app: TestingModule = await Test.createTestingModule({
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
                    useValue: UserModel,
                },
                {
                    provide: getModelToken('Satellite', `${process.env.MONGO_DATABASE}`),
                    useValue: SatelliteModel,
                },
                {
                    provide: getModelToken('Identity', `${process.env.MONGO_IDENTITYDB}`),
                    useValue: IdentityModel,
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
        expect(result).toHaveProperty('status', 201);
    });
});
