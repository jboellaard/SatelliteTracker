import { Injectable, Logger } from '@nestjs/common';

import mongoose, { Model } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';

import { Identity, IdentityDocument } from './schemas/identity.schema';
import { User, UserDocument } from '../user/user.schema';

import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Id, IIdentity, UserRegistration } from 'shared/domain';
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

    async registerUser(credentials: UserRegistration): Promise<string> {
        const stsession = await this.stconnection.startSession();
        const identitySession = await this.identityConnection.startSession();
        const neo4jSession = this.neo4jService.getWriteSession();

        stsession.startTransaction();
        identitySession.startTransaction();
        const transaction = neo4jSession.beginTransaction();
        this.logger.log(`Started transaction`);

        try {
            const userAttributes = { username: credentials.username, ...credentials.profileInfo };
            const user = new this.userModel(userAttributes);
            const generatedHash = await hash(credentials.password, parseInt(`${process.env.SALT_ROUNDS}`, 10));
            const identity = new this.identityModel({
                username: credentials.username,
                hash: generatedHash,
                emailAddress: credentials.emailAddress,
            });

            await Promise.all([
                this.userModel.create([user], { session: stsession }),
                this.identityModel.create([identity], { session: identitySession }),
            ]);

            try {
                transaction.run(
                    credentials.profileInfo?.location ? AuthNeoQueries.addUserWithLocation : AuthNeoQueries.addUser,
                    {
                        username: credentials.username,
                        ...credentials.profileInfo?.location?.coordinates,
                    }
                );
            } catch (error) {
                transaction.rollback();
                throw error;
            }

            await transaction.commit();
            await Promise.all([stsession.commitTransaction(), identitySession.commitTransaction()]);
            this.logger.log(`Created user`);

            return identity._id.toString();
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Error while creating user with username ${credentials.username}: ${error.message}`);
            }
            await Promise.all([stsession.abortTransaction(), identitySession.abortTransaction()]);
            this.logger.error(`Rolled back transaction`);
            throw new Error('Error while creating user');
        } finally {
            this.logger.log(`Ending session`);
            await Promise.all([stsession.endSession(), identitySession.endSession(), neo4jSession.close()]);
        }
    }

    async generateToken(username: string, password: string): Promise<string> {
        const identity = await this.identityModel.findOne({ username: username }).exec();

        if (!identity || !(await compare(password, identity.hash))) throw new Error('Invalid credentials');

        return this.jwtService.sign({ sub: identity._id, username, roles: identity?.roles });
    }

    async getIdentity(username: string) {
        return this.identityModel.findOne({ username: username }).exec();
    }

    async updateIdentity(username: string, updatedCredentials: IIdentity) {
        return this.identityModel.updateOne({ username: username }, updatedCredentials, { new: true }).exec();
    }

    async delete(username: string) {
        this.logger.log(`Removing user with id ${username} (including identity)`);
        const stsession = await this.stconnection.startSession();
        const identitySession = await this.identityConnection.startSession();
        const neo4jSession = this.neo4jService.getWriteSession();

        stsession.startTransaction();
        identitySession.startTransaction();
        const transaction = neo4jSession.beginTransaction();
        this.logger.log(`Started transaction`);

        try {
            const user = await this.userModel.deleteOne({ username: username }).session(stsession);
            await this.identityModel.deleteOne({ username: username }).session(identitySession);
            try {
                transaction.run('MATCH (u:User {username: $username}) DETACH DELETE u', { username: username });
            } catch (error) {
                transaction.rollback();
                throw error;
            }
            await transaction.commit(); //can't rollback if something goes wrong while committing
            await Promise.all([stsession.commitTransaction(), identitySession.commitTransaction()]);
            this.logger.log(`Deleted user and identity`);
            return user;
        } catch (error) {
            this.logger.error(`Error while deleting user with id ${username}: ${error}`);
            await Promise.all([stsession.abortTransaction(), identitySession.abortTransaction()]);
            this.logger.error(`Rolled back transaction`);
            throw new Error(`Error while deleting user with id ${username}: ${error}`);
        } finally {
            this.logger.log(`Ended transaction`);
            await Promise.all([stsession.endSession(), identitySession.endSession(), neo4jSession.close()]);
        }
    }
}
