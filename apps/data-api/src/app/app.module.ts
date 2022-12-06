import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SatelliteModule } from './satellite/satellite.module';
import { RolesGuard } from './auth/roles.guard';
import { Neo4jModule } from './neo4j/neo4j.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        UserModule,
        SatelliteModule,
        MongooseModule.forRoot(
            `mongodb+srv://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
            {
                connectionName: 'satellitetrackerdb',
            }
        ),
        MongooseModule.forRoot(
            `mongodb+srv://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}/${process.env.MONGO_IDENTITYDB}?retryWrites=true&w=majority`,
            {
                connectionName: 'identitydb',
            }
        ),
        Neo4jModule.forRoot({
            scheme: 'neo4j+s',
            host: `${process.env.NEO4J_HOST}`,
            username: `${process.env.NEO4J_USR}`,
            password: `${process.env.NEO4J_PWD}`,
            database: `${process.env.NEO4J_DATABASE}`,
        }),
        RouterModule.register([]),
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AppModule {}
