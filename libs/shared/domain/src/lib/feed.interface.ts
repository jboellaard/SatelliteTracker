import { Id } from './id.type';

export enum FeedItemType {
    created = 'created',
    updated = 'updated',
    followed = 'followed',
    tracked = 'tracked',
    follower = 'follower',
}

export interface FeedItem {
    _id?: Id;
    id?: Id;
    type: FeedItemType;
    userId: Id;
    itemDate: Date;
    title: string;
    description: string;
}
