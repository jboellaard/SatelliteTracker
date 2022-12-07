import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { Neo4jModule } from './neo4j/neo4j.module';
import { UserModule } from './user/user.module';
import { SatelliteModule } from './satellite/satellite.module';
import { Identity, IdentitySchema } from './auth/schemas/identity.schema';
import { Satellite, SatelliteSchema, SatellitePart, SatellitePartSchema } from './satellite/satellite.schema';
import { User, UserSchema } from './user/user.schema';
import { DbseedModule } from './dbseed/dbseed.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            connectionName: 'satellitetrackerdb',
            useFactory: () => ({
                uri: `mongodb+srv://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority&readPreference=primary&ssl=true`,
            }),
        }),
        MongooseModule.forRootAsync({
            connectionName: 'identitydb',
            useFactory: () => ({
                uri: `mongodb+srv://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}/${process.env.MONGO_IDENTITYDB}?retryWrites=true&w=majority&readPreference=primary&ssl=true`,
            }),
        }),
        Neo4jModule.forRootAsync({
            scheme: 'neo4j+s',
            host: `${process.env.NEO4J_HOST}`,
            username: `${process.env.NEO4J_USR}`,
            password: `${process.env.NEO4J_PWD}`,
            database: `${process.env.NEO4J_DATABASE}`,
        }),
        UserModule,
        SatelliteModule,
        AuthModule,
        DbseedModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
