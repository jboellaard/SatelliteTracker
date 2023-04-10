import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Identity, IdentityDocument } from './schemas/identity.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AdminUserInfo, APIResult, IUser, Token, UserIdentity, UserRegistration } from 'shared/domain';
import { Neo4jService } from '../neo4j/neo4j.service';
import { AuthNeoQueries } from './neo4j/auth.cypher';
import { Satellite, SatelliteDocument } from '../satellite/schemas/satellite.schema';
import { Neo4jError } from 'neo4j-driver';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectModel(Identity.name, `${process.env.MONGO_IDENTITYDB}`) private identityModel: Model<IdentityDocument>,
        @InjectModel(User.name, `${process.env.MONGO_DATABASE}`) private userModel: Model<UserDocument>,
        @InjectModel(Satellite.name, `${process.env.MONGO_DATABASE}`) private satelliteModel: Model<SatelliteDocument>,
        @InjectConnection(`${process.env.MONGO_DATABASE}`) private stconnection: mongoose.Connection,
        @InjectConnection(`${process.env.MONGO_IDENTITYDB}`) private identityConnection: mongoose.Connection,
        private readonly neo4jService: Neo4jService,
        private jwtService: JwtService
    ) {}

    async registerUser(credentials: UserRegistration): Promise<APIResult<IUser>> {
        const stsession = await this.stconnection.startSession();
        const identitySession = await this.identityConnection.startSession();
        const neo4jSession = this.neo4jService.getWriteSession();

        stsession.startTransaction();
        identitySession.startTransaction();
        const transaction = neo4jSession.beginTransaction();
        this.logger.verbose(`Started transaction for creating user with username ${credentials.username}`);
        try {
            const userAttributes = { username: credentials.username, ...credentials.profileInfo };
            const user = new this.userModel(userAttributes);
            const generatedHash = await hash(credentials.password, parseInt(`${process.env.SALT_ROUNDS}`, 10));

            if (credentials.emailAddress == null) credentials.emailAddress = undefined;
            let identity = new this.identityModel({
                username: credentials.username,
                hash: generatedHash,
                emailAddress: credentials.emailAddress,
                user: user._id,
            });

            await Promise.all([
                this.userModel.create([user], { session: stsession }),
                this.identityModel.create([identity], { session: identitySession }),
            ]);

            try {
                await transaction.run(AuthNeoQueries.addUser, {
                    username: credentials.username,
                });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }

            await transaction.commit();
            await Promise.all([stsession.commitTransaction(), identitySession.commitTransaction()]);
            this.logger.verbose(`Created user`);

            return { status: HttpStatus.CREATED, result: user };
        } catch (error) {
            this.logger.error(error);
            await Promise.all([stsession.abortTransaction(), identitySession.abortTransaction()]);
            this.logger.error(`Something went wrong, rolling back transaction`);
            if (error.code === 11000) {
                if (error.keyPattern.username) {
                    throw new HttpException('Username already exists.', HttpStatus.BAD_REQUEST);
                } else if (error.keyPattern.emailAddress) {
                    throw new HttpException('Email address already exists.', HttpStatus.BAD_REQUEST);
                }
            } else if (
                error instanceof Neo4jError &&
                error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed'
            ) {
                throw new HttpException('Username already exists.', HttpStatus.BAD_REQUEST);
            }
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Could not create user', HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            this.logger.verbose(`Closing create sessions`);
            await Promise.all([stsession.endSession(), identitySession.endSession(), neo4jSession.close()]);
        }
    }

    async generateToken(username: string, password: string): Promise<APIResult<Token>> {
        const identity = await this.identityModel.findOne({ username: username }).exec();

        if (!identity || !(await compare(password, identity.hash)))
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        this.logger.verbose(`User validated, generating tokens for user ${username}`);
        delete identity.hash;
        const payload = await this.getTokens(identity);
        return { status: HttpStatus.OK, result: payload };
    }

    async refreshToken(username: string): Promise<APIResult<Token>> {
        const identity = await this.identityModel.findOne({ username: username }).select('-hash').exec();

        if (!identity) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        this.logger.verbose(`Generating new tokens for ${username}`);
        const payload = await this.getTokens(identity);
        return { status: HttpStatus.OK, result: payload };
    }

    private async getTokens(identity: Identity): Promise<Token> {
        const user: UserIdentity = {
            id: identity.user.toString(),
            username: identity.username,
            roles: identity.roles,
            emailAddress: identity.emailAddress,
        };
        const accessToken = this.jwtService.sign(
            { sub: user.id, username: user.username, roles: user.roles },
            { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' }
        );
        const refreshToken = this.jwtService.sign(
            { sub: user.id, username: user.username },
            { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }
        );
        return {
            accessToken,
            refreshToken,
            refreshTokenExpiresIn: '7d',
            user,
        };
    }

    async getIdentity(username: string): Promise<APIResult<UserIdentity>> {
        const identity = await this.identityModel.findOne({ username: username }).select('-hash').exec();
        return { status: HttpStatus.OK, result: identity };
    }

    async getAllIdentities(): Promise<APIResult<AdminUserInfo[]>> {
        const identities = await this.identityModel.find().select('-hash').exec();
        const users = await this.userModel.find().exec();
        const adminInfoUsers = identities.map((identity) => {
            const user = users.find((user) => user._id.toString() === identity.user.toString()).toObject() as IUser;
            return {
                ...user,
                emailAddress: identity.emailAddress,
                roles: identity.roles,
            };
        });
        return { status: HttpStatus.OK, result: adminInfoUsers };
    }

    async updateIdentity(
        username: string,
        updatedCredentials: UserRegistration
    ): Promise<APIResult<{ user: UserIdentity; token: Token }>> {
        const identitySession = await this.identityConnection.startSession();
        identitySession.startTransaction();
        this.logger.verbose(`Started transaction for updating user with username ${username}`);
        try {
            if (updatedCredentials.password) {
                updatedCredentials.password = await hash(
                    updatedCredentials.password,
                    parseInt(`${process.env.SALT_ROUNDS}`, 10)
                );
            }
            const updatedUser = await this.identityModel
                .findOneAndUpdate({ username: username }, updatedCredentials, {
                    session: identitySession,
                    new: true,
                })
                .select('-hash')
                .exec();

            if (!updatedUser) {
                throw new HttpException(`Could not find user with username ${username}`, HttpStatus.NOT_FOUND);
            }

            if (updatedCredentials.username && username !== updatedCredentials.username) {
                const stSession = await this.stconnection.startSession();
                const neo4jSession = this.neo4jService.getWriteSession();
                stSession.startTransaction();
                const transaction = neo4jSession.beginTransaction();
                try {
                    await this.userModel
                        .findOneAndUpdate(
                            { username: username },
                            { username: updatedCredentials.username },
                            { session: stSession }
                        )
                        .exec();
                    transaction.run(AuthNeoQueries.updateUsername, {
                        username,
                        newUsername: updatedCredentials.username,
                    });
                    await transaction.commit();
                    await stSession.commitTransaction();
                } catch (error) {
                    await Promise.all([stSession.abortTransaction(), transaction.rollback()]);
                    throw error;
                } finally {
                    await Promise.all([stSession.endSession(), neo4jSession.close()]);
                }
            }

            await identitySession.commitTransaction();
            return {
                status: HttpStatus.OK,
                result: {
                    user: updatedUser,
                    token: await this.getTokens(updatedUser),
                },
            };
        } catch (error) {
            this.logger.error(error);
            await identitySession.abortTransaction();
            this.logger.error(`Something went wrong, rolling back transaction`);
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Could not update user', HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            this.logger.verbose(`Closing update session`);
            await identitySession.endSession();
        }
    }

    async delete(username: string): Promise<APIResult<IUser>> {
        this.logger.verbose(`Removing user with username ${username} (including identity)`);
        const stsession = await this.stconnection.startSession();
        const identitySession = await this.identityConnection.startSession();
        const neo4jSession = this.neo4jService.getWriteSession();

        stsession.startTransaction();
        identitySession.startTransaction();
        const transaction = neo4jSession.beginTransaction();
        this.logger.verbose(`Started transaction for deleting user with username ${username}`);

        try {
            const user = await this.userModel.findOneAndDelete({ username: username }).session(stsession).exec();

            if (!user) {
                throw new HttpException(`Could not find user with username ${username}`, HttpStatus.NOT_FOUND);
            }
            await this.satelliteModel.deleteMany({ createdBy: user._id }).session(stsession).exec();
            await this.identityModel.deleteOne({ username: username }).session(identitySession).exec();

            try {
                await transaction.run(AuthNeoQueries.removeUser, { username: username });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
            await transaction.commit();
            await Promise.all([stsession.commitTransaction(), identitySession.commitTransaction()]);
            this.logger.verbose(`Deleted user and identity`);
            return { status: HttpStatus.OK, result: user };
        } catch (error) {
            this.logger.error(error);
            await Promise.all([stsession.abortTransaction(), identitySession.abortTransaction()]);
            this.logger.error(`Something went wrong, rolling back transaction`);
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Could not delete user', HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            this.logger.verbose(`Closing delete sessions`);
            await Promise.all([stsession.endSession(), identitySession.endSession(), neo4jSession.close()]);
        }
    }
}
