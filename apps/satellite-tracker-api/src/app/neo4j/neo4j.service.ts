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

    read(cypher: string, params: Record<string, any>, database?: string | Transaction): Result {
        if (database && database instanceof TransactionImpl) {
            return (<Transaction>database).run(cypher, params);
        }
        const session = this.getReadSession(<string>database);
        return session.run(cypher, params);
    }

    write(cypher: string, params: Record<string, any>, database?: string | Transaction): Result {
        if (database && database instanceof TransactionImpl) {
            return (<Transaction>database).run(cypher, params);
        }

        const session = this.getWriteSession(<string>database);
        return session.run(cypher, params);
    }

    onApplicationShutdown() {
        return this.driver.close();
    }
}
