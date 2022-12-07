import { IUser, Id, ILocation } from 'shared/domain';
import { IEntity } from 'ui/entity';

export class User implements IUser, IEntity {
    id: Id;
    username!: string;
    profileDescription!: string;
    emailAddress!: string;
    password?: string | undefined;
    location!: ILocation;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(values = {}) {
        // Assign all values to this objects properties
        Object.assign(this, values);
    }
}
