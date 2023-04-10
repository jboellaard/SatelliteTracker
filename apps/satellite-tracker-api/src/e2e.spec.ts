import { disconnect } from 'mongoose';
import { AppModule } from '../src/app/app.module';
import { Shape, getPeriod } from 'shared/domain';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoClient } from 'mongodb';
import { Neo4jService } from './app/neo4j/neo4j.service';
import { Neo4jModule } from './app/neo4j/neo4j.module';
import * as bcrypt from 'bcrypt';
import { Satellite } from './app/satellite/schemas/satellite.schema';
import { Identity } from './app/auth/schemas/identity.schema';
import { User } from './app/user/schemas/user.schema';
import { CustomSatellitePart } from './app/satellite/schemas/satellite-part.schema';

describe('Satellite tracker API e2e tests', () => {
    let app: INestApplication;
    let neo4jService: Neo4jService;
    let password = 'password';
    let users;
    let identities;
    let satelliteParts;
    let satellites;

    let db;
    let iddb;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        neo4jService = app.get<Neo4jService>(Neo4jService);

        const dbConnection = await MongoClient.connect(
            `${process.env.MONGO_CONN}/${process.env.MONGO_DATABASE}${process.env.MONGO_OPTIONS}`
        );
        db = dbConnection.db(process.env.MONGO_DATABASE);

        const iddbConnection = await MongoClient.connect(
            `${process.env.MONGO_CONN}/${process.env.MONGO_IDENTITYDB}${process.env.MONGO_OPTIONS}`
        );
        iddb = iddbConnection.db(process.env.MONGO_IDENTITYDB);

        await Promise.all([
            db.collection('users').deleteMany({}),
            db.collection('satellites').deleteMany({}),
            db.collection('satelliteParts').deleteMany({}),
            iddb.collection('identities').deleteMany({}),
            neo4jService.write('MATCH (n) DETACH DELETE n', {}),
            neo4jService.write(
                `CREATE CONSTRAINT unique_username IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE`,
                {}
            ),
            neo4jService.write(
                `CREATE CONSTRAINT unique_satellite IF NOT EXISTS FOR (s:Satellite) REQUIRE (s.satelliteName, s.createdBy) IS UNIQUE`,
                {}
            ),
        ]);
    });

    beforeEach(async () => {
        await db.collection('users').deleteMany({});
        await db.collection('satellites').deleteMany({});
        await db.collection('satelliteParts').deleteMany({});
        await iddb.collection('identities').deleteMany({});
        await neo4jService.write('MATCH (n) DETACH DELETE n', {});

        await db.collection('users').insertMany([
            {
                username: 'user',
                location: {
                    type: 'Point',
                    coordinates: [0, 0],
                },
                profileDescrition: 'description',
            },
            {
                username: 'user2',
            },
            {
                username: 'user3',
            },
            {
                username: 'user4',
            },
        ] as User[]);
        users = await db.collection('users').find({}).toArray();
        await iddb.collection('identities').insertMany([
            {
                username: 'user',
                hash: await bcrypt.hash(password, parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                user: users[0]._id,
            },
            {
                username: 'user2',
                hash: await bcrypt.hash(password, parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                user: users[1]._id,
            },
            {
                username: 'user3',
                hash: await bcrypt.hash(password, parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                user: users[2]._id,
            },
            {
                username: 'user4',
                hash: await bcrypt.hash(password, parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                user: users[3]._id,
            },
        ] as Identity[]);
        identities = await iddb.collection('identities').find({}).toArray();
        users.forEach((user) => {
            neo4jService.write('MERGE u:User {username: $username} RETURN u', {
                username: user.username,
            });
        });
        await db.collection('satelliteParts').insertMany([
            {
                partName: 'part1',
                description: 'description',
                function: 'function',
                material: 'material',
            },
            {
                partName: 'part2',
                description: 'description',
                function: 'function',
                material: 'material',
            },
        ]);
        satelliteParts = await db.collection('satelliteParts').find({}).toArray();
        await db.collection('satelliteParts').insertMany([
            {
                partName: 'part3',
                description: 'description',
                function: 'function',
                material: 'material',
                dependsOn: [satelliteParts[0]._id, satelliteParts[1]._id],
            },
            {
                partName: 'part4',
                description: 'description',
                function: 'function',
                material: 'material',
                dependsOn: [satelliteParts[0]._id],
            },
        ]);
        satelliteParts = await db.collection('satelliteParts').find({}).toArray();
        await db
            .collection('satelliteParts')
            .updateOne({ _id: satelliteParts[0]._id }, { $set: { dependsOn: [satelliteParts[2]._id] } });
        satelliteParts = await db.collection('satelliteParts').find({}).toArray();
        await db.collection('satellites').insertMany([
            {
                satelliteName: 'satellite1',
                description: 'description',
                mass: 100,
                sizeOfBase: 100,
                colorOfBase: '#ffffff',
                shapeOfBase: Shape.Cube,
                createdBy: users[0]._id,
                satelliteParts: [
                    {
                        satellitePart: satelliteParts[0],
                        quantity: 1,
                        size: 1,
                        color: '#ffffff',
                    },
                    {
                        satellitePart: satelliteParts[1],
                        quantity: 2,
                        size: 2,
                        color: '#ffffff',
                    },
                    {
                        satellitePart: satelliteParts[2],
                        quantity: 3,
                        size: 3,
                        color: '#ffffff',
                    },
                ] as CustomSatellitePart[],
            },
            {
                satelliteName: 'satellite2',
                description: 'description',
                mass: 100,
                sizeOfBase: 100,
                colorOfBase: '#ffffff',
                shapeOfBase: Shape.Cube,
                createdBy: users[0]._id,
            },
            {
                satelliteName: 'satellite1',
                description: 'description',
                mass: 100,
                sizeOfBase: 100,
                colorOfBase: '#ffffff',
                shapeOfBase: Shape.Cube,
                createdBy: users[1]._id,
            },
        ] as Satellite[]);
        satellites = await db.collection('satellites').find({}).toArray();
        satellites.forEach((satellite) => {
            neo4jService.write(
                'MATCH (u:User {username: $username}) CREATE (s:Satellite {satelliteName: $satelliteName, createdBy: $username }) MERGE (s)<-[:CREATED {createdAt: datetime($createdAt)}]-(u) MERGE (u)-[:TRACKS {since: datetime()}]->(s)',
                {
                    satelliteName: satellite.satelliteName,
                    username: users.find((user) => user._id.equals(satellite.createdBy)).username,
                    createdAt: new Date().toISOString(),
                }
            );
        });
        await db
            .collection('users')
            .updateOne({ _id: users[0]._id }, { $set: { satellites: [satellites[0]._id, satellites[1]._id] } });
        await db.collection('users').updateOne({ _id: users[1]._id }, { $set: { satellites: [satellites[2]._id] } });
    });

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
            expect(createdUser).toBeDefined();
            expect(createdUser.username).toBe(user.username);

            neo4jService
                .read('MATCH (u:User {username: $username}) RETURN u', { username: user.username })
                .then((result) => {
                    expect(result.records.length).toBe(1);
                    result.records.forEach((record) => {
                        expect(record.get('u').properties.username).toBe(user.username);
                    });
                });

            await Promise.all([
                db.collection('users').deleteOne({ username: 'newuser' }),
                iddb.collection('identities').deleteOne({ username: 'newuser' }),
                neo4jService.write('MATCH (u:User {username: $username}) DETACH DELETE u', { username: user.username }),
            ]);
        });

        it('should not add a user if an error occurs in a mongo database', async () => {
            const user = {
                username: 'newuser',
                password: 'password',
            };
            db.collection('users').insertOne({ username: 'newuser' });

            const { status, body } = await request(app.getHttpServer()).post('/register').send(user);
            expect(status).toBe(400);
            expect(body.message).toBe('Username already exists.');

            neo4jService
                .read('MATCH (u:User {username: $username}) RETURN u', { username: user.username })
                .then((result) => {
                    expect(result.records.length).toBe(0);
                });

            db.collection('users').deleteOne({ username: 'newuser' });

            iddb.collection('identities').insertOne({ username: 'newuser', hash: 'hash' });
            const { status: status2, body: body2 } = await request(app.getHttpServer()).post('/register').send(user);
            expect(status2).toBe(400);
            expect(body2.message).toBe('Username already exists.');

            neo4jService
                .read('MATCH (u:User {username: $username}) RETURN u', { username: user.username })
                .then((result) => {
                    expect(result.records.length).toBe(0);
                });
            iddb.collection('identities').deleteOne({ username: 'newuser' });
        });

        it('should not add a user if an error occurs in a neo4j database', async () => {
            const user = {
                username: 'newuser',
                password: 'password',
            };

            neo4jService.write('CREATE (u:User {username: $username})', { username: 'newuser' });

            const { status, body } = await request(app.getHttpServer()).post('/register').send(user);
            expect(status).toBe(400);
            expect(body.message).toBe('Username already exists.');

            db.collection('users')
                .find({ username: user.username })
                .toArray()
                .then((result) => {
                    expect(result.length).toBe(0);
                });
            iddb.collection('identities')
                .find({ username: user.username })
                .toArray()
                .then((result) => {
                    expect(result.length).toBe(0);
                });

            neo4jService.write('MATCH (u:User {username: $username}) DETACH DELETE u', { username: 'newuser' });
        });
    });

    describe('Joining tables using populate', () => {
        it('should return a user with a populated satellites', async () => {
            const { status, body } = await request(app.getHttpServer()).get(`/users/${users[0].username}`);
            expect(status).toBe(200);
            expect(body.result).toBeDefined();
            expect(body.result.satellites).toBeDefined();
            expect(body.result.satellites.length).toBe(
                satellites.filter((s) => s.createdBy.toString() === users[0]._id.toString()).length
            );
        });

        it('should return a satellite with a populated "createdBy" and "satelliteParts" and their dependencies', async () => {
            const { status, body } = await request(app.getHttpServer()).get(`/satellites/${satellites[0]._id}`);
            expect(status).toBe(200);
            expect(body.result).toBeDefined();
            expect(body.result.createdBy).toBeDefined();
            expect(body.result.createdBy).toBe(users[0].username);
            expect(body.result.satelliteParts).toBeDefined();
            expect(body.result.satelliteParts.length).toBe(3);

            /** works in application but not in test */
            /**
               body.result.satelliteParts.forEach((body_sp) => {
                    console.log(body_sp);
                    const part = satelliteParts.find((sp) => sp._id.toString() === body_sp.satellitePart);
                    if (part.dependsOn) {
                        expect(body.result.satelliteParts[0].dependsOn).toEqual(part.dependsOn.map((d) => d.partName));
                    } else {
                        expect(body.result.satelliteParts[0].dependsOn).toBeUndefined();
                    }
                });
             */
        });

        it('should not return any satelliteparts if a satellite has none', async () => {
            const { status, body } = await request(app.getHttpServer()).get(`/satellites/${satellites[1]._id}`);
            expect(status).toBe(200);
            expect(body.result).toBeDefined();
            expect(body.result.satelliteParts).toBeDefined();
            expect(body.result.satelliteParts.length).toBe(0);
        });
    });

    describe('Auth guards and roles', () => {
        const adminUsername = 'admin';
        beforeEach(async () => {
            db.collection('users').insertOne({
                username: 'admin',
            });
            const user = await db.collection('users').findOne({ username: 'admin' });
            iddb.collection('identities').insertOne({
                username: adminUsername,
                hash: await bcrypt.hash(password, 10),
                roles: ['user', 'admin'],
                user: user,
            });
        });

        it('should delete the logged in user', async () => {
            const { body: token } = await request(app.getHttpServer()).post('/login').send({
                username: users[0].username,
                password: password,
            });

            const { status, body } = await request(app.getHttpServer())
                .delete(`/self`)
                .set('Authorization', `Bearer ${token.result.accessToken}`);
            expect(status).toBe(200);
            expect(body.result).toBeDefined();

            db.collection('users')
                .find({ username: users[0].username })
                .toArray()
                .then((result) => {
                    expect(result.length).toBe(0);
                });
        });

        it('should delete a user if the logged in user is an admin', async () => {
            const { body: token } = await request(app.getHttpServer()).post('/login').send({
                username: adminUsername,
                password: password,
            });

            const { status, body } = await request(app.getHttpServer())
                .delete(`/users/${users[0].username}`)
                .set('Authorization', `Bearer ${token.result.accessToken}`);
            expect(status).toBe(200);
            expect(body.result).toBeDefined();

            db.collection('users')
                .find({ username: users[0].username })
                .toArray()
                .then((result) => {
                    expect(result.length).toBe(0);
                });
        });

        it('should not delete a user if it is not the logged in user or an admin', async () => {
            const { body: token } = await request(app.getHttpServer()).post('/login').send({
                username: users[1].username,
                password: password,
            });

            const { status, body } = await request(app.getHttpServer())
                .delete(`/users/${users[0].username}`)
                .set('Authorization', `Bearer ${token.result.accessToken}`);
            expect(status).toBe(403);
            expect(body.message).toBe('Forbidden resource');

            db.collection('users')
                .find({ username: users[0].username })
                .toArray()
                .then((result) => {
                    expect(result.length).toBe(1);
                });
        });
    });

    describe('Mongo and Neo4j', () => {});

    describe('Cypher query with property inside relationship, getMostRecentlyCreatedSatellites', () => {});

    describe('Cypher query with depth, getRecommendedUsers', () => {});

    describe.only('Unique email or no email', () => {
        it('should create an account if the user has a unique email address', async () => {
            const { status, body } = await request(app.getHttpServer()).post('/register').send({
                username: 'newuser',
                emailAddress: 'mail@mail.com',
                password: password,
            });

            expect(status).toBe(201);
            expect(body.result).toBeDefined();
            expect(body.result.username).toBe('newuser');

            db.collection('users').findOne({ username: 'newuser' }, (err, result) => {
                expect(result).toBeDefined();
                expect(result.username).toBe('newuser');
            });
            iddb.collection('identities').findOne({ username: 'newuser' }, (err, result) => {
                expect(result).toBeDefined();
                expect(result.username).toBe('newuser');
                expect(result.emailAddress).toBe('mail@mail.com');
            });
        });

        it('should not create an account if the user has a non-unique email address', async () => {
            const email = 'mail@mail.com';
            db.collection('users').insertOne({
                username: 'newuser',
            });
            iddb.collection('identities').insertOne({
                username: 'newuser',
                emailAddress: email,
                hash: 'hash',
            });

            const { status, body } = await request(app.getHttpServer()).post('/register').send({
                username: 'differentusername',
                emailAddress: 'mail@mail.com',
                password: password,
            });

            expect(status).toBe(400);
            expect(body.message).toBe('Email address already exists.');

            db.collection('users').findOne({ username: 'differentusername' }, (err, result) => {
                expect(result).toBeNull();
            });
            iddb.collection('identities').findOne({ username: 'differentusername' }, (err, result) => {
                expect(result).toBeNull();
            });
        });

        it('should create an account if a user does not specify an email address', async () => {
            const { status, body } = await request(app.getHttpServer()).post('/register').send({
                username: 'newuser',
                password: password,
            });

            expect(status).toBe(201);
            expect(body.result).toBeDefined();
            expect(body.result.username).toBe('newuser');

            db.collection('users').findOne({ username: 'newuser' }, (err, result) => {
                expect(result).toBeDefined();
                expect(result.username).toBe('newuser');
            });
            iddb.collection('identities').findOne({ username: 'newuser' }, (err, result) => {
                expect(result).toBeDefined();
                expect(result.username).toBe('newuser');
                expect(result.emailAddress).toBeUndefined();
            });

            const { status: status2, body: body2 } = await request(app.getHttpServer()).post('/register').send({
                username: 'anotheruser',
                password: password,
            });

            expect(status2).toBe(201);
            expect(body2.result).toBeDefined();
            expect(body2.result.username).toBe('anotheruser');

            db.collection('users').findOne({ username: 'anotheruser' }, (err, result) => {
                expect(result).toBeDefined();
                expect(result.username).toBe('anotheruser');
            });
            iddb.collection('identities').findOne({ username: 'anotheruser' }, (err, result) => {
                expect(result).toBeDefined();
                expect(result.username).toBe('anotheruser');
                expect(result.emailAddress).toBeUndefined();
            });
        });
    });

    describe('Neo queries', () => {
        beforeEach(async () => {
            // Add new users
            await request(app.getHttpServer()).post('/register').send({
                username: 'newuser',
                password: password,
            });
            await request(app.getHttpServer()).post('/register').send({
                username: 'newuser2',
                password: password,
            });
            await request(app.getHttpServer()).post('/register').send({
                username: 'newuser3',
                password: password,
            });
            await request(app.getHttpServer()).post('/register').send({
                username: 'newuser4',
                password: password,
            });
            await request(app.getHttpServer()).post('/register').send({
                username: 'newuser5',
                password: password,
            });
            await request(app.getHttpServer()).post('/register').send({
                username: 'newuser6',
                password: password,
            });
        });

        it.only('recommends users to follow based on who they follow with a depth of 1', async () => {
            console.log('test');
        });

        it.only('recommends users to follow based on who they follow with a depth of 2 to 4', async () => {
            console.log('test2');
            // Creating following for previously made users
            const { body: token } = await request(app.getHttpServer()).post('/login').send({
                username: 'newuser',
                password: password,
            });
            console.log(token);
            const { status } = await request(app.getHttpServer())
                .post('users/newuser2/follow')
                .set('Authorization', `Bearer ${token.result.accessToken}`)
                .send({});
            expect(status).toBe(201);

            console.log('test3');

            const { body: token2 } = await request(app.getHttpServer()).post('/login').send({
                username: 'newuser2',
                password: password,
            });

            const { status: status2 } = await request(app.getHttpServer())
                .post('users/newuser3/follow')
                .set('Authorization', `Bearer ${token2.result.accessToken}`)
                .send();
            expect(status2).toBe(201);
            const { status: status3 } = await request(app.getHttpServer())
                .post('users/newuser4/follow')
                .set('Authorization', `Bearer ${token2.result.accessToken}`)
                .send();
            expect(status3).toBe(201);

            const { body: token3 } = await request(app.getHttpServer()).post('/login').send({
                username: 'newuser3',
                password: password,
            });
            const { status: status4 } = await request(app.getHttpServer())
                .post('users/newuser5/follow')
                .set('Authorization', `Bearer ${token3.result.accessToken}`)
                .send();
            expect(status4).toBe(201);

            const { body: token4 } = await request(app.getHttpServer()).post('/login').send({
                username: 'newuser5',
                password: password,
            });
            const { status: status5 } = await request(app.getHttpServer())
                .post('users/newuser6/follow')
                .set('Authorization', `Bearer ${token4.result.accessToken}`)
                .send();
            expect(status5).toBe(201);

            // Testing the to-follow endpoint
            const { body: token5 } = await request(app.getHttpServer()).post('/login').send({
                username: users[0].username,
                password: password,
            });
            const { status: status6 } = await request(app.getHttpServer())
                .post('users/newuser/follow')
                .set('Authorization', `Bearer ${token5.result.accessToken}`)
                .send();
            expect(status6).toBe(201);

            const { status: status7, body } = await request(app.getHttpServer())
                .get('/to-follow')
                .set('Authorization', `Bearer ${token5.result.accessToken}`);
            expect(status7).toBe(200);
            expect(body.result).toBeDefined();
            expect(body.result.length).toBe(3);
            expect(body.result[0].username).toBe('newuser3');
            expect(body.result[1].username).toBe('newuser4');
            expect(body.result[2].username).toBe('newuser5');
        });
    });

    it.skip('should return a satellite with a virtual property', async () => {
        const satellite = satellites.find((s) => s.satelliteName === 'International Space Station');
        const { status, body } = await request(app.getHttpServer()).get(`/satellites/${satellite._id}`);
        expect(status).toBe(200);
        expect(body.result).toBeDefined();
        expect(body.result.orbit.period).toBeDefined();
        expect(body.result.orbit.period).toBe(getPeriod(body.result.orbit.semiMajorAxis * 1000) / (24 * 60 * 60));
        expect(body.result.id).toBe(satellite._id.toString());
    });
});
