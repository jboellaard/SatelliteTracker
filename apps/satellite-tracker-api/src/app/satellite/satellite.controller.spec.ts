import { Test, TestingModule } from '@nestjs/testing';
import { SatelliteController } from './satellite.controller';
import { SatelliteService } from './satellite.service';

describe('SatelliteController', () => {
    let controller: SatelliteController;

    let mockSatelliteService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        getSatellitesOfUserWithId: jest.fn(),
        getSatellitesOfUserWithUsername: jest.fn(),
        getAllSatelliteParts: jest.fn(),
        getSatellitePart: jest.fn(),
        createOrbit: jest.fn(),
        updateOrbit: jest.fn(),
        removeOrbit: jest.fn(),
        getTrackers: jest.fn(),
        trackSatellite: jest.fn(),
        untrackSatellite: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SatelliteController],
            providers: [
                {
                    provide: SatelliteService,
                    useValue: mockSatelliteService,
                },
            ],
        }).compile();

        controller = module.get<SatelliteController>(SatelliteController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
