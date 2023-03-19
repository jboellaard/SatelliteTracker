import { Id } from 'shared/domain';

/**
 * Base class for all entities
 */
export interface IEntity {
    id?: Id | undefined;
}
