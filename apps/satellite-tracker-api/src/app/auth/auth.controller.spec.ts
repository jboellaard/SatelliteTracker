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
        let credentials, invalidCredentials, register;
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

            register = jest.spyOn(authService, 'registerUser').mockImplementation(async (credentials) => {
                if (credentials.username === 'invalid') {
                    return new HttpException('Could not create user', HttpStatus.BAD_REQUEST);
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
            await authController.register('', credentials);
            expect(register).toHaveBeenCalledWith(credentials);
        });

        it('should return the new user', async () => {
            const result = await authController.register('', credentials);
            console.log(result);
            expect(result).toHaveProperty('_id', example_id);
        });

        it('should return an exception if register returns exception', async () => {
            register.mockImplementation(async () => {
                return new HttpException('Could not create user', HttpStatus.BAD_REQUEST);
            });
            const result = await authController.register('', credentials);
            expect(register).toReturnWith(new HttpException('Could not create user', HttpStatus.BAD_REQUEST));
            // expect(result).toEqual(new HttpException('Could not create user', HttpStatus.BAD_REQUEST));
        });
    });
});
