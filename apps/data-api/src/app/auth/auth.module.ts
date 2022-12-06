import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Identity, IdentitySchema } from './identity.schema';
import { User, UserSchema } from '../user/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Identity.name, schema: IdentitySchema }], 'identitydb'),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], 'satellitetrackerdb'),
        PassportModule,
        JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1d' } }),
    ],
    controllers: [AuthController],
    providers: [AuthService, UserService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
