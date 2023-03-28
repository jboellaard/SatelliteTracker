// testing jwt guards, tokens and role-based (returning items based on token username)

//
import mongoose from 'mongoose';
import mockingoose from 'mockingoose';
import { UserSchema } from './app/user/schemas/user.schema';

describe('Satellite tracker API e2e tests', () => {
    describe('Validation and indexes', () => {
        mockingoose(mongoose.model('user', UserSchema)).toReturn({}, 'findOne');
        it('should return a user', async () => {});
    });
});
