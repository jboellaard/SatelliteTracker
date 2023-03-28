import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SnackBarService } from '../../../../utils/snack-bar.service';
import { BehaviorSubject, of } from 'rxjs';
import { ISatellite, Shape } from 'shared/domain';
import { OrbitService } from '../../orbit-scene.service';
import { SatelliteService } from '../../satellite.service';
import { SatelliteInfoComponent } from './satellite-info.component';

describe('SatelliteInfoComponent', () => {
    let comp: SatelliteInfoComponent;
    let fixture: ComponentFixture<SatelliteInfoComponent>;

    let mockSatelliteService: any;
    let mockOrbitService: any;
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
        mockSatelliteService = {
            getById: jest.fn(() => of(satellite)),
            deleteOrbit: jest.fn(() => of(satellite)),
            currentSatellite$: new BehaviorSubject(satellite),
            canEdit$: new BehaviorSubject(false),
            trackersOfSatellite$: new BehaviorSubject([visitor]),
        };

        mockOrbitService = {
            guideLines: true,
            showOrbit: true,
            realColor: true,
            realSize: true,
            zoom: 1,
            createOrbitScene: jest.fn(),
            toggleGuideLines: jest.fn(),
            toggleOrbit: jest.fn(),
            toggleSize: jest.fn(),
            toggleColor: jest.fn(),
            changeZoom: jest.fn(),
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
                FormsModule,
                MatDividerModule,
                MatDialogModule,
                MatSnackBarModule,
                MatTableModule,
                MatOptionModule,
            ],
            declarations: [SatelliteInfoComponent],
            providers: [
                { provide: SatelliteService, useValue: mockSatelliteService },
                { provide: OrbitService, useValue: mockOrbitService },
                { provide: MatDialog, useValue: mockDialog },
                { provide: SnackBarService, useValue: mockSnackBarService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SatelliteInfoComponent);
        comp = fixture.componentInstance;
        SatelliteInfoComponent.prototype.addOrbitScene = jest.fn();
    });

    it('should create', () => {
        expect(comp).toBeTruthy();
    });

    it('should get the satellite on init', () => {
        comp.ngOnInit();
        expect(comp.satellite).toEqual(satellite);
    });

    it('should not enable editing if the user is not the owner of the satellite', () => {
        comp.ngOnInit();
        expect(comp.canEdit).toEqual(false);
    });

    it('should enable editing if the user is the owner of the satellite', () => {
        mockSatelliteService.canEdit$.next(true);
        comp.ngOnInit();
        expect(comp.canEdit).toEqual(true);
    });

    it('should call addOrbitScene if the satellite has an orbit', () => {
        comp.ngOnInit();
        expect(SatelliteInfoComponent.prototype.addOrbitScene).toHaveBeenCalled();
    });

    it('should not call addOrbitScene if the satellite does not have an orbit', () => {
        mockSatelliteService.currentSatellite$.next({
            ...satellite,
            orbit: undefined,
        });
        comp.ngOnInit();
        expect(SatelliteInfoComponent.prototype.addOrbitScene).not.toHaveBeenCalled();
    });

    it('should delete the orbit', () => {
        comp.ngOnInit();
        comp.removeOrbit();
        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockSatelliteService.deleteOrbit).toHaveBeenCalledWith(satellite.id);
        expect(mockSnackBarService.success).toHaveBeenCalled();
    });

    it('should not delete the orbit if the user cancels the dialog', () => {
        mockDialog.open = jest.fn(() => ({
            afterClosed: jest.fn(() => of('')),
        }));

        comp.ngOnInit();
        comp.removeOrbit();
        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockSatelliteService.deleteOrbit).not.toHaveBeenCalled();
        expect(mockSnackBarService.success).not.toHaveBeenCalled();
    });

    it('should give an error if the orbit could not be deleted', () => {
        mockSatelliteService.deleteOrbit = jest.fn(() => of(undefined));
        comp.ngOnInit();
        comp.removeOrbit();
        expect(mockDialog.open).toHaveBeenCalled();
        expect(mockSatelliteService.deleteOrbit).toHaveBeenCalledWith(satellite.id);
        expect(mockSnackBarService.error).toHaveBeenCalled();
    });
});
