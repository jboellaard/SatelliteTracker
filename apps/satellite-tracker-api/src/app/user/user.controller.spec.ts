import { Test, TestingModule } from '@nestjs/testing';
import { SatelliteService } from '../satellite/satellite.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe.skip('UserController', () => {
    let controller: UserController;

    let mockUserService = {
        findOne: jest.fn(),
        getUserFollowing: jest.fn(),
        followUser: jest.fn(),
        unfollowUser: jest.fn(),
        getUserFollowers: jest.fn(),
        getUserTracking: jest.fn(),
    };

    let mockSatelliteService = {
        getSatellitesOfUserWithUsername: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: SatelliteService,
                    useValue: mockSatelliteService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
