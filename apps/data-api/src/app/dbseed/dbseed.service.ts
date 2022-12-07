import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Model } from 'mongoose';
import { Identity, IdentityDocument } from '../auth/schemas/identity.schema';
import { Neo4jService } from '../neo4j/neo4j.service';
import { Satellite, SatelliteDocument, SatellitePart, SatellitePartDocument } from '../satellite/satellite.schema';
import { User, UserDocument } from '../user/user.schema';

@Injectable()
export class DbseedService implements OnModuleInit {
    private readonly logger = new Logger(DbseedService.name);
    constructor(
        @InjectModel(Identity.name, 'identitydb') private identityModel: Model<IdentityDocument>,
        @InjectModel(User.name, 'satellitetrackerdb') private userModel: Model<UserDocument>,
        @InjectModel(Satellite.name, 'satellitetrackerdb') private satelliteModel: Model<SatelliteDocument>,
        @InjectModel(SatellitePart.name, 'satellitetrackerdb') private satellitePartModel: Model<SatellitePartDocument>,
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
                    `CREATE CONSTRAINT unique_satellite IF NOT EXISTS FOR (s:Satellite) REQUIRE (s.name, s.createdBy) IS NODE KEY`,
                    {}
                );

                const user1 = {
                    identity: new this.identityModel({
                        username: 'joy',
                        hash: await hash('secret101', parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                        emailAddress: 'je.boellaard@student.avans.nl',
                        roles: ['admin', 'user'],
                    }),
                    user: new this.userModel({
                        username: 'joy',
                        profileDescription: '',
                        location: { coordinates: { latitude: 51.813297, longitude: 4.690093 } },
                        satellites: [],
                    }),
                };
                const user2 = {
                    identity: new this.identityModel({
                        username: 'satellitemaker',
                        hash: await hash('secret101', parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                        emailAddress: 'creator@mail.com',
                        roles: ['user'],
                    }),
                    user: new this.userModel({
                        username: 'satellitemaker',
                        profileDescription: '',
                        location: { coordinates: { latitude: 44.5, longitude: 11.34 } },
                        satellites: [],
                    }),
                };
                const user3 = {
                    identity: new this.identityModel({
                        username: 'firsttracker',
                        hash: await hash('secret101', parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                        emailAddress: 'first@mail.com',
                        roles: ['user'],
                    }),
                    user: new this.userModel({
                        username: 'firsttracker',
                        profileDescription: '',
                        location: { coordinates: { latitude: 52.370216, longitude: 4.895168 } },
                        createdAt: new Date(2022, 11, 17),
                        satellites: [],
                    }),
                };
                const user4 = {
                    identity: new this.identityModel({
                        username: 'launcher101',
                        hash: await hash('secret101', parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                        emailAddress: 'l@mail.com',
                        roles: ['user'],
                    }),
                    user: new this.userModel({
                        username: 'launcher101',
                        profileDescription: '',
                        location: { coordinates: { latitude: 4.370216, longitude: 4.895168 } },
                        createdAt: new Date(),
                        satellites: [],
                    }),
                };
                const user5 = {
                    identity: new this.identityModel({
                        username: 'lovespacefrfr',
                        hash: await hash('secret101', parseInt(`${process.env.SALT_ROUNDS}`, 10)),
                        emailAddress: 'spaced@mail.com',
                        roles: ['user'],
                    }),
                    user: new this.userModel({
                        username: 'lovespacefrfr',
                        profileDescription: '',
                        location: { coordinates: { latitude: 52.370216, longitude: 50.895168 } },
                        satellites: [],
                    }),
                };
                this.identityModel.insertMany([
                    user1.identity,
                    user2.identity,
                    user3.identity,
                    user4.identity,
                    user5.identity,
                ]);
                await this.userModel.insertMany([user1.user, user2.user, user3.user, user4.user, user5.user]);

                this.neo4jService.write(
                    `MERGE (n:User {username: $username1, longitude: $longitude1, latitude: $latitude1}) 
                MERGE (m:User {username: $username2, longitude: $longitude2, latitude: $latitude2}) 
                MERGE (o:User {username: $username3, longitude: $longitude3, latitude: $latitude3}) 
                MERGE (p:User {username: $username4, longitude: $longitude4, latitude: $latitude4})
                MERGE (q:User {username: $username5, longitude: $longitude5, latitude: $latitude5})
                MERGE (m)-[:FOLLOWS]->(n)
                MERGE (o)-[:FOLLOWS]->(n)
                MERGE (p)-[:FOLLOWS]->(n)
                MERGE (p)-[:FOLLOWS]->(q)
                MERGE (q)-[:FOLLOWS]->(p)
                MERGE (n)-[:FOLLOWS]->(m)
                MERGE (n)-[:FOLLOWS]->(p)
                MERGE (o)-[:FOLLOWS]->(m)`,
                    {
                        username1: user1.user.username,
                        longitude1: user1.user.location?.coordinates?.longitude ?? 0,
                        latitude1: user1.user.location?.coordinates?.latitude ?? 0,
                        username2: user2.user.username,
                        longitude2: user2.user.location?.coordinates?.longitude ?? 0,
                        latitude2: user2.user.location?.coordinates?.latitude ?? 0,
                        username3: user3.user.username,
                        longitude3: user3.user.location?.coordinates?.longitude ?? 0,
                        latitude3: user3.user.location?.coordinates?.latitude ?? 0,
                        username4: user4.user.username,
                        longitude4: user4.user.location?.coordinates?.longitude ?? 0,
                        latitude4: user4.user.location?.coordinates?.latitude ?? 0,
                        username5: user5.user.username,
                        longitude5: user5.user.location?.coordinates?.longitude ?? 0,
                        latitude5: user5.user.location?.coordinates?.latitude ?? 0,
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
                    description: 'Observes electron, protons and helium.',
                    function: 'Detection of particles (Research)',
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
                    dependsOn: [satellitePart17],
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
                    satelliteName: 'ISS',
                    description: 'International Space Station',
                    purpose: 'Research',
                    mass: 100,
                    sizeOfBase: 100,
                    colorOfBase: '#000000',
                    satelliteParts: [
                        {
                            ...satellitePart1,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            ...satellitePart1,
                            size: 20,
                            color: '#ffffff',
                            quantity: 1,
                        },
                        {
                            ...satellitePart4,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            ...satellitePart6,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            ...satellitePart8,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            ...satellitePart9,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            ...satellitePart11,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            ...satellitePart13,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            ...satellitePart17,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                        {
                            ...satellitePart18,
                            size: 20,
                            color: '#000000',
                            quantity: 1,
                        },
                    ],
                    orbit: {
                        semiMajorAxis: 6774,
                        eccentricity: 0.0007,
                        inclination: 51.6,
                        longitudeOfAscendingNode: 0,
                        argumentOfPerigee: 0,
                    },
                    launch: {
                        launchDate: new Date(2023, 11, 20),
                        launchSite: { coordinates: { latitude: 28.608, longitude: -80.604 } },
                    },
                    createdById: user1.user._id,
                });
                const satellite2 = new this.satelliteModel({
                    satelliteName: 'Spaceduck',
                    purpose: 'Communication',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#ffffff',
                    createdById: user2.user._id,
                });
                const satellite3 = new this.satelliteModel({
                    satelliteName: 'Skyscraper',
                    purpose: 'Space cleanup',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#ffffff',
                    createdById: user1.user._id,
                });
                const satellite4 = new this.satelliteModel({
                    satelliteName: 'stardrop',
                    purpose: 'Weather forecasting',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#0000cc',
                    createdById: user4.user._id,
                });
                const satellite5 = new this.satelliteModel({
                    satelliteName: 'cloud',
                    purpose: 'Weather forecasting',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#0000cc',
                    createdById: user4.user._id,
                });
                const satellite6 = new this.satelliteModel({
                    satelliteName: 'sunrise',
                    purpose: 'Mapping',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#d84390',
                    createdById: user1.user._id,
                });
                const satellite7 = new this.satelliteModel({
                    satelliteName: 'sunset',
                    purpose: 'Mapping',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#130449',
                    createdById: user1.user._id,
                });
                const satellite8 = new this.satelliteModel({
                    satelliteName: 'shuttle',
                    purpose: 'Experimentation',
                    mass: 200,
                    sizeOfBase: 200,
                    colorOfBase: '#a198a5',
                    createdById: user1.user._id,
                });
                const satellite9 = new this.satelliteModel({
                    satelliteName: 'big bird',
                    purpose: 'flying',
                    mass: 10000,
                    sizeOfBase: 10000,
                    colorOfBase: '#e1f92c',
                    createdById: user1.user._id,
                });

                this.satelliteModel.insertMany([
                    satellite1,
                    satellite2,
                    satellite3,
                    satellite4,
                    satellite5,
                    satellite6,
                    satellite7,
                    satellite8,
                    satellite9,
                ]);

                this.neo4jService.write(
                    `
                MATCH (u1:User {username: $username1}) 
                MATCH (u2:User {username: $username2})
                MATCH (u3:User {username: $username3})
                MATCH (u4:User {username: $username4})
                MATCH (u5:User {username: $username5})

                MERGE (s:Satellite {name: $name1, createdBy: $username1, launchSiteLongitude: $longitude1, launchSiteLatitude: $latitude1 })                
                MERGE (s)<-[:CREATED {createdAt: datetime()}]-(u1)                
                MERGE (s2:Satellite {name: $name2, createdBy: $username2 })                
                MERGE (s2)<-[:CREATED {createdAt: datetime()}]-(u2)                
                MERGE (s3:Satellite {name: $name3, createdBy: $username1 })
                MERGE (s3)<-[:CREATED {createdAt: datetime()}]-(u1)
                MERGE (s4:Satellite {name: $name4, createdBy: $username4 })
                MERGE (s4)<-[:CREATED {createdAt: datetime()}]-(u4)
                MERGE (s5:Satellite {name: $name5, createdBy: $username4 })
                MERGE (s5)<-[:CREATED {createdAt: datetime()}]-(u4)
                MERGE (s6:Satellite {name: $name6, createdBy: $username1 })
                MERGE (s6)<-[:CREATED {createdAt: datetime()}]-(u1)
                MERGE (s7:Satellite {name: $name7, createdBy: $username1 })
                MERGE (s7)<-[:CREATED {createdAt: datetime()}]-(u1)
                MERGE (s8:Satellite {name: $name8, createdBy: $username1 })
                MERGE (s8)<-[:CREATED {createdAt: datetime()}]-(u1)
                MERGE (s9:Satellite {name: $name9, createdBy: $username1 })
                MERGE (s9)<-[:CREATED {createdAt: datetime()}]-(u1)
                MERGE (u1)-[:TRACKS]->(s)
                MERGE (u2)-[:TRACKS]->(s2)
                MERGE (u1)-[:TRACKS]->(s3)
                MERGE (u4)-[:TRACKS]->(s4)
                MERGE (u4)-[:TRACKS]->(s5)
                MERGE (u1)-[:TRACKS]->(s6)
                MERGE (u1)-[:TRACKS]->(s7)
                MERGE (u1)-[:TRACKS]->(s8)
                MERGE (u1)-[:TRACKS]->(s9)
                MERGE (u2)-[:TRACKS]->(s)
                MERGE (u2)-[:TRACKS]->(s6)
                MERGE (u2)-[:TRACKS]->(s7)
                MERGE (u5)-[:TRACKS]->(s9)
                MERGE (u5)-[:TRACKS]->(s4)
                MERGE (u5)-[:TRACKS]->(s5)
                MERGE (u3)-[:TRACKS]->(s)
                MERGE (u3)-[:TRACKS]->(s3)
                MERGE (u3)-[:TRACKS]->(s4)
                MERGE (u1)-[:TRACKS]->(s4)
                MERGE (u1)-[:TRACKS]->(s5)
                `,
                    {
                        name1: satellite1.satelliteName,
                        longitude1: satellite1.launch?.launchSite?.coordinates?.longitude ?? 0,
                        latitude1: satellite1.launch?.launchSite?.coordinates?.latitude ?? 0,
                        name2: satellite2.satelliteName,
                        name3: satellite3.satelliteName,
                        name4: satellite4.satelliteName,
                        name5: satellite5.satelliteName,
                        name6: satellite6.satelliteName,
                        name7: satellite7.satelliteName,
                        name8: satellite8.satelliteName,
                        name9: satellite9.satelliteName,
                        username1: user1.user.username,
                        username2: user2.user.username,
                        username3: user3.user.username,
                        username4: user4.user.username,
                        username5: user5.user.username,
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
