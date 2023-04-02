import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Satellite, SatelliteSchema } from '../satellite/schemas/satellite.schema';
const mockingoose = require('mockingoose');
import mongoose, { disconnect, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Identity, IdentitySchema } from './schemas/identity.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AccessJwtStrategy } from './guards/access-jwt.strategy';
import { RefreshJwtStrategy } from './guards/refresh-jwt.strategy';
import { Neo4jService } from '../neo4j/neo4j.service';

describe('AuthService', () => {
    let service: AuthService;
    let satelliteId = '5f9f1c1c1c1c1c1c1c1c1c1c';
    let mongod: MongoMemoryServer;
    let mongoc: MongoClient;
    let mongodId: MongoMemoryServer;
    let mongocId: MongoClient;

    let satelliteModel;
    let userModel;
    let identityModel;

    let mockNeo4jService = {
        getReadSession: jest.fn(),
        getWriteSession: jest.fn(),
        read: jest.fn(),
        write: jest.fn(),
    };

    // mockingoose(mongoose.model('user', UserSchema)).toReturn({}, 'findOne');
    // mockingoose(mongoose.model('satellite', SatelliteSchema)).toReturn(
    //     {
    //         _id: satelliteId,
    //         satelliteName: 'Satellite 1',
    //         description: 'Satellite 1 description',
    //         mass: 100,
    //         sizeOfBase: 100,
    //         colorOfBase: '#ffffff',
    //         shapeOfBase: Shape.Cube,
    //         purpose: 'TBD',
    //         createdBy: '5f9f1c1c1c1c1c1c1c1c1c1d',
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //         orbit: {
    //             semiMajorAxis: 10000,
    //             eccentricity: 0,
    //             inclination: 80,
    //             longitudeOfAscendingNode: 100,
    //             argumentOfPerigee: 100,
    //             dateTimeOfLaunch: new Date(),
    //             createdAt: new Date(),
    //             updatedAt: new Date(),
    //         },
    //     },
    //     'findById'
    // );
    // mockingoose.Satellite.toReturn({}, 'save');

    beforeAll(async () => {
        let uri: string;
        let uriId: string;

        const app = await Test.createTestingModule({
            imports: [JwtModule.register({})],
            // imports: [
            //     // MongooseModule.forRootAsync({
            //     //     connectionName: `${process.env.MONGO_DATABASE}`,
            //     //     useFactory: async () => {
            //     //         mongod = await MongoMemoryServer.create({
            //     //             instance: { dbName: `${process.env.MONGO_DATABASE}` },
            //     //         });
            //     //         uri = mongod.getUri();
            //     //         return { uri };
            //     //     },
            //     // }),
            //     // MongooseModule.forRootAsync({
            //     //     connectionName: `${process.env.MONGO_IDENTITYDB}`,
            //     //     useFactory: async () => {
            //     //         mongodId = await MongoMemoryServer.create({
            //     //             instance: { dbName: `${process.env.MONGO_IDENTITYDB}` },
            //     //         });
            //     //         uriId = mongodId.getUri();
            //     //         return { uri: uriId };
            //     //     },
            //     // }),
            //     // MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
            //     // MongooseModule.forFeature([{ name: Satellite.name, schema: SatelliteSchema }]),
            //     // MongooseModule.forFeature([{ name: Identity.name, schema: IdentitySchema }]),
            //     PassportModule,
            //     // JwtModule.register({}),
            // ],
            providers: [
                AuthService,
                AccessJwtStrategy,
                RefreshJwtStrategy,
                UserService,
                {
                    provide: 'MONGO_IDENTITYDB',
                    useValue: `${process.env.MONGO_IDENTITYDB}`,
                },
                {
                    provide: 'MONGO_DATABASE',
                    useValue: `${process.env.MONGO_DATABASE}`,
                },
                {
                    provide: getModelToken('User', `${process.env.MONGO_DATABASE}`),
                    useValue: mongoose.model('user', UserSchema),
                },
                {
                    provide: getModelToken('Satellite', `${process.env.MONGO_DATABASE}`),
                    useValue: mongoose.model('satellite', SatelliteSchema),
                },
                {
                    provide: getModelToken('Identity', `${process.env.MONGO_IDENTITYDB}`),
                    useValue: mongoose.model('identity', IdentitySchema),
                },
                {
                    provide: getConnectionToken(`${process.env.MONGO_DATABASE}`),
                    useValue: mongoose.connection,
                },
                {
                    provide: getConnectionToken(`${process.env.MONGO_IDENTITYDB}`),
                    useValue: mongoose.connection,
                },
                {
                    provide: Neo4jService,
                    useValue: mockNeo4jService,
                },
            ],
        }).compile();

        service = app.get<AuthService>(AuthService);

        satelliteModel = app.get<Model<Satellite>>(getModelToken('Satellite', `${process.env.MONGO_DATABASE}`));
        userModel = app.get<Model<User>>(getModelToken('User', `${process.env.MONGO_DATABASE}`));
        identityModel = app.get<Model<Identity>>(getModelToken('Identity', `${process.env.MONGO_IDENTITYDB}`));

        // mongoc = new MongoClient(uri);
        // mongocId = new MongoClient(uriId);
        // await mongoc.connect();
        // await mongocId.connect();
    });

    afterAll(async () => {
        // await mongoc.close();
        // await mongocId.close();
        // await disconnect();
        // await mongod.stop();
        // await mongodId.stop();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
