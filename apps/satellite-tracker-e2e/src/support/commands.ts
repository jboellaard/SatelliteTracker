// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands

// ***********************************************
const constants = require('../fixtures/constants.ts');

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
        login(username: string, password: string): void;
        getFollowing(username: string): void;
        getTracking(username: string): void;
        getSatellites(username: string): void;
        getFollowingFeed(username: string): void;
        getAllSatelliteParts(): void;
        createSatellite(satellite: any): void;
        getSatelliteById(id: string): void;
        getProfileOfUserWithUsername(username: string): void;
        followUser(username: string): void;
        unfollowUser(username: string): void;
    }
}
//
// -- This is a parent command --
Cypress.Commands.add('login', (username, password) => {
    cy.window().then((win) => {
        cy.spy(win.console, 'log');
    });
    cy.window().then((win) => {
        cy.spy(win.console, 'error');
    });
    cy.intercept(
        {
            method: 'POST',
            url: `${Cypress.env('baseUrlApi')}login`,
        },
        {
            statusCode: 200,
            body: {
                result: {
                    accessToken: 'an_access_token',
                    refreshToken: 'a_refresh_token',
                    user: {
                        id: 1,
                        username: `${username}`,
                        roles: ['user'],
                    },
                    refreshTokenExpiresIn: '1d',
                },
            },
            headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
        }
    ).as('login');
    cy.getSatellites(username);
    cy.getFollowing(username);
    cy.getTracking(username);
    cy.getFollowingFeed(username);

    cy.visit('/login');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(`${password}{enter}`);
    cy.wait('@login').then(() => {
        cy.wrap(localStorage.getItem('access_token')).should('eq', 'an_access_token');
    });
    cy.wait('@getSatellites');
    cy.wait('@getFollowingFeed');

    cy.url().should('include', '/feed');
});

Cypress.Commands.add('getFollowing', (username) => {
    cy.intercept(
        {
            method: 'GET',
            url: `${Cypress.env('baseUrlApi')}users/${username}/following`,
        },
        {
            statusCode: 200,
            body: {
                result: [],
            },
            headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
        }
    ).as('getFollowing');
});

Cypress.Commands.add('getTracking', (username) => {
    cy.intercept(
        {
            method: 'GET',
            url: `${Cypress.env('baseUrlApi')}users/${username}/tracking`,
        },
        {
            statusCode: 200,
            body: {
                result: [],
            },
            headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
        }
    ).as('getTracking');
});

Cypress.Commands.add('getSatellites', (username) => {
    cy.intercept(
        {
            method: 'GET',
            url: `${Cypress.env('baseUrlApi')}users/${username}/satellites`,
        },
        {
            statusCode: 200,
            body: {
                result: [],
            },
            headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
        }
    ).as('getSatellites');
});

Cypress.Commands.add('getFollowingFeed', (username) => {
    cy.intercept(
        {
            method: 'GET',
            url: `${Cypress.env('baseUrlApi')}/feed/following`,
        },
        {
            statusCode: 200,
            body: {
                result: [],
            },
            headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
        }
    ).as('getFollowingFeed');
});

Cypress.Commands.add('getAllSatelliteParts', () => {
    cy.intercept(
        {
            method: 'GET',
            url: `${Cypress.env('baseUrlApi')}satellites/parts`,
        },
        {
            statusCode: 200,
            body: {
                result: constants.satelliteParts,
            },
            headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
        }
    ).as('getAllSatelliteParts');
});

Cypress.Commands.add('createSatellite', (satellite) => {
    console.log(satellite);
    if (satellite.satelliteName == constants.satellites[0].satelliteName) {
        satellite = constants.satellites[0];
    } else if (satellite.satelliteName == constants.satellites[1].satelliteName) {
        satellite = constants.satellites[1];
    }
    cy.intercept(
        {
            method: 'POST',
            url: `${Cypress.env('baseUrlApi')}satellites`,
        },
        {
            statusCode: 200,
            body: {
                result: satellite,
            },
            headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
        }
    ).as('createSatellite');
});

Cypress.Commands.add('getSatelliteById', (id) => {
    cy.intercept(
        {
            method: 'GET',
            url: `${Cypress.env('baseUrlApi')}satellites/${id}`,
        },
        {
            statusCode: 200,
            body: {
                result: constants.satellites[+id - 1],
            },
            headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
        }
    ).as('getSatelliteById');
});

Cypress.Commands.add('getProfileOfUserWithUsername', (username) => {
    cy.intercept(
        {
            method: 'GET',
            url: `${Cypress.env('baseUrlApi')}users/${username}`,
        },
        {
            statusCode: 200,
            body: {
                result: constants.users.find((user: any) => user.username == username),
            },
            headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
        }
    ).as('getProfileOfUserWithUsername');
});

Cypress.Commands.add('followUser', (username) => {
    cy.intercept(
        {
            method: 'POST',
            url: `${Cypress.env('baseUrlApi')}users/${username}/follow`,
        },
        {
            statusCode: 200,
            body: {
                status: 200,
                result: [{ username }],
            },
            headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
        }
    ).as('followUser');
});

Cypress.Commands.add('unfollowUser', (username) => {
    cy.intercept(
        {
            method: 'DELETE',
            url: `${Cypress.env('baseUrlApi')}users/${username}/follow`,
        },
        {
            statusCode: 200,
            body: {
                status: 200,
                result: [],
            },
            headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
        }
    ).as('unfollowUser');
});

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
