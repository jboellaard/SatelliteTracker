import { Component } from '@angular/core';

export interface UserStory {
    story: string;
    notes: string | undefined;
}

const USERSTORY_DATA: UserStory[] = [
    {
        story: 'I can create a satellite with a chosen set of satellite parts. ',
        notes: 'A custom satellite part has its own size and color.',
    },
    {
        story: 'I can create the orbit that I want the satellite to follow.',
        notes: '',
    },
    {
        story: 'I can see the orbit of a satellite to get a better idea of its mechanics.',
        notes: '',
    },
    {
        story: 'I can edit and delete satellites and orbits that I’ve created.',
        notes: '',
    },
    {
        story: 'I can follow (and unfollow) other users and see their activities in a feed, so I can keep up with my favorite creators.',
        notes: '',
    },
    {
        story: 'I can view the profile of a user to see their creations, followers, following and tracking.',
        notes: '',
    },
    {
        story: 'I can track (and untrack) satellites and see the latest changes in a feed, so I know when a satellite was last updated.',
        notes: 'You can see if a satellite or its orbit was updated.',
    },
    {
        story: 'I want to receive recommendations on who to follow based on who the users I follow follow.',
        notes: '',
    },
    {
        story: 'I want to receive recommendations of satellites based on what satellites are being tracked by users I follow and who they follow.',
        notes: '',
    },
    {
        story: 'I want to see creators similar to me based on the satellites I have created.',
        notes: '',
    },
    {
        story: 'I can see the most followed users and most tracked satellites to know what is popular.',
        notes: '',
    },
    {
        story: 'As admin I can see an overview of all users and delete them if necessary.',
        notes: 'The satellites of the deleted user will be deleted as well.',
    },
];

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
    userStoryColumns: string[] = ['No.', 'User story', 'Notes'];
    dataSourceUserStories = USERSTORY_DATA;
}
