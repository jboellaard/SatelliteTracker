import { Component } from '@angular/core';

@Component({
    selector: 'app-page-not-found',
    template: `<p>No pages seem to match this route, try navigating to a different page.</p>
        <a routerLink="/">Go to home page</a>`,
    styles: [
        `
            p,
            a {
                margin: 1rem;
            }
        `,
    ],
})
export class PageNotFoundComponent {}
