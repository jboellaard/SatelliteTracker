import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Model } from 'mongoose';
import { Shape } from 'shared/domain';
import { Identity, IdentityDocument } from '../auth/schemas/identity.schema';
import { Neo4jService } from '../neo4j/neo4j.service';
import {
    Satellite,
    SatelliteDocument,
    SatellitePart,
    SatellitePartDocument,
} from '../satellite/schemas/satellite.schema';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class DbseedService implements OnModuleInit {
    private readonly logger = new Logger(DbseedService.name);
    constructor(
        @InjectModel(Identity.name, `${process.env.MONGO_IDENTITYDB}`) private identityModel: Model<IdentityDocument>,
        @InjectModel(User.name, `${process.env.MONGO_DATABASE}`) private userModel: Model<UserDocument>,
        @InjectModel(Satellite.name, `${process.env.MONGO_DATABASE}`) private satelliteModel: Model<SatelliteDocument>,
        @InjectModel(SatellitePart.name, `${process.env.MONGO_DATABASE}`)
        private satellitePartModel: Model<SatellitePartDocument>,
        private readonly neo4jService: Neo4jService
    ) {}

    async onModuleInit() {
        try {
            const identities = await this.identityModel.find().exec();
            if (identities.length === 0) {
                this.logger.log('Seeding database...');
                await this.neo4jService.write(
                    `CREATE CONSTRAINT unique_username IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE`,
                    {}
                );
                await this.neo4jService.write(
                    `CREATE CONSTRAINT unique_satellite IF NOT EXISTS FOR (s:Satellite) REQUIRE (s.satelliteName, s.createdBy) IS NODE KEY`,
                    {}
                );

                const user1 = {
                    identity: new this.identityModel({
                        username: 'joy',
                        hash: await hash(process.env.ADMIN_PASSWORD, parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                        emailAddress: 'je.boellaard@student.avans.nl',
                        roles: ['admin', 'user'],
                    }),
                    user: new this.userModel({
                        username: 'joy',
                        profileDescription: '',
                        location: { coordinates: { latitude: 51.813297, longitude: 4.690093 } },
                        satellites: [],
                        createdAt: new Date(2022, 10, 14),
                    }),
                };
                const user2 = {
                    identity: new this.identityModel({
                        username: 'satellitemaker',
                        hash: await hash(process.env.USER_SEED_PASSWORD, parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                        emailAddress: 'creator@mail.com',
                        roles: ['user'],
                    }),
                    user: new this.userModel({
                        username: 'satellitemaker',
                        profileDescription: '',
                        location: { coordinates: { latitude: 44.5, longitude: 11.34 } },
                        satellites: [],
                        createdAt: new Date(2022, 11, 20),
                    }),
                };
                const user3 = {
                    identity: new this.identityModel({
                        username: 'firsttracker',
                        hash: await hash(process.env.USER_SEED_PASSWORD, parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                        emailAddress: 'first@mail.com',
                        roles: ['user'],
                    }),
                    user: new this.userModel({
                        username: 'firsttracker',
                        profileDescription: '',
                        location: { coordinates: { latitude: 52.370216, longitude: 4.895168 } },
                        createdAt: new Date(2022, 10, 17),
                        satellites: [],
                    }),
                };
                const user4 = {
                    identity: new this.identityModel({
                        username: 'launcher101',
                        hash: await hash(process.env.USER_SEED_PASSWORD, parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                        emailAddress: 'l@mail.com',
                        roles: ['user'],
                    }),
                    user: new this.userModel({
                        username: 'launcher101',
                        profileDescription: '',
                        location: { coordinates: { latitude: 4.370216, longitude: 4.895168 } },
                        createdAt: new Date(2023, 0, 17),
                        satellites: [],
                    }),
                };
                const user5 = {
                    identity: new this.identityModel({
                        username: 'lovespacefrfr',
                        hash: await hash(process.env.USER_SEED_PASSWORD, parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                        emailAddress: 'spaced@mail.com',
                        roles: ['user'],
                    }),
                    user: new this.userModel({
                        username: 'lovespacefrfr',
                        profileDescription: '',
                        location: { coordinates: { latitude: 52.370216, longitude: 50.895168 } },
                        satellites: [],
                        createdAt: new Date(2022, 11, 31),
                    }),
                };
                const user6 = {
                    identity: new this.identityModel({
                        username: 'admin',
                        hash: await hash(
                            process.env.ADMIN_TEACHER_PASSWORD,
                            parseInt(`${process.env.SALT_ROUNDS}`, 10)
                        ),
                        emailAddress: 'adminmail@mail.nl',
                        roles: ['admin', 'user'],
                    }),
                    user: new this.userModel({
                        username: 'admin',
                        profileDescription: '',
                        location: { coordinates: { latitude: 51.813297, longitude: 4.690093 } },
                        satellites: [],
                        createdAt: new Date(2022, 10, 17),
                    }),
                };

                await this.userModel.insertMany([
                    user1.user,
                    user2.user,
                    user3.user,
                    user4.user,
                    user5.user,
                    user6.user,
                ]);
                user1.identity.user = user1.user;
                user2.identity.user = user2.user;
                user3.identity.user = user3.user;
                user4.identity.user = user4.user;
                user5.identity.user = user5.user;
                user6.identity.user = user6.user;

                this.identityModel.insertMany([
                    user1.identity,
                    user2.identity,
                    user3.identity,
                    user4.identity,
                    user5.identity,
                    user6.identity,
                ]);

                await this.neo4jService.write(
                    `MERGE (n:User {username: $username1}) 
                MERGE (m:User {username: $username2}) 
                MERGE (o:User {username: $username3}) 
                MERGE (p:User {username: $username4})
                MERGE (q:User {username: $username5})
                MERGE (r:User {username: $username6})
                MERGE (m)-[:FOLLOWS { since: datetime($date1) }]->(n)
                MERGE (o)-[:FOLLOWS { since: datetime($date1) }]->(n)
                MERGE (p)-[:FOLLOWS { since: datetime($date3) }]->(n)
                MERGE (p)-[:FOLLOWS { since: datetime() }]->(q)
                MERGE (q)-[:FOLLOWS { since: datetime() }]->(p)
                MERGE (n)-[:FOLLOWS { since: datetime($date2) }]->(m)
                MERGE (n)-[:FOLLOWS { since: datetime() }]->(p)
                MERGE (o)-[:FOLLOWS { since: datetime($date2) }]->(m)
                MERGE (r)-[:FOLLOWS { since: datetime() }]->(n)
                MERGE (r)-[:FOLLOWS { since: datetime() }]->(m)
                MERGE (r)-[:FOLLOWS { since: datetime() }]->(o)
                MERGE (m)-[:FOLLOWS { since: datetime($date1) }]->(r)
                MERGE (p)-[:FOLLOWS { since: datetime() }]->(r)
                MERGE (q)-[:FOLLOWS { since: datetime() }]->(r)`,
                    {
                        username1: user1.user.username,
                        username2: user2.user.username,
                        username3: user3.user.username,
                        username4: user4.user.username,
                        username5: user5.user.username,
                        username6: user6.user.username,
                        date1: new Date(2023, 0, 2).toISOString(),
                        date2: new Date(2023, 0, 14).toISOString(),
                        date3: new Date(2023, 0, 23).toISOString(),
                    }
                );

                const satellitePart1 = new this.satellitePartModel({
                    partName: 'Solar panel Si',
                    description: 'Solar panel made of silicon',
                    function: 'Provides power using solar energy',
                    material: 'Silicon',
                });
                const satellitePart2 = new this.satellitePartModel({
                    partName: 'Solar panel GaAs',
                    description: 'Solar panel made of gallium arsenide',
                    function: 'Provides power using solar energy',
                    material: 'Gallium arsenide',
                });
                const satellitePart3 = new this.satellitePartModel({
                    partName: 'Antenna Al',
                    description: 'Antenna made of aluminum',
                    function: 'Transmits and receives radio signals',
                    material: 'Aluminum',
                });
                const satellitePart4 = new this.satellitePartModel({
                    partName: 'Antenna fiberglass',
                    description: 'Antenna made of fiberglass',
                    function: 'Transmits and receives radio signals',
                    material: 'Fiberglass',
                });
                const satellitePart5 = new this.satellitePartModel({
                    partName: 'Transponder u-bend',
                    description:
                        'Series of interconnected units that form a communications channel between the receiving and the transmitting antennas, operates on bend pipe principle.',
                    function: 'Transfer received signals',
                    material: 'Semi-conducting material',
                });
                const satellitePart6 = new this.satellitePartModel({
                    partName: 'Battery',
                    description: 'A device that stores energy',
                    function: 'Energy storage',
                    material: 'Lithium',
                    dependsOn: [satellitePart1, satellitePart2],
                });
                const satellitePart7 = new this.satellitePartModel({
                    partName: 'Propulsion system; thruster',
                    description: 'A device that produces thrust by expelling gas in one direction',
                    function: 'Maneuvering and orbit correction',
                    dependsOn: [satellitePart1, satellitePart2, satellitePart6],
                });
                const satellitePart8 = new this.satellitePartModel({
                    partName: 'Propulsion system; engine',
                    description:
                        'A device that produces thrust by expelling gas in one direction, larger and more powerful than a thruster',
                    function: 'Propulsion',
                });
                const satellitePart9 = new this.satellitePartModel({
                    partName: 'Lens',
                    function: 'Focusing light',
                    material: 'Glass',
                });
                const satellitePart10 = new this.satellitePartModel({
                    partName: 'Camera',
                    function: 'Recording images',
                    dependsOn: [satellitePart9],
                });
                const satellitePart11 = new this.satellitePartModel({
                    partName: 'Mirror',
                    description: 'Flat surface that reflects light waves, often used in telescopes',
                    function: 'Light reflection',
                    material: 'Beryllium',
                });
                const satellitePart12 = new this.satellitePartModel({
                    partName: 'Telescope',
                    description: 'A device that magnifies distant objects',
                    function: 'Observation',
                    dependsOn: [satellitePart9, satellitePart11],
                });
                const satellitePart13 = new this.satellitePartModel({
                    partName: 'Particle detector',
                    description: 'Observes electrons, protons and helium.',
                    function: 'Detection of particles',
                });
                const satellitePart14 = new this.satellitePartModel({
                    partName: 'Sensor',
                    description: 'Base for a lot of other devices that detect different things',
                    function: 'Detection',
                });
                const satellitePart15 = new this.satellitePartModel({
                    partName: 'Accelerometer',
                    description: 'A device that detects acceleration',
                    function: 'Acceleration detection',
                    dependsOn: [satellitePart13],
                });
                const satellitePart16 = new this.satellitePartModel({
                    partName: 'Control Moment Gyroscope',
                    description: 'A device that regulates angular momentum',
                    function: 'Angular momentum regulation',
                });
                const satellitePart17 = new this.satellitePartModel({
                    partName: 'Magnetometer',
                    description: 'A device that detects magnetic field',
                    function: 'Magnetic field detection',
                    dependsOn: [satellitePart13],
                });
                const satellitePart18 = new this.satellitePartModel({
                    partName: 'Thermal sensor',
                    description: 'A device that detects temperature',
                    function: 'Temperature detection',
                    dependsOn: [satellitePart13],
                });
                const satellitePart19 = new this.satellitePartModel({
                    partName: 'Thermal system',
                    description: 'A device that regulates temperature',
                    function: 'Temperature regulation',
                    dependsOn: [satellitePart18],
                });
                const satellitePart20 = new this.satellitePartModel({
                    partName: 'Radiation sensor',
                    description: 'A device that detects radiation',
                    function: 'Radiation detection',
                    dependsOn: [satellitePart13],
                });
                const satellitePart21 = new this.satellitePartModel({
                    partName: 'Shield Al',
                    function: 'Radiation protection',
                    material: 'Aluminum',
                    dependsOn: [satellitePart20],
                });
                const satellitePart22 = new this.satellitePartModel({
                    partName: 'Shield AlBm',
                    function: 'Radiation protection',
                    material: 'Aluminum Bronze and molybdenum',
                    dependsOn: [satellitePart20],
                });

                satellitePart18.dependsOn.push(satellitePart19);

                await this.satellitePartModel.insertMany([
                    satellitePart1,
                    satellitePart2,
                    satellitePart3,
                    satellitePart4,
                    satellitePart5,
                    satellitePart6,
                    satellitePart7,
                    satellitePart8,
                    satellitePart9,
                    satellitePart10,
                    satellitePart11,
                    satellitePart12,
                    satellitePart13,
                    satellitePart14,
                    satellitePart15,
                    satellitePart16,
                    satellitePart17,
                    satellitePart18,
                    satellitePart19,
                    satellitePart20,
                    satellitePart21,
                    satellitePart22,
                ]);

                const satellite1 = new this.satelliteModel({
                    satelliteName: 'International Space Station',
                    description: 'A space station in low Earth orbit',
                    purpose: 'Research',
                    mass: 419,
                    sizeOfBase: 94,
                    colorOfBase: '#a6a6a6',
                    satelliteParts: [
                        {
                            satellitePart: satellitePart1,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            satellitePart: satellitePart1,
                            size: 20,
                            color: '#ffffff',
                            quantity: 1,
                        },
                        {
                            satellitePart: satellitePart4,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            satellitePart: satellitePart6,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            satellitePart: satellitePart8,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            satellitePart: satellitePart9,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            satellitePart: satellitePart11,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            satellitePart: satellitePart13,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            satellitePart: satellitePart17,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            satellitePart: satellitePart18,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                    ],
                    orbit: {
                        semiMajorAxis: 6774,
                        eccentricity: 0.01,
                        inclination: 52,
                        longitudeOfAscendingNode: 0,
                        argumentOfPerigee: 90,
                        dateTimeOfLaunch: new Date(2022, 10, 20),
                    },
                    createdBy: user1.user._id,
                    createdAt: new Date(2022, 10, 20),
                });
                const satellite2 = new this.satelliteModel({
                    satelliteName: 'Spaceduck',
                    purpose: 'Communication',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#ffffff',
                    shapeOfBase: Shape.Sphere,
                    createdBy: user2.user._id,
                    createdAt: new Date(2023, 0, 20),
                });
                const satellite3 = new this.satelliteModel({
                    satelliteName: 'Skyscraper',
                    purpose: 'Space cleanup',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#ffffff',
                    createdBy: user1.user._id,
                    createdAt: new Date(),
                });
                const satellite4 = new this.satelliteModel({
                    satelliteName: 'stardrop',
                    purpose: 'Weather forecasting',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#0000cc',
                    shapeOfBase: Shape.Sphere,
                    createdBy: user4.user._id,
                    createdAt: new Date(2023, 0, 25),
                });
                const satellite5 = new this.satelliteModel({
                    satelliteName: 'cloud',
                    purpose: 'Weather forecasting',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#0000cc',
                    shapeOfBase: Shape.Sphere,
                    createdBy: user4.user._id,
                    createdAt: new Date(),
                });
                const satellite6 = new this.satelliteModel({
                    satelliteName: 'sunrise',
                    purpose: 'Mapping',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#d84390',
                    shapeOfBase: Shape.Sphere,
                    createdBy: user1.user._id,
                    createdAt: new Date(2023, 0, 1),
                });
                const satellite7 = new this.satelliteModel({
                    satelliteName: 'sunset',
                    purpose: 'Mapping',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#130449',
                    shapeOfBase: Shape.Sphere,
                    createdBy: user1.user._id,
                    createdAt: new Date(2023, 0, 1),
                });
                const satellite8 = new this.satelliteModel({
                    satelliteName: 'shuttle',
                    purpose: 'Experimentation',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#a198a5',
                    createdBy: user1.user._id,
                    createdAt: new Date(),
                });
                const satellite9 = new this.satelliteModel({
                    satelliteName: 'big bird',
                    purpose: 'flying',
                    mass: 10000,
                    sizeOfBase: 10000,
                    colorOfBase: '#e1f92c',
                    createdBy: user1.user._id,
                    createdAt: new Date(),
                });
                const satellite10 = new this.satelliteModel({
                    satelliteName: 'little bird',
                    purpose: 'swimming',
                    mass: 100,
                    sizeOfBase: 100,
                    colorOfBase: '#e1f92c',
                    createdBy: user1.user,
                    createdAt: new Date(),
                });
                const satellite11 = new this.satelliteModel({
                    satelliteName: 'High flyer',
                    purpose: 'TBD',
                    mass: 300,
                    sizeOfBase: 100,
                    colorOfBase: '#9cdaff',
                    createdBy: user6.user,
                    createdAt: new Date(2022, 11, 12),
                    orbit: {
                        semiMajorAxis: 167740,
                        eccentricity: 0.5,
                        inclination: 0,
                        longitudeOfAscendingNode: 0,
                        argumentOfPerigee: 180,
                        dateTimeOfLaunch: new Date(2023, 0, 1),
                    },
                });
                const satellite12 = new this.satelliteModel({
                    satelliteName: 'Low flyer',
                    purpose: 'TBD',
                    mass: 300,
                    sizeOfBase: 100,
                    colorOfBase: '#027e00',
                    createdBy: user6.user,
                    createdAt: new Date(2022, 11, 12),
                    orbit: {
                        semiMajorAxis: 6800,
                        eccentricity: 0,
                        inclination: 0,
                        longitudeOfAscendingNode: 0,
                        argumentOfPerigee: 180,
                        dateTimeOfLaunch: new Date(2023, 0, 1),
                    },
                });
                const satellite13 = new this.satelliteModel({
                    satelliteName: 'Space vacuum',
                    purpose: 'Space cleanup',
                    mass: 200,
                    sizeOfBase: 30,
                    colorOfBase: '#6e6e6e',
                    createdBy: user6.user,
                    createdAt: new Date(),
                });
                const satellite14 = new this.satelliteModel({
                    satelliteName: 'Find the way',
                    purpose: 'Navigation',
                    mass: 200,
                    sizeOfBase: 30,
                    colorOfBase: '#027e00',
                    createdBy: user6.user,
                    createdAt: new Date(2023, 0, 11),
                });
                const satellite15 = new this.satelliteModel({
                    satelliteName: 'Second earth',
                    purpose: "Disrupting earth's orbit",
                    mass: 5.972 * 10 ** 24,
                    sizeOfBase: 6371000 * 2,
                    colorOfBase: '#0020d5',
                    shapeOfBase: Shape.Sphere,
                    createdBy: user6.user,
                    createdAt: new Date(2023, 0, 11),
                    orbit: {
                        semiMajorAxis: 159900,
                        eccentricity: 0.7,
                        inclination: 60,
                        longitudeOfAscendingNode: 0,
                        argumentOfPerigee: 90,
                        dateTimeOfLaunch: new Date(2023, 0, 11),
                    },
                });

                // Saving seperately for the post save hook, normally only one would be created at most
                satellite1.save();
                satellite2.save();
                satellite3.save();
                satellite4.save();
                satellite5.save();
                satellite6.save();
                satellite7.save();
                satellite8.save();
                satellite9.save();
                satellite10.save();
                satellite11.save();
                satellite12.save();
                satellite13.save();
                satellite14.save();
                satellite15.save();

                await this.neo4jService.write(
                    `
                MATCH (u1:User {username: $username1})
                MATCH (u2:User {username: $username2})
                MATCH (u3:User {username: $username3})
                MATCH (u4:User {username: $username4})
                MATCH (u5:User {username: $username5})
                MATCH (u6:User {username: $username6})

                CREATE (s:Satellite {satelliteName: $name1, createdBy: $username1 })
                MERGE (s)<-[:CREATED {createdAt: datetime($createdAt1)}]-(u1)
                SET s.launchDate = datetime($launchDate)
                CREATE (s2:Satellite {satelliteName: $name2, createdBy: $username2 })
                MERGE (s2)<-[:CREATED {createdAt: datetime($createdAt2)}]-(u2)
                CREATE (s3:Satellite {satelliteName: $name3, createdBy: $username1 })
                MERGE (s3)<-[:CREATED {createdAt: datetime($createdAt3)}]-(u1)
                CREATE (s4:Satellite {satelliteName: $name4, createdBy: $username4 })
                MERGE (s4)<-[:CREATED {createdAt: datetime($createdAt4)}]-(u4)
                CREATE (s5:Satellite {satelliteName: $name5, createdBy: $username4 })
                MERGE (s5)<-[:CREATED {createdAt: datetime($createdAt5)}]-(u4)
                CREATE (s6:Satellite {satelliteName: $name6, createdBy: $username1 })
                MERGE (s6)<-[:CREATED {createdAt: datetime($createdAt6)}]-(u1)
                CREATE (s7:Satellite {satelliteName: $name7, createdBy: $username1 })
                MERGE (s7)<-[:CREATED {createdAt: datetime($createdAt7)}]-(u1)
                CREATE (s8:Satellite {satelliteName: $name8, createdBy: $username1 })
                MERGE (s8)<-[:CREATED {createdAt: datetime($createdAt8)}]-(u1)
                CREATE (s9:Satellite {satelliteName: $name9, createdBy: $username1 })
                MERGE (s9)<-[:CREATED {createdAt: datetime($createdAt9)}]-(u1)
                CREATE (s10:Satellite {satelliteName: $name10, createdBy: $username1 })
                MERGE (s10)<-[:CREATED {createdAt: datetime($createdAt10)}]-(u1)
                CREATE (s11:Satellite {satelliteName: $name11, createdBy: $username6 })
                MERGE (s11)<-[:CREATED {createdAt: datetime($createdAt11)}]-(u6)
                SET s11.launchDate = datetime($launchDate1)
                CREATE (s12:Satellite {satelliteName: $name12, createdBy: $username6 })
                MERGE (s12)<-[:CREATED {createdAt: datetime($createdAt12)}]-(u6)
                SET s12.launchDate = datetime($launchDate1)
                CREATE (s13:Satellite {satelliteName: $name13, createdBy: $username6 })
                MERGE (s13)<-[:CREATED {createdAt: datetime($createdAt13)}]-(u6)
                CREATE (s14:Satellite {satelliteName: $name14, createdBy: $username6 })
                MERGE (s14)<-[:CREATED {createdAt: datetime($createdAt14)}]-(u6)
                CREATE (s15:Satellite {satelliteName: $name15, createdBy: $username6 })
                MERGE (s15)<-[:CREATED {createdAt: datetime($createdAt15)}]-(u6)
                SET s15.launchDate = datetime($launchDate2)
                MERGE (u1)-[:TRACKS {since: datetime($createdAt1)}]->(s)
                MERGE (u2)-[:TRACKS {since: datetime($createdAt2)}]->(s2)
                MERGE (u1)-[:TRACKS {since: datetime($createdAt3)}]->(s3)
                MERGE (u4)-[:TRACKS {since: datetime($createdAt4)}]->(s4)
                MERGE (u4)-[:TRACKS {since: datetime($createdAt5)}]->(s5)
                MERGE (u1)-[:TRACKS {since: datetime($createdAt6)}]->(s6)
                MERGE (u1)-[:TRACKS {since: datetime($createdAt7)}]->(s7)
                MERGE (u1)-[:TRACKS {since: datetime($createdAt8)}]->(s8)
                MERGE (u1)-[:TRACKS {since: datetime($createdAt9)}]->(s9)
                MERGE (u2)-[:TRACKS {since: datetime()}]->(s)
                MERGE (u2)-[:TRACKS {since: datetime()}]->(s6)
                MERGE (u2)-[:TRACKS {since: datetime()}]->(s7)
                MERGE (u5)-[:TRACKS {since: datetime()}]->(s9)
                MERGE (u5)-[:TRACKS {since: datetime()}]->(s4)
                MERGE (u5)-[:TRACKS {since: datetime()}]->(s5)
                MERGE (u3)-[:TRACKS {since: datetime()}]->(s)
                MERGE (u3)-[:TRACKS {since: datetime()}]->(s3)
                MERGE (u3)-[:TRACKS {since: datetime()}]->(s4)
                MERGE (u1)-[:TRACKS {since: datetime()}]->(s4)
                MERGE (u1)-[:TRACKS {since: datetime()}]->(s5)
                MERGE (u1)-[:TRACKS {since: datetime($createdAt10)}]->(s10)
                MERGE (u1)-[:TRACKS {since: datetime()}]->(s11)
                MERGE (u1)-[:TRACKS {since: datetime()}]->(s15)
                MERGE (u2)-[:TRACKS {since: datetime()}]->(s15)
                MERGE (u4)-[:TRACKS {since: datetime()}]->(s15)
                MERGE (u6)-[:TRACKS {since: datetime($createdAt11)}]->(s11)
                MERGE (u6)-[:TRACKS {since: datetime($createdAt12)}]->(s12)
                MERGE (u6)-[:TRACKS {since: datetime($createdAt13)}]->(s13)
                MERGE (u6)-[:TRACKS {since: datetime($createdAt14)}]->(s14)
                MERGE (u6)-[:TRACKS {since: datetime($createdAt15)}]->(s15)
                MERGE (u6)-[:TRACKS {since: datetime()}]->(s)
                MERGE (u6)-[:TRACKS {since: datetime()}]->(s5)
                MERGE (u6)-[:TRACKS {since: datetime()}]->(s3)
                MERGE (u6)-[:TRACKS {since: datetime()}]->(s6)
                MERGE (u6)-[:TRACKS {since: datetime()}]->(s7)
                `,
                    {
                        name1: satellite1.satelliteName,
                        name2: satellite2.satelliteName,
                        name3: satellite3.satelliteName,
                        name4: satellite4.satelliteName,
                        name5: satellite5.satelliteName,
                        name6: satellite6.satelliteName,
                        name7: satellite7.satelliteName,
                        name8: satellite8.satelliteName,
                        name9: satellite9.satelliteName,
                        name10: satellite10.satelliteName,
                        name11: satellite11.satelliteName,
                        name12: satellite12.satelliteName,
                        name13: satellite13.satelliteName,
                        name14: satellite14.satelliteName,
                        name15: satellite15.satelliteName,
                        launchDate: satellite1.orbit?.dateTimeOfLaunch.toISOString(),
                        launchDate1: satellite11.orbit?.dateTimeOfLaunch.toISOString(),
                        launchDate2: satellite15.orbit?.dateTimeOfLaunch.toISOString(),
                        username1: user1.user.username,
                        username2: user2.user.username,
                        username3: user3.user.username,
                        username4: user4.user.username,
                        username5: user5.user.username,
                        username6: user6.user.username,
                        createdAt1: satellite1.createdAt.toISOString(),
                        createdAt2: satellite2.createdAt.toISOString(),
                        createdAt3: satellite3.createdAt.toISOString(),
                        createdAt4: satellite4.createdAt.toISOString(),
                        createdAt5: satellite5.createdAt.toISOString(),
                        createdAt6: satellite6.createdAt.toISOString(),
                        createdAt7: satellite7.createdAt.toISOString(),
                        createdAt8: satellite8.createdAt.toISOString(),
                        createdAt9: satellite9.createdAt.toISOString(),
                        createdAt10: satellite10.createdAt.toISOString(),
                        createdAt11: satellite11.createdAt.toISOString(),
                        createdAt12: satellite12.createdAt.toISOString(),
                        createdAt13: satellite13.createdAt.toISOString(),
                        createdAt14: satellite14.createdAt.toISOString(),
                        createdAt15: satellite15.createdAt.toISOString(),
                    }
                );
                this.logger.log('Finished seeding.');
            } else {
                this.logger.log('Database already has content.');
            }
        } catch (error) {
            this.logger.error(error);
        }
    }
}
