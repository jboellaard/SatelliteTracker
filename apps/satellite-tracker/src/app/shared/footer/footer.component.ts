import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    template: `<footer>
        <p>&#169; 2023 - Satellite Tracker</p>
        <div id="buttons">
            <button mat-button routerLink="/orbit-simulation" routerLinkActive="active" ariaCurrentWhenActive="page">
                Orbit Simulation
            </button>
            <button mat-button routerLink="/about" routerLinkActive="active" ariaCurrentWhenActive="page">About</button>
        </div>
    </footer>`,
    styles: [
        `
            footer {
                display: flex;
                height: 48px;
                padding: 0 16px;
                justify-content: space-between;
                background: #424242;
            }

            #buttons,
            p {
                align-self: center;
            }

            p {
                margin: 0;
            }
        `,
    ],
})
export class FooterComponent {}
