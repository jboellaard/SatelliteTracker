import { FeedItem, FeedItemType } from 'shared/domain';
import { user, users, satelliteOfOtherUser } from '../fixtures/constants';

describe('User story: I can follow (and unfollow) other users and see their activities in a feed', () => {
    beforeEach(() => {
        cy.login(user.username!, 'test');
    });

    it('should have a follow button on a user profile', () => {
        cy.getProfileOfUserWithUsername(users[1].username);
        cy.followUser(users[1].username);

        cy.visit(`/profile/${users[1].username}`);
        cy.wait('@getProfileOfUserWithUsername');
        cy.wait('@getFollowing');

        // Redirects to created tab
        cy.url().should('include', 'created');

        cy.get('h1').contains(`${users[1].username}`).should('exist');
        cy.get('button').contains('Follow').should('be.visible');
    });

    it('should follow a user and add that user to the global following list of the logged in user', () => {
        cy.getProfileOfUserWithUsername(users[1].username);
        cy.followUser(users[1].username);

        cy.visit(`/profile/${users[1].username}`);
        cy.wait('@getProfileOfUserWithUsername');
        cy.wait('@getFollowing');

        cy.get('button').contains('Follow').click();

        // New following is immediately added to the following list
        cy.wait('@followUser').then(() => {
            cy.get('button').contains('Unfollow').should('be.visible');
        });
    });

    it('should unfollow a user', () => {
        cy.getProfileOfUserWithUsername(users[1].username);
        cy.intercept(
            {
                method: 'GET',
                url: `${Cypress.env('baseUrlApi')}users/${user.username}/following`,
            },
            {
                statusCode: 200,
                body: {
                    result: [users[1]],
                },
                headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
            }
        ).as('getFollowingWithFollow');
        cy.unfollowUser(users[1].username);

        cy.visit(`/profile/${users[1].username}`);
        cy.wait('@getProfileOfUserWithUsername');
        cy.wait('@getFollowingWithFollow');

        cy.get('h1').contains(`${users[1].username}`).should('exist');
        cy.get('button').contains('Unfollow').should('be.visible');

        cy.get('button').contains('Unfollow').click();

        // New following is immediately added to the following list
        cy.wait('@unfollowUser').then(() => {
            cy.get('button').contains('Follow').should('be.visible');
        });
    });

    it.only('should show a feed of the followed users activities', () => {
        cy.getProfileOfUserWithUsername(users[1].username);
        cy.followUser(users[1].username);
        cy.intercept(
            {
                method: 'GET',
                url: `${Cypress.env('baseUrlApi')}feed/following`,
            },
            {
                statusCode: 200,
                body: {
                    result: [
                        {
                            type: FeedItemType.tracked,
                            username: users[1].username,
                            satelliteName: satelliteOfOtherUser.satelliteName,
                            satelliteId: satelliteOfOtherUser.id,
                            createdBy: satelliteOfOtherUser.createdBy,
                            date: new Date().toISOString(),
                        },
                        {
                            type: FeedItemType.followed,
                            username: users[1].username,
                            followed: users[3].username,
                            date: new Date().toISOString(),
                        },
                        {
                            type: FeedItemType.created,
                            username: users[1].username,
                            satelliteName: 'New satellite',
                            satelliteId: '10',
                            createdBy: users[1].username,
                            date: new Date().toISOString(),
                        },
                    ] as FeedItem[],
                },
                headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
            }
        ).as('getFollowingFeed');

        cy.visit(`/profile/${users[1].username}`);
        cy.wait('@getProfileOfUserWithUsername');
        cy.wait('@getFollowing');

        cy.get('button').contains('Follow').click();
        cy.wait('@followUser').then(() => {
            cy.get('button').contains('Unfollow').should('be.visible');
        });

        cy.get('a').contains('Feed').click();
        cy.wait('@getFollowingFeed');

        expect(cy.get('ul').find('li').should('have.length', 3));
        cy.get('li').each(($el) => {
            cy.wrap($el).contains(users[1].username).should('exist');
        });
    });
});
