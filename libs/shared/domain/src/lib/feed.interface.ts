import { Id } from './id.type';

export enum FeedItemType {
    created = 'created',
    updated = 'updated',
    followed = 'followed',
    tracked = 'tracked',
    follower = 'follower',
}

export interface FeedItem {
    type: FeedItemType;
    username: string;
    followed?: string;
    satelliteName?: string;
    satelliteId?: Id;
    createdBy?: string;
    changed?: string;
    date: string;
    title?: string;
    description?: string;
}
