import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ISatellite, Shape } from 'shared/domain';
import { AuthService } from '../../../auth/auth.service';
import { ProfileService } from '../../../profile/profile.service';
import { RelationsService } from '../../../auth/relations.service';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { SatelliteService } from '../satellite.service';
import { SatelliteDetailComponent } from './satellite-detail.component';

describe('SatelliteDetailComponent', () => {
    let comp: SatelliteDetailComponent;
    let fixture: ComponentFixture<SatelliteDetailComponent>;

    let mockActivatedRoute: any;
    let mockRouter: any;
    let mockSatelliteService: any;
    let mockRelationsService: any;
    let mockProfileService: any;
    let mockAuthService: any;
    let mockDialog: any;
    let mockSnackBarService: any;

    const customSatelliteParts = [
        {
            satellitePart: {
                id: '1',
                partName: 'Part 1',
                description: 'Part 1 description',
            },
            color: '#000000',
            quantity: 1,
            size: 1,
        },
        {
            satellitePart: {
                id: '2',
                partName: 'Part 2',
                description: 'Part 2 description',
            },
            color: '#000000',
            quantity: 1,
            size: 1,
        },
    ];

    const creator = {
        id: '1',
        username: 'test_user',
    };

    const satellite: ISatellite = {
        id: '1',
        satelliteName: 'Satellite 1',
        description: 'Satellite 1 description',
        mass: 100,
        sizeOfBase: 100,
        colorOfBase: '#000000',
        shapeOfBase: Shape.Cube,
        purpose: 'Satellite 1 purpose',
        satelliteParts: customSatelliteParts,
        createdBy: creator.username,
        orbit: {
            semiMajorAxis: 10000,
        },
    };

    const visitor = {
        id: '2',
        username: 'different_test_user',
    };

    beforeEach(async () => {
        mockActivatedRoute = {
            paramMap: of(convertToParamMap({ satelliteId: satellite.id, username: creator.username })),
        };

        mockRouter = {
            navigate: jest.fn(),
        };

        mockSatelliteService = {
            delete: jest.fn(() => of(satellite)),
            getById: jest.fn(() => of(satellite)),
            currentSatellite$: {
                next: jest.fn(),
            },
            canEdit$: {
                next: jest.fn(),
            },
            trackersOfCurrentSatellite$: {
                next: jest.fn(),
            },
        };

        mockRelationsService = {
            getTracking: jest.fn(() => of([satellite])),
            tracking$: of([satellite]),
        };

        mockProfileService = {
            trackSatellite: jest.fn(() => of({})),
            untrackSatellite: jest.fn(() => of({})),
        };

        mockAuthService = {
            user$: of({ id: visitor.id, username: visitor.username }),
        };

        mockDialog = {
            open: jest.fn(() => ({
                afterClosed: jest.fn(() => of('ok')),
            })),
        };

        mockSnackBarService = {
            success: jest.fn(() => of({})),
            error: jest.fn(() => of({})),
        };

        await TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                MatDividerModule,
                MatDialogModule,
                MatSnackBarModule,
                MatTooltipModule,
                MatIconModule,
            ],
            declarations: [SatelliteDetailComponent],
            providers: [
                { provide: SatelliteService, useValue: mockSatelliteService },
                { provide: RelationsService, useValue: mockRelationsService },
                { provide: AuthService, useValue: mockAuthService },
                { provide: ProfileService, useValue: mockProfileService },
                { provide: MatDialog, useValue: mockDialog },
                { provide: SnackBarService, useValue: mockSnackBarService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: mockRouter },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SatelliteDetailComponent);
        comp = fixture.componentInstance;
    });

    it('should create', () => {
        expect(comp).toBeTruthy();
    });

    it('should get the logged in user on init', () => {
        comp.ngOnInit();
        expect(comp.loggedInUser).toEqual({ id: visitor.id, username: visitor.username });
        expect(comp.userId).toEqual('2');
    });

    it('should get the tracking of the logged in user on init and check if the user is tracking that satellite', () => {
        comp.ngOnInit();
        expect(comp.tracking).toEqual([satellite]);
        expect(comp.isTracking()).toEqual(true);
    });

    it('should get the satellite on init', () => {
        comp.ngOnInit();
        expect(comp.satellite).toEqual(satellite);
    });

    it('should redirect to the profile page if the satellite does not exist', () => {
        mockSatelliteService.getById = jest.fn(() => of(undefined));
        comp.ngOnInit();
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/profile/${creator.username}/`]);

        mockActivatedRoute.paramMap = of(convertToParamMap({ username: creator.username }));
        comp.ngOnInit();
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/profile/${creator.username}/`]);
    });

    it('should not enable editing if the user is not the owner of the satellite', () => {
        comp.ngOnInit();
        expect(comp.canEdit).toEqual(false);
        expect(mockSatelliteService.canEdit$.next).toHaveBeenCalledWith(false);
    });

    it('should enable editing if the user is the owner of the satellite', () => {
        mockAuthService.user$ = of({ id: creator.id, username: creator.username });
        comp.ngOnInit();
        expect(comp.canEdit).toEqual(true);
        expect(mockSatelliteService.canEdit$.next).toHaveBeenCalledWith(true);
    });

    it('should track the satellite', () => {
        comp.ngOnInit();
        comp.track();
        expect(mockProfileService.trackSatellite).toHaveBeenCalledWith(satellite.id);
    });

    it('should untrack the satellite', () => {
        comp.ngOnInit();
        comp.untrack();
        expect(mockProfileService.untrackSatellite).toHaveBeenCalledWith(satellite.id);
    });

    it('should delete the satellite', () => {
        comp.ngOnInit();
        comp.removeSatellite();
        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockSatelliteService.delete).toHaveBeenCalledWith(satellite.id);
        expect(mockRelationsService.getTracking).toHaveBeenCalled();
        expect(mockSnackBarService.success).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith([`/profile/${creator.username}/`]);
    });

    it('should not delete the satellite if the user cancels the dialog', () => {
        mockDialog.open = jest.fn(() => ({
            afterClosed: jest.fn(() => of('')),
        }));

        comp.ngOnInit();
        comp.removeSatellite();
        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockSatelliteService.delete).not.toHaveBeenCalled();
        expect(mockRelationsService.getTracking).not.toHaveBeenCalled();
        expect(mockSnackBarService.success).not.toHaveBeenCalled();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should give an error if the satellite could not be deleted', () => {
        mockSatelliteService.delete = jest.fn(() => of(undefined));
        comp.ngOnInit();
        comp.removeSatellite();
        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockSatelliteService.delete).toHaveBeenCalledWith(satellite.id);
        expect(mockSnackBarService.error).toHaveBeenCalled();
    });
});
