import { ISatellite, Shape } from 'shared/domain';

export const satellite: ISatellite = {
    id: '1',
    satelliteName: 'Test Satellite',
    description: 'Test Satellite Description',
    purpose: 'Communication',
    sizeOfBase: 2,
    mass: 1,
    shapeOfBase: Shape.Cube,
    colorOfBase: '#000000',
};
