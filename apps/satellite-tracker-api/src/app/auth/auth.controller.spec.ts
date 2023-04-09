import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRegistration } from 'shared/domain';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
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

    // describe('register', () => {
    //     let credentials, invalidCredentials;
    //     let example_id: string;

    //     beforeEach(() => {
    //         credentials = {
    //             username: 'test',
    //             password: 'testp',
    //             emailAddress: 'test@test',
    //         };
    //         invalidCredentials = {
    //             username: 'invalid',
    //             password: 'testp',
    //             emailAddress: 'test@test',
    //         };
    //         example_id = 'id12345';
    //     });

    //     it('should call registerUser and return the created user', async () => {
    //         const res = await authController.register(credentials);
    //         expect(mockAuthService.registerUser).toHaveBeenCalledWith(credentials);
    //         expect(res).toHaveProperty('username', credentials.username);
    //     });

    //     it('should return an exception if register returns exception', async () => {
    //         mockAuthService.registerUser.mockImplementationOnce(() => {
    //             throw new HttpException('Could not create user', HttpStatus.BAD_REQUEST);
    //         });
    //         const res = await authController.register(invalidCredentials);
    //         expect(res).toBeInstanceOf(HttpException);
    //         expect(res).toHaveProperty('message', 'Could not create user');
    //     });
    // });

    // describe('login', () => {
    //     let validCredentials: any, invalidCredentials: any, generateToken: any;
    //     let example_id: string;

    //     beforeEach(() => {
    //         validCredentials = {
    //             username: 'valid',
    //             password: 'validpassword',
    //         };

    //         invalidCredentials = {
    //             username: 'invalid',
    //             password: 'invalidpassword',
    //         };
    //     });

    //     it('should call generateToken and return a token', async () => {
    //         const res = await authController.login(validCredentials);
    //         expect(mockAuthService.generateToken).toBeCalledWith(validCredentials.username, validCredentials.password);
    //         expect(res).toHaveProperty('token');
    //     });

    //     it('should return an exception if generateToken returns exception', async () => {
    //         await authController.login(invalidCredentials);
    //         expect(generateToken).toReturnWith(new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST));
    //     });
    // });

    // describe('getSelf', () => {
    //     let identity: any, getIdentity: any;

    //     beforeEach(() => {
    //         identity = {
    //             _id: 'id12345',
    //             username: 'test',
    //             password: 'testp',
    //             emailAddress: 'test@test',
    //         };
    //     });

    //     it('should call getIdentity', async () => {
    //         await authController.getSelf({ user: { username: identity.username } });
    //         expect(getIdentity).toBeCalledWith(identity.username);
    //     });

    //     it('should return the identity', async () => {
    //         const result = await authController.getSelf({ user: { username: identity.username } });
    //         expect(result).toEqual(identity);
    //     });

    //     it('should return an exception if getIdentity returns exception', async () => {
    //         const result = await authController.getSelf({ user: { username: 'invalid' } });
    //         expect(getIdentity).toReturnWith(new HttpException('Could not find user', HttpStatus.BAD_REQUEST));
    //     });

    //     // test if method is unreachable for non-logged in users
    // });
});
