import { Test, TestingModule } from '@nestjs/testing';
import { SatelliteService } from './satellite.service';
import { UserSchema } from '../user/schemas/user.schema';
import { SatelliteSchema } from './schemas/satellite.schema';
const mockingoose = require('mockingoose');
import mongoose from 'mongoose';
import { Shape } from 'shared/domain';

describe('SatelliteService', () => {
    let service: SatelliteService;

    mockingoose(mongoose.model('user', UserSchema)).toReturn({}, 'findOne');
    mockingoose(mongoose.model('satellite', SatelliteSchema)).toReturn(
        {
            _id: '',
            satelliteName: 'Satellite 1',
            description: 'Satellite 1 description',
            mass: 100,
            sizeOfBase: 100,
            colorOfBase: '#ffffff',
            shapeOfBase: Shape.Cube,
            purpose: 'TBD',
            createdBy: '5f9f1c1c1c1c1c1c1c1c1c1d',
            createdAt: new Date(),
            updatedAt: new Date(),
            orbit: {
                semiMajorAxis: 10000,
                eccentricity: 0,
                inclination: 80,
                longitudeOfAscendingNode: 100,
                argumentOfPerigee: 100,
                dateTimeOfLaunch: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        },
        'findById'
    );
    mockingoose.Satellite.toReturn({}, 'save');

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SatelliteService],
        }).compile();

        service = module.get<SatelliteService>(SatelliteService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
