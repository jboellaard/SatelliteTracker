import { Component, OnInit } from '@angular/core';

export interface UserStory {
  no: number;
  story: string;
  clarification: string;
}

// -	I can create a satellite with a chosen set of satellite parts.
// -	I want to customise the colour of a satellite part that I add to my satellite.
// -	I can create the orbit that I want the satellite to follow. A satellite cannot be launched if it does not have an orbit.
// -	For a satellite that I made, I want to be able to create a launch event where the satellite will be launched into its planned orbit.
// -	I want to be able to edit and delete satellites, orbits and launches that I’ve created. The entities can no longer be edited when a satellite is launched, but they can be deleted.
// -	As a user I want to be able to follow satellites made by other people.
// -	I want to know when the satellites I follow are being launched.
// -	Of the satellites that I’m following, I want to see if they are visible at my location at a given time.
// -	I want to be able to follow other users so that I can keep up with my favourite creators and track their latest satellites.
// -	I want to see who people I follow, follow themselves, to find new users.
// -	I want to receive recommendations of satellites based on the number of users following that satellite.

const USERSTORY_DATA: UserStory[] = [
  { no: 1, story: 'I can create a satellite with a chosen set of satellite parts. ', clarification: '' },
  { no: 2, story: 'I want to customise the colour of a satellite part that I add to my satellite.', clarification: '' },
  {
    no: 3,
    story: 'I can create the orbit that I want the satellite to follow.',
    clarification: 'A satellite cannot be launched if it does not have an orbit.',
  },
  {
    no: 4,
    story:
      'For a satellite that I made, I want to be able to create a launch event where the satellite will be launched into its planned orbit. ',
    clarification: '',
  },
  {
    no: 5,
    story: 'I want to be able to edit and delete satellites, orbits and launches that I’ve created.',
    clarification: 'The entities can no longer be edited when a satellite is launched, but they can be deleted.',
  },
  { no: 6, story: 'As a user I want to be able to follow satellites made by other people.', clarification: '' },
  { no: 7, story: 'I want to know when the satellites I follow are being launched. ', clarification: '' },
  {
    no: 8,
    story: 'Of the satellites that I`m following, I want to see if they are visible at my location at a given time.',
    clarification: 'The user can choose the date and time.',
  },
  {
    no: 9,
    story:
      'I want to be able to follow other users so that I can keep up with my favourite creators and track their latest satellites. ',
    clarification: '',
  },
  { no: 10, story: 'I want to see who people I follow, follow themselves, to find new users. ', clarification: '' },
  {
    no: 11,
    story: 'I want to receive recommendations of satellites based on the number of users following that satellite. ',
    clarification: '',
  },
];

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  userStoryColumns: string[] = ['No.', 'User story', 'Clarification']; //add which component implements the user story
  dataSourceUserStories = USERSTORY_DATA;
  constructor() {}

  ngOnInit(): void {}
}
