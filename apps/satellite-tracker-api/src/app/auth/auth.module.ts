import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Identity, IdentitySchema } from './schemas/identity.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AccessJwtStrategy } from './guards/access-jwt.strategy';
import { UserService } from '../user/user.service';
import { RefreshJwtStrategy } from './guards/refresh-jwt.strategy';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Identity.name, schema: IdentitySchema }], 'identitydb'),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], 'satellitetrackerdb'),
        PassportModule,
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [AuthService, UserService, AccessJwtStrategy, RefreshJwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
