// testing jwt guards, tokens and role-based (returning items based on token username)

//
import mongoose, { disconnect } from 'mongoose';
import { AppModule } from '../src/app/app.module';
import { getPeriod } from 'shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoClient } from 'mongodb';
import { Neo4jService } from './app/neo4j/neo4j.service';
import { Neo4jModule } from './app/neo4j/neo4j.module';

describe('Satellite tracker API e2e tests', () => {
    let app: INestApplication;
    let neo4jService: Neo4jService;
    let users;
    let satellites;

    let db;
    let iddb;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule, Neo4jModule],
        }).compile();

        neo4jService = moduleFixture.get<Neo4jService>(Neo4jService);

        app = moduleFixture.createNestApplication();
        await app.init();

        const dbConnection = await MongoClient.connect(
            `${process.env.MONGO_CONN}/${process.env.MONGO_DATABASE}${process.env.MONGO_OPTIONS}`
        );
        db = dbConnection.db(process.env.MONGO_DATABASE);

        const iddbConnection = await MongoClient.connect(
            `${process.env.MONGO_CONN}/${process.env.MONGO_IDENTITYDB}${process.env.MONGO_OPTIONS}`
        );
        iddb = iddbConnection.db(process.env.MONGO_IDENTITYDB);

        users = await db.collection('users').find().toArray();
        satellites = await db.collection('satellites').find().toArray();
    });

    beforeEach(async () => {});

    afterAll(async () => {
        if (iddb) await iddb.dropDatabase();
        if (db) await db.dropDatabase();
        await neo4jService.write('MATCH (n) DETACH DELETE n', {});

        await disconnect();
        await app.close();
    });

    describe('Transactions', () => {
        it('should add a user to all databases', async () => {
            const user = {
                username: 'newuser',
                password: 'password',
            };
            const { status, body } = await request(app.getHttpServer()).post('/register').send(user);

            expect(status).toBe(201);
            expect(body.result).toBeDefined();
            expect(body.result.username).toBe('newuser');

            const createdUser = await db.collection('users').findOne({ username: user.username });
            expect(user).toBeDefined();
            expect(user.username).toBe('newuser');

            neo4jService
                .read('MATCH (u:User {username: $username}) RETURN u', { username: user.username })
                .then((result) => {
                    expect(result.records.length).toBe(1);
                    result.records.map((record) => {
                        expect(record.get('u').properties.username).toBe('newuser');
                    });
                });
        });

        it('should return a user', async () => {
            const { status, body } = await request(app.getHttpServer()).get(`/users/${users[0].username}`);
            expect(status).toBe(200);
            expect(body.result).toBeDefined();
        });

        it('should return a satellite with a virtual property', async () => {
            const satellite = satellites.find((s) => s.satelliteName === 'International Space Station');
            const { status, body } = await request(app.getHttpServer()).get(`/satellites/${satellite._id}`);
            expect(status).toBe(200);
            expect(body.result).toBeDefined();
            expect(body.result.orbit.period).toBeDefined();
            expect(body.result.orbit.period).toBe(getPeriod(body.result.orbit.semiMajorAxis * 1000) / (24 * 60 * 60));
            expect(body.result.id).toBe(satellite._id.toString());
        });
    });

    describe('Joining tables using populate', () => {});

    describe('Mongo and Neo4j', () => {});

    describe('Cypher query with property inside relationship, getMostRecentlyCreatedSatellites', () => {});

    describe('Cypher query with depth, getRecommendedUsers', () => {});

    describe('Auth guards and roles', () => {});
});
