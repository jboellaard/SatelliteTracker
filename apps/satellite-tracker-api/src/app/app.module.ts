import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { UserModule } from './user/user.module';
import { SatelliteModule } from './satellite/satellite.module';
import { DbseedModule } from './dbseed/dbseed.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { APIResponseInterceptor } from './api-response.interceptor';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { FeedModule } from './feed/feed.module';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            connectionName: `${process.env.MONGO_DATABASE}`,
            useFactory: () => ({
                uri: `mongodb+srv://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority&readPreference=primary&ssl=true`,
            }),
        }),
        MongooseModule.forRootAsync({
            connectionName: `${process.env.MONGO_IDENTITYDB}`,
            useFactory: () => ({
                uri: `mongodb+srv://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}/${process.env.MONGO_IDENTITYDB}?retryWrites=true&w=majority&readPreference=primary&ssl=true`,
            }),
        }),
        Neo4jModule.forRootAsync({
            scheme: 'neo4j+s',
            host: process.env.NEO4J_HOST,
            username: process.env.NEO4J_USR,
            password: process.env.NEO4J_PWD,
            database: process.env.NEO4J_DATABASE,
        }),
        UserModule,
        SatelliteModule,
        AuthModule,
        DbseedModule,
        RecommendationsModule,
        FeedModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: APIResponseInterceptor,
        },
    ],
})
export class AppModule {}
