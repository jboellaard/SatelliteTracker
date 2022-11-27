import { IEntity } from 'ui/entity';
import { Id, Orbit, Satellite } from 'shared/domain';

export class SatelliteImplemented implements Satellite, IEntity {
  id: Id | undefined;
  name!: string;
  mass!: number;
  radiusOfBase!: number;
  radiusOfParts!: number;
  colorOfBase!: string;
  purpose!: string;
  orbit?: Orbit;
  createdAt!: Date;
  lastUpdated!: Date;
  createdBy!: Id;

  constructor(values = {}) {
    // Assign all values to this objects properties
    Object.assign(this, values);
  }
}
