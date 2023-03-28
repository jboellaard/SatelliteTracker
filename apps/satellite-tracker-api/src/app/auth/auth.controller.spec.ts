import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRegistration } from 'shared/domain';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService, UserService],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
    });

    // beforeEach(() => {
    //     jest.clearAllMocks();
    // });
    it('should be defined', () => {
        expect(authController).toBeDefined();
    });

    describe('register', () => {
        let credentials, invalidCredentials, register, mockResponse;
        let example_id: string;

        beforeEach(() => {
            credentials = {
                username: 'test',
                password: 'testp',
                emailAddress: 'test@test',
            };
            invalidCredentials = {
                username: 'invalid',
                password: 'testp',
                emailAddress: 'test@test',
            };
            example_id = 'id12345';

            register = jest
                .fn()
                .mockImplementation((credentials) =>
                    Promise.resolve({
                        status: HttpStatus.CREATED,
                        result: { username: credentials.username, _id: example_id },
                    })
                );
        });

        it('should call registerUser', async () => {
            await authController.register(credentials);
            expect(register).toHaveBeenCalledWith(credentials);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
        });

        it('should return the new user', async () => {
            const result = await authController.register(credentials);
            expect(result).toHaveProperty('_id', example_id);
        });

        it('should return an exception if register returns exception', async () => {
            register.mockRejectedValue(new HttpException('Could not create user', HttpStatus.BAD_REQUEST));
            await authController.register(credentials);
            expect(register).toReturnWith(new HttpException('Could not create user', HttpStatus.BAD_REQUEST));
        });
    });

    describe('login', () => {
        let validCredentials: any, invalidCredentials: any, generateToken: any;
        let example_id: string;

        beforeEach(() => {
            validCredentials = {
                username: 'valid',
                password: 'validpassword',
            };

            invalidCredentials = {
                username: 'invalid',
                password: 'invalidpassword',
            };

            example_id = 'id12345';
            generateToken = jest.fn().mockImplementation((username, password) => {
                if (username === validCredentials.username && password === validCredentials.password) {
                    return {
                        status: HttpStatus.OK,
                        result: { token: 'token12345' },
                    };
                }
                throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
            });
        });

        it('should call generateToken', async () => {
            await authController.login(validCredentials);
            expect(generateToken).toBeCalledWith(validCredentials.username, validCredentials.password);
        });

        it('should return a token', async () => {
            const result = await authController.login(validCredentials);
            expect(result).toEqual({ token: 'token12345' });
        });

        it('should return an exception if generateToken returns exception', async () => {
            await authController.login(invalidCredentials);
            expect(generateToken).toReturnWith(new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST));
        });
    });

    describe('getSelf', () => {
        let identity: any, getIdentity: any;

        beforeEach(() => {
            identity = {
                _id: 'id12345',
                username: 'test',
                password: 'testp',
                emailAddress: 'test@test',
            };

            getIdentity = jest.spyOn(authService, 'getIdentity').mockImplementation(async (id) => {
                if (id === identity._id) {
                    return identity;
                }
                return new HttpException('Could not find user', HttpStatus.BAD_REQUEST);
            });
        });

        it('should call getIdentity', async () => {
            await authController.getSelf(identity._id);
            expect(getIdentity).toBeCalledWith(identity._id);
        });

        it('should return the identity', async () => {
            const result = await authController.getSelf(identity._id);
            expect(result).toEqual(identity);
        });

        it('should return an exception if getIdentity returns exception', async () => {
            const result = await authController.getSelf('invalid');
            expect(getIdentity).toReturnWith(new HttpException('Could not find user', HttpStatus.BAD_REQUEST));
        });

        // test if method is unreachable for non-logged in users
    });
});
