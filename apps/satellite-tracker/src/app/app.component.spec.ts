import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { BreadcrumbsComponent } from './shared/breadcrumbs/breadcrumbs.component';
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';

describe('AppComponent', () => {
    let mockAuthService: any;
    let mockRouter: any;

    mockAuthService = {
        user$: jest.fn(() => of({ id: '1', username: 'username' })),
    };

    mockRouter = {
        url: '/',
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatSnackBarModule, MatIconModule, MatToolbarModule],
            declarations: [AppComponent, NavbarComponent, BreadcrumbsComponent, FooterComponent],
            providers: [
                { provide: 'AuthService', useValue: mockAuthService },
                { provide: 'Router', useValue: mockRouter },
            ],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have as title 'satellite-tracker'`, () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.title).toEqual('satellite-tracker');
    });
});
