// testing jwt guards, tokens and role-based (returning items based on token username)

//
import mongoose, { disconnect } from 'mongoose';
import { AppModule } from '../src/app/app.module';
import { getPeriod } from 'shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoClient } from 'mongodb';

describe.only('Satellite tracker API e2e tests', () => {
    let app: INestApplication;
    const mockObjectId = new mongoose.Types.ObjectId();
    let users;
    let satellites;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        const dbConnection = await MongoClient.connect(process.env.MONGO_CONN);
        const db = dbConnection.db(process.env.MONGO_DATABASE);

        users = await db.collection('users').find().toArray();
        satellites = await db.collection('satellites').find().toArray();
    });

    beforeEach(async () => {});

    afterAll(async () => {
        await disconnect();
    });

    describe('Validation and indexes', () => {
        it('should return a user', async () => {});

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
});
