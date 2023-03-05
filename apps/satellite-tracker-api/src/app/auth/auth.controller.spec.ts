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

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        registerUser: jest.fn(),
                        generateToken: jest.fn(),
                        getIdentity: jest.fn(),
                        updateIdentity: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: UserService,
                    useValue: {
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });
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

            mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            register = jest.spyOn(authService, 'registerUser').mockImplementation(async (credentials) => {
                if (credentials.username === 'invalid') {
                    throw new HttpException('Could not create user', HttpStatus.BAD_REQUEST);
                } else {
                    return {
                        _id: example_id,
                        username: credentials.username,
                        password: credentials.password,
                        emailAddress: credentials.emailAddress,
                    };
                }
            });
        });

        it('should call registerUser', async () => {
            await authController.register(mockResponse, credentials);
            expect(register).toHaveBeenCalledWith(credentials);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
        });

        it('should return the new user', async () => {
            const result = await authController.register(mockResponse, credentials);
            expect(result).toHaveProperty('_id', example_id);
        });

        it('should return an exception if register returns exception', async () => {
            register.mockImplementation(async () => {
                throw new HttpException('Could not create user', HttpStatus.BAD_REQUEST);
            });
            const result = await authController.register(mockResponse, credentials);
            expect(register).toReturnWith(new HttpException('Could not create user', HttpStatus.BAD_REQUEST));
            // expect(result).toEqual(new HttpException('Could not create user', HttpStatus.BAD_REQUEST));
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
            generateToken = jest.spyOn(authService, 'generateToken').mockImplementation(async (username, password) => {
                if (username === validCredentials.username && password === validCredentials.password) {
                    return {
                        token: 'token12345',
                    };
                }
                throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
            });
        });

        it('should call generateToken', async () => {
            await authController.login('', validCredentials);
            expect(generateToken).toBeCalledWith(validCredentials.username, validCredentials.password);
        });

        it('should return a token', async () => {
            const result = await authController.login('', validCredentials);
            expect(result).toEqual({ token: 'token12345' });
        });

        it('should return an exception if generateToken returns exception', async () => {
            const result = await authController.login('', invalidCredentials);
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
            await authController.getSelf('', identity._id);
            expect(getIdentity).toBeCalledWith(identity._id);
        });

        it('should return the identity', async () => {
            const result = await authController.getSelf('', identity._id);
            expect(result).toEqual(identity);
        });

        it('should return an exception if getIdentity returns exception', async () => {
            const result = await authController.getSelf('', 'invalid');
            expect(getIdentity).toReturnWith(new HttpException('Could not find user', HttpStatus.BAD_REQUEST));
        });

        // test if method is unreachable for non-logged in users
    });
});
