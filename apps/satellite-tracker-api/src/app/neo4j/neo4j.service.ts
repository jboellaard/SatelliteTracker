import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import neo4j, { Driver, Result, Session, Transaction, session } from 'neo4j-driver';
import { NEO4J_DRIVER } from './neo4j.constants';
import { TransactionImpl } from 'neo4j-driver/lib/transaction-managed-rx';

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
    constructor(@Inject(NEO4J_DRIVER) private readonly driver: Driver) {}

    getReadSession(database?: string): Session {
        return this.driver.session({
            database: database || process.env.NEO4J_DATABASE,
            defaultAccessMode: neo4j.session.READ,
        });
    }

    getWriteSession(database?: string): Session {
        return this.driver.session({
            database: database || process.env.NEO4J_DATABASE,
            defaultAccessMode: neo4j.session.WRITE,
        });
    }

    read(cypher: string, params: Record<string, any>, database?: string): Result {
        const session = this.getReadSession(database);
        return session.run(cypher, params);
    }

    write(cypher: string, params: Record<string, any>, database?: string): Result {
        const session = this.getWriteSession(database);
        return session.run(cypher, params);
    }

    onApplicationShutdown() {
        return this.driver.close();
    }
}
