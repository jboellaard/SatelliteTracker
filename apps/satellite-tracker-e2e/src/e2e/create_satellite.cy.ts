import { satellite, satelliteParts, satelliteWithParts, user } from '../fixtures/constants';

describe('User story: Create a new satellite with custom parts', () => {
    beforeEach(() => {
        cy.login(user.username!, 'test');
        // Navigate to the new satellite page
        cy.getAllSatelliteParts();
        cy.visit(`/users/${user.username}/satellites/new`);
        cy.wait('@getAllSatelliteParts');
    });

    it('should navigate to the new satellite page', () => {
        // Navigates to different page and uses button to navigate to the new satellite page
        cy.visit('/feed/following');
        cy.get('button#add-satellite-button').click();
        cy.url().should('include', '/satellites/new');
    });

    it('should not enable submit button if not all required fields are filled', () => {
        cy.get('button[type="submit"]').should('be.disabled');

        cy.get('input[name="name"]').type('Test Satellite');
        cy.get('button[type="submit"]').should('be.disabled');

        cy.get('input[name="sizeOfBase"]').type('2');
        cy.get('button[type="submit"]').should('be.disabled');

        cy.get('input[name="mass"]').type('1');
        cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should show error messages if inputs are invalid', () => {
        cy.get('input[name="name"]').focus().blur().should('have.class', 'ng-invalid');
        cy.get('mat-error').contains('Name is required');

        cy.get('input[name="name"]').type('   ');
        cy.get('input[name="name"]').focus().blur().should('have.class', 'ng-invalid');
        cy.get('mat-error').contains('Name cannot contain only whitespace');

        cy.get('input[name="sizeOfBase"]').focus().blur().should('have.class', 'ng-invalid');
        cy.get('mat-error').eq(1).contains('Size of base must be at least 2 meters');

        cy.get('input[name="sizeOfBase"]').type('{backspace}');
        cy.get('input[name="sizeOfBase"]').focus().blur().should('have.class', 'ng-invalid');
        cy.get('mat-error').eq(1).contains('Size of base is required');

        cy.get('input[name="mass"]').focus().blur().should('have.class', 'ng-invalid');
        cy.get('mat-error').eq(2).contains('Mass must be at least 1 kg');

        cy.get('input[name="mass"]').type('{backspace}');
        cy.get('input[name="mass"]').focus().blur().should('have.class', 'ng-invalid');
        cy.get('mat-error').eq(2).contains('Mass is required');

        cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should show an error message if the satellite could not be created', () => {
        // Prepare mocked API calls
        cy.intercept(
            {
                method: 'POST',
                url: `${Cypress.env('baseUrlApi')}satellites`,
            },
            {
                statusCode: 400,
                body: {
                    error: 'Error creating satellite',
                },
                headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
            }
        ).as('createSatelliteError');

        // Fill out form
        cy.get('button[type="submit"]').should('be.disabled');
        cy.get('input[name="name"]').type(satellite.satelliteName);
        cy.get('mat-select[name="purpose"]').click().get('mat-option').contains(satellite.purpose!).click();
        cy.get('textarea[name="description"]').type(satellite.description!);
        cy.get('input[name="sizeOfBase"]').type(`${satellite.sizeOfBase}`);
        cy.get('input[name="mass"]').type(`${satellite.mass}`);
        cy.get('button[type="submit"]').should('not.be.disabled');

        // Submit and check if a confirmation dialog is shown
        cy.get('button[type="submit"]').click();
        expect(cy.get('mat-dialog-container')).to.exist;
        cy.get('button').contains('Yes').click();

        // Catch the requests
        cy.wait('@createSatelliteError');

        // Check if the snackbar is shown
        expect(cy.get('simple-snack-bar').contains('The request was invalid')).to.exist;
    });

    it('should not create a new satellite if the user already has a satellite with the same name', () => {
        // Prepare mocked API calls
        cy.intercept(
            {
                method: 'POST',
                url: `${Cypress.env('baseUrlApi')}satellites`,
            },
            {
                statusCode: 400,
                body: {
                    status: 400,
                    statusText: 'Bad Request',
                    message: 'duplicate key value violates unique constraint "satellites_satellite_name_key"',
                    error: {
                        statusCode: 400,
                    },
                },
                headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
            }
        ).as('createSatelliteError');

        // Fill out form
        cy.get('input[name="name"]').type(satellite.satelliteName);
        cy.get('input[name="sizeOfBase"]').type(`${satellite.sizeOfBase}`);
        cy.get('input[name="mass"]').type(`${satellite.mass}`);

        // Submit and check if a confirmation dialog is shown
        cy.get('button[type="submit"]').click();
        expect(cy.get('mat-dialog-container')).to.exist;
        cy.get('button').contains('Yes').click();

        // Catch the requests
        cy.wait('@createSatelliteError');

        // Check if the snackbar is shown
        expect(cy.get('simple-snack-bar').contains('You have already created a satellite with this name')).to.exist;
    });

    it('should create a new satellite and redirect to detail page', () => {
        // Prepare mocked API calls
        cy.intercept(
            {
                method: 'GET',
                url: `${Cypress.env('baseUrlApi')}users/${user.username}/tracking`,
            },
            {
                statusCode: 200,
                body: {
                    result: [satellite],
                },
                headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
            }
        ).as('getNewTracking');
        cy.intercept(
            {
                method: 'GET',
                url: `${Cypress.env('baseUrlApi')}users/${user.username}/satellites`,
            },
            {
                statusCode: 200,
                body: {
                    result: [satellite],
                },
                headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
            }
        ).as('getNewSatellites');
        cy.createSatellite({ ...satellite, id: undefined });
        cy.getSatelliteById(satellite.id!);

        // Fill out form
        cy.get('button[type="submit"]').should('be.disabled');
        cy.get('input[name="name"]').type(satellite.satelliteName);
        cy.get('mat-select[name="purpose"]').click().get('mat-option').contains(satellite.purpose!).click();
        cy.get('textarea[name="description"]').type(satellite.description!);
        cy.get('input[name="sizeOfBase"]').type(`${satellite.sizeOfBase}`);
        cy.get('input[name="mass"]').type(`${satellite.mass}`);
        cy.get('button[type="submit"]').should('not.be.disabled');

        // Submit and check if a confirmation dialog is shown
        cy.get('button[type="submit"]').click();
        expect(cy.get('mat-dialog-container')).to.exist;
        cy.get('button').contains('Yes').click();

        // Catch the requests
        cy.wait('@createSatellite');
        cy.wait('@getNewTracking');
        cy.wait('@getNewSatellites');

        // Check if the snackbar is shown
        expect(cy.get('simple-snack-bar').contains('Satellite created successfully')).to.exist;

        // Check if the user is redirected to the detail page of the new satellite
        cy.wait('@getSatelliteById');
        cy.url().should('include', `/users/${user.username}/satellites/${satellite.id}/info`);
        cy.get('h1').contains(satellite.satelliteName);

        // Check if the satellite is added to the sidebar
        expect(cy.get('a.active div.side-bar-content-item').contains(satellite.satelliteName)).to.exist;

        // Check if the tracking list is updated and the satellite is tracked
        cy.get('button').contains('Untrack').should('exist');
    });

    it('should give an error if a user adds satellite parts without any of their dependencies', () => {
        // Prepare spy for create satellite request
        cy.intercept(`${Cypress.env('baseUrlApi')}satellites`, cy.spy().as('createSatelliteSpy'));
        cy.createSatellite({ ...satelliteWithParts, id: undefined });
        cy.getSatelliteById(satelliteWithParts.id!);

        // Fill out form
        cy.get('button[type="submit"]').should('be.disabled');
        cy.get('input[name="name"]').type(satelliteWithParts.satelliteName);
        cy.get('mat-select[name="purpose"]').click().get('mat-option').contains(satelliteWithParts.purpose!).click();
        cy.get('textarea[name="description"]').type(satelliteWithParts.description!);
        cy.get('input[name="sizeOfBase"]').type(`${satelliteWithParts.sizeOfBase}`);
        cy.get('input[name="mass"]').type(`${satelliteWithParts.mass}`);

        cy.get('button').contains('Add part').click();
        cy.get('mat-expansion-panel-header').contains(satelliteParts[3].partName).click();
        cy.get('input[name="size"]').type(`${1}`);
        cy.get('input[name="quantity"]').type(`${1}`);
        cy.get('div.mat-mdc-dialog-actions button').contains('Add').click();

        // Submit and check if an error is shown
        cy.get('button[type="submit"]').click();
        cy.get('@createSatelliteSpy').should('not.have.been.called');
        let dependencies = '';
        for (let i = 0; i < satelliteParts[3].dependsOn!.length; i++) {
            if (i == satelliteParts[3].dependsOn!.length - 1) {
                dependencies += satelliteParts[3].dependsOn![i].partName;
            } else {
                dependencies += satelliteParts[3].dependsOn![i].partName + ', ';
            }
        }
        cy.get('div.alert').contains(
            `The part ${satelliteParts[3].partName} cannot function if the satellite does not have any of the following parts: ${dependencies}, please add at least one.`
        );

        // Add the dependencies and submit again
        cy.get('button').contains('Add part').click();
        cy.get('mat-expansion-panel-header').contains(satelliteParts[3].dependsOn![0].partName).click();
        cy.get('input[name="size"]').type(`${1}`);
        cy.get('input[name="quantity"]').type(`${1}`);
        cy.get('div.mat-mdc-dialog-actions button').contains('Add').click();

        cy.get('div.alert').should('not.exist');
        cy.get('button[type="submit"]').click();
        cy.get('button').contains('Yes').click();
        cy.wait('@createSatellite');
        cy.wait('@getSatelliteById');
    });

    it('should create a new satellite with satelliteparts and redirect to detail page', () => {
        // Prepare mocked API calls
        cy.intercept(
            {
                method: 'GET',
                url: `${Cypress.env('baseUrlApi')}users/${user.username}/tracking`,
            },
            {
                statusCode: 200,
                body: {
                    result: [satelliteWithParts],
                },
                headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
            }
        ).as('getNewTracking');
        cy.intercept(
            {
                method: 'GET',
                url: `${Cypress.env('baseUrlApi')}users/${user.username}/satellites`,
            },
            {
                statusCode: 200,
                body: {
                    result: [satelliteWithParts],
                },
                headers: { 'access-control-allow-origin': '*', 'Content-Type': 'application/json' },
            }
        ).as('getNewSatellites');
        cy.createSatellite({ ...satelliteWithParts, id: undefined });
        cy.getSatelliteById(satelliteWithParts.id!);

        // Fill out form
        cy.get('button[type="submit"]').should('be.disabled');
        cy.get('input[name="name"]').type(satelliteWithParts.satelliteName);
        cy.get('mat-select[name="purpose"]').click().get('mat-option').contains(satelliteWithParts.purpose!).click();
        cy.get('textarea[name="description"]').type(satelliteWithParts.description!);
        cy.get('input[name="sizeOfBase"]').type(`${satelliteWithParts.sizeOfBase}`);
        cy.get('input[name="mass"]').type(`${satelliteWithParts.mass}`);

        // Add satelliteparts
        satelliteWithParts.satelliteParts!.forEach((part) => {
            cy.get('button').contains('Add part').click();
            cy.get('mat-expansion-panel-header').contains(part.satellitePart.partName).click();
            cy.get('input[name="size"]').type(`${part.size}`);
            cy.get('input[name="quantity"]').type(`${part.quantity}`);
            cy.get('div.mat-mdc-dialog-actions button').contains('Add').click();
        });

        // Submit and check if a confirmation dialog is shown
        cy.get('button[type="submit"]').click();
        expect(cy.get('mat-dialog-container')).to.exist;
        cy.get('button').contains('Yes').click();

        // Catch the requests
        cy.wait('@createSatellite');
        cy.wait('@getNewTracking');
        cy.wait('@getNewSatellites');

        // Check if the snackbar is shown
        expect(cy.get('simple-snack-bar').contains('Satellite created successfully')).to.exist;

        // Check if the user is redirected to the detail page of the new satellite
        cy.wait('@getSatelliteById');
        cy.url().should('include', `/users/${user.username}/satellites/${satelliteWithParts.id}/info`);
        cy.get('h1').contains(satelliteWithParts.satelliteName);

        // Check if the satellite is added to the sidebar
        expect(cy.get('a.active div.side-bar-content-item').contains(satelliteWithParts.satelliteName)).to.exist;

        // Check if the tracking list is updated and the satellite is tracked
        cy.get('button').contains('Untrack').should('exist');
    });
});
