import { Injectable } from '@nestjs/common';

import mongoose, { Model } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';

import { Identity, IdentityDocument } from './identity.schema';
import { User, UserDocument } from '../user/user.schema';
import { LocationCoordinates } from 'shared/domain';

import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Id, UserRegistration } from 'shared/domain';
import { UpdateUserDto } from '../user/dto/update-user.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Identity.name, 'identitydb') private identityModel: Model<IdentityDocument>,
        @InjectModel(User.name, 'satellitetrackerdb') private userModel: Model<UserDocument>,
        private jwtService: JwtService,
        @InjectConnection('satellitetrackerdb') private connection: mongoose.Connection,
        @InjectConnection('identitydb') private identityConnection: mongoose.Connection
    ) {}

    async createUser(username: string): Promise<string> {
        const user = new this.userModel({
            username,
        });
        await user.save();
        console.log(user._id);
        return user._id.toString();
    }

    async registerUser(username: string, password: string, emailAddress: string) {
        const generatedHash = await hash(password, parseInt(process.env.SALT_ROUNDS!, 10));
        const identity = new this.identityModel({ username, hash: generatedHash, emailAddress });
        await identity.save();
    }

    async generateToken(username: string, password: string): Promise<string> {
        const identity = await this.identityModel.findOne({ username });
        if (!identity || !(await compare(password, identity.hash))) throw new Error('User could not be authenticated');
        const user = await this.userModel.findOne({ username: username });
        return this.jwtService.sign({ username, userId: user?._id });
    }

    async getIdentity(username: string) {
        return this.identityModel.findOne({ username: username });
    }

    updateCredentials(username: string, updatedCredentials: UserRegistration) {
        this.identityModel.updateOne({ username: username }, updatedCredentials, { new: true }, (err, doc) => {
            if (err) {
                console.log('Something wrong when updating data!');
            }
            return doc;
        });
    }

    async delete(userId: Id) {
        console.log('delete');
        const session = await this.connection.startSession();
        const identitySession = await this.identityConnection.startSession();
        session.startTransaction();
        identitySession.startTransaction();
        try {
            const user = await this.userModel.findByIdAndDelete(userId).session(session);
            if (user) await this.identityModel.deleteOne({ username: user.username }).session(identitySession);
            await session.commitTransaction();
            await identitySession.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            await identitySession.abortTransaction();
            throw error;
        } finally {
            session.endSession();
            identitySession.endSession();
        }
    }
}
