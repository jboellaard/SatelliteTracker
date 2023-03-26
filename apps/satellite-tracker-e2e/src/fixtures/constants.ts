import { ICustomSatellitePart, ISatellite, ISatellitePart, IUserInfo, Shape, UserIdentity } from 'shared/domain';

export const user: UserIdentity = {
    username: 'test',
};

export const users: IUserInfo[] = [
    {
        username: 'test',
    },
    {
        username: 'test2',
    },
    {
        username: 'test3',
    },
    {
        username: 'test4',
    },
    {
        username: 'test5',
    },
];

export const satellite: ISatellite = {
    id: '1',
    satelliteName: 'Test Satellite',
    description: 'Test Satellite Description',
    purpose: 'Communication',
    sizeOfBase: 2,
    mass: 1,
    shapeOfBase: Shape.Cube,
    colorOfBase: '#000000',
    createdBy: 'test',
};

export const satelliteParts: ISatellitePart[] = [
    {
        id: '1',
        partName: 'example name',
        description: 'example description',
        function: 'example function',
    },
    {
        id: '2',
        partName: 'example name 2',
        description: 'example description 2',
        function: 'example function 2',
    },
    {
        id: '3',
        partName: 'example name 3',
        description: 'example description 3',
        function: 'example function 3',
    },
    {
        id: '4',
        partName: 'example name 4',
        description: 'example description 4',
        function: 'example function 4',
        dependsOn: [
            {
                partName: 'example name',
            },
            {
                partName: 'example name 2',
            },
        ],
    },
];

export const validCustomParts: ICustomSatellitePart[] = [
    {
        satellitePart: satelliteParts[0],
        quantity: 1,
        color: '#000000',
        size: 1,
    },
    {
        satellitePart: satelliteParts[3],
        quantity: 1,
        color: '#000000',
        size: 1,
    },
];

export const invalidCustomParts: ICustomSatellitePart[] = [
    {
        satellitePart: satelliteParts[2],
        quantity: 1,
        color: '#000000',
        size: 1,
    },
    {
        satellitePart: satelliteParts[3],
        quantity: 1,
        color: '#000000',
        size: 1,
    },
];

export const satelliteWithParts: ISatellite = {
    ...satellite,
    satelliteName: 'Test Satellite 2',
    id: '2',
    satelliteParts: validCustomParts,
};

export const satellites = [satellite, satelliteWithParts];

export const satelliteOfOtherUser: ISatellite = {
    ...satellite,
    satelliteName: 'Test Satellite 3',
    id: '3',
    createdBy: users[2].username,
};
