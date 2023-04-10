import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRegistration } from 'shared/domain';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe.skip('AuthController', () => {
    let authController: AuthController;

    let mockAuthService = {
        registerUser: jest.fn((credentials: UserRegistration) => Promise.resolve({ username: credentials.username })),
        generateToken: jest.fn((username: string, password: string) => Promise.resolve({ username: username })),
        refreshToken: jest.fn(),
        getIdentity: jest.fn(),
        getAllIdentities: jest.fn(),
        updateIdentity: jest.fn(),
        delete: jest.fn(),
    };

    let mockUserService = {
        getSelf: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
    });

    // beforeEach(() => {
    //     jest.clearAllMocks();
    // });
    it('should be defined', () => {
        expect(authController).toBeDefined();
    });
});
