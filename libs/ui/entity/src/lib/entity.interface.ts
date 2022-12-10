import { Id } from 'shared/domain';

/**
 * Base class for all entities that are part of communication to/from services.
 */
export interface IEntity {
    id?: Id | undefined;
    // userid?: number | undefined;

    // constructor(values: any) {
    //   this.id = values ? values.id : undefined
    //   this.userid = values ? values.userid : undefined
    // }
}
