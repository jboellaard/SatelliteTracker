import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import mongoose, { Model } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';

import { Identity, IdentityDocument } from './schemas/identity.schema';
import { User, UserDocument } from '../user/schemas/user.schema';

import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Id, UserIdentity } from 'shared/domain';
import { Neo4jService } from '../neo4j/neo4j.service';
import { AuthNeoQueries } from './neo4j/auth.cypher';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectModel(Identity.name, 'identitydb') private identityModel: Model<IdentityDocument>,
        @InjectModel(User.name, 'satellitetrackerdb') private userModel: Model<UserDocument>,
        @InjectConnection('satellitetrackerdb') private stconnection: mongoose.Connection,
        @InjectConnection('identitydb') private identityConnection: mongoose.Connection,
        private readonly neo4jService: Neo4jService,
        private jwtService: JwtService
    ) {}

    async registerUser(credentials: UserIdentity): Promise<any> {
        const stsession = await this.stconnection.startSession();
        const identitySession = await this.identityConnection.startSession();
        const neo4jSession = this.neo4jService.getWriteSession();

        stsession.startTransaction();
        identitySession.startTransaction();
        const transaction = neo4jSession.beginTransaction();
        this.logger.log(`Started transaction for creating user with username ${credentials.username}`);

        try {
            const userAttributes = { username: credentials.username, ...credentials.profileInfo };
            const user = new this.userModel(userAttributes);
            const generatedHash = await hash(credentials.password, parseInt(`${process.env.SALT_ROUNDS}`, 10));
            const identity = new this.identityModel({
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
                transaction.run(AuthNeoQueries.addUser, {
                    username: credentials.username,
                });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }

            await transaction.commit();
            await Promise.all([stsession.commitTransaction(), identitySession.commitTransaction()]);
            this.logger.log(`Created user`);

            return user;
        } catch (error) {
            this.logger.error(error);
            await Promise.all([stsession.abortTransaction(), identitySession.abortTransaction()]);
            this.logger.error(`Rolled back transaction`);
            if (error instanceof Error) {
                return new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            return new HttpException('Could not create user', HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            this.logger.log(`Closing create sessions`);
            await Promise.all([stsession.endSession(), identitySession.endSession(), neo4jSession.close()]);
        }
    }

    async generateToken(username: string, password: string): Promise<any> {
        const identity = await this.identityModel.findOne({ username: username }).exec();

        if (!identity || !(await compare(password, identity.hash)))
            return new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        this.logger.log(`User validated, generating token for user ${username}`);
        const payload = await this.getTokens(identity.user, username, identity.roles);
        return payload;
    }

    async refreshToken(username: string): Promise<any> {
        const identity = await this.identityModel.findOne({ username: username }).exec();

        if (!identity) return new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        this.logger.log(`Generating new tokens for ${username}`);
        const payload = await this.getTokens(identity.user, username, identity.roles);
        return payload;
    }

    async getTokens(user: User, username: string, roles: string[]): Promise<any> {
        const accessToken = this.jwtService.sign(
            { sub: user, username: username, roles: roles },
            { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' }
        );
        const refreshToken = this.jwtService.sign(
            { sub: user },
            { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }
        );
        return {
            accessToken,
            refreshToken,
            expiresAt: process.env.JWT_ACCESS_EXPIRATION,
            username: username,
            roles: roles,
        };
    }

    async getIdentity(username: string): Promise<Identity | null> {
        return await this.identityModel.findOne({ username: username }).select('-hash').exec();
    }

    async updateIdentity(username: string, updatedCredentials: UserIdentity) {
        const identitySession = await this.identityConnection.startSession();
        identitySession.startTransaction();
        this.logger.log(`Started transaction for updating user with username ${username}`);
        try {
            if (updatedCredentials.password) {
                updatedCredentials.password = await hash(
                    updatedCredentials.password,
                    parseInt(`${process.env.SALT_ROUNDS}`, 10)
                );
            }
            const updatedUser = await this.identityModel.findOneAndUpdate({ username: username }, updatedCredentials, {
                session: identitySession,
                new: true,
            });

            if (!updatedUser) {
                return new HttpException(`Could not find user with username ${username}`, HttpStatus.NOT_FOUND);
            }

            // if the username is updated, a new token must be generated as well
            if (updatedCredentials.username && username !== updatedCredentials.username) {
                const stSession = await this.stconnection.startSession();
                const neo4jSession = this.neo4jService.getWriteSession();
                stSession.startTransaction();
                const transaction = neo4jSession.beginTransaction();
                try {
                    await this.userModel.findOneAndUpdate(
                        { username: username },
                        { username: updatedCredentials.username },
                        { session: stSession }
                    );
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
            if (updatedCredentials.username && username !== updatedCredentials.username) {
                return {
                    user: updatedUser,
                    token: this.jwtService.sign({
                        sub: updatedUser?.user,
                        username: updatedUser?.username,
                        roles: updatedUser?.roles,
                    }),
                };
            }
            return { user: updatedUser };
        } catch (error) {
            this.logger.error(error);
            await identitySession.abortTransaction();
            this.logger.error(`Rolled back transaction`);
            if (error instanceof Error) {
                return new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            return new HttpException('Could not update user', HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            this.logger.log(`Closing update session`);
            await identitySession.endSession();
        }
    }

    async delete(username: string) {
        this.logger.log(`Removing user with username ${username} (including identity)`);
        const stsession = await this.stconnection.startSession();
        const identitySession = await this.identityConnection.startSession();
        const neo4jSession = this.neo4jService.getWriteSession();

        stsession.startTransaction();
        identitySession.startTransaction();
        const transaction = neo4jSession.beginTransaction();
        this.logger.log(`Started transaction for deleting user with username ${username}`);

        try {
            //can't rollback neo4j transaction if something goes wrong while committing, so seperate try catch block
            const user = await this.userModel.findOneAndDelete({ username: username }).session(stsession);
            if (!user) {
                return new HttpException(`Could not find user with username ${username}`, HttpStatus.NOT_FOUND);
            }

            await this.identityModel.deleteOne({ username: username }).session(identitySession);
            try {
                transaction.run(AuthNeoQueries.removeUser, { username: username });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
            await transaction.commit();
            await Promise.all([stsession.commitTransaction(), identitySession.commitTransaction()]);
            this.logger.log(`Deleted user and identity`);
            return user;
        } catch (error) {
            this.logger.error(error);
            await Promise.all([stsession.abortTransaction(), identitySession.abortTransaction()]);
            this.logger.error(`Rolled back transaction`);
            if (error instanceof Error) {
                return new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            return new HttpException('Could not delete user', HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            this.logger.log(`Closing delete sessions`);
            await Promise.all([stsession.endSession(), identitySession.endSession(), neo4jSession.close()]);
        }
    }
}
