import { CdkDropList } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { ISatellite, ISatellitePart, Shape } from 'shared/domain';
import { RelationsService } from '../../../auth/relations.service';
import { SnackBarService } from '../../../utils/snack-bar.service';
import { SatelliteService } from '../satellite.service';
import { SatelliteEditComponent } from './satellite-edit.component';

describe('SatelliteEditComponent', () => {
    let comp: SatelliteEditComponent;
    let fixture: ComponentFixture<SatelliteEditComponent>;

    let mockActivatedRoute: any;
    let mockRouter: any;
    let mockSatelliteService: any;
    let mockRelationsService: any;
    let mockDialog: any;
    let mockSnackBarService: any;
    let mockTable: any;

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

    const existingSatellite: ISatellite = {
        id: '1',
        satelliteName: 'Satellite 1',
        description: 'Satellite 1 description',
        mass: 100,
        sizeOfBase: 100,
        colorOfBase: '#000000',
        shapeOfBase: Shape.Cube,
        purpose: 'Satellite 1 purpose',
    };

    beforeEach(async () => {
        mockActivatedRoute = {
            paramMap: of(convertToParamMap({ satelliteId: '1', username: 'test_user' })),
        };

        mockRouter = {
            navigate: jest.fn(),
        };

        mockSatelliteService = {
            getSatelliteParts: jest.fn(() => of([])),
            getSatellitesOfUserWithUsername: jest.fn(() => of([])),
            addOrbit: jest.fn(() => of({})),
            updateOrbit: jest.fn(() => of({})),
            deleteOrbit: jest.fn(() => of({})),
            create: jest.fn(() => of({})),
            update: jest.fn(() => of({})),
            delete: jest.fn(() => of({})),
            getAll: jest.fn(() => of([])),
            getById: jest.fn(() => of({})),
        };

        mockRelationsService = {
            getFollowing: jest.fn(() => of([])),
            getTracking: jest.fn(() => of([])),
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

        mockTable = {
            renderRows: jest.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                FormsModule,
                MatDividerModule,
                MatInputModule,
                MatFormFieldModule,
                MatDialogModule,
                MatSnackBarModule,
                MatTooltipModule,
                MatIconModule,
                MatTableModule,
                MatOptionModule,
                MatSelectModule,
                CdkDropList,
            ],
            declarations: [SatelliteEditComponent],
            providers: [
                { provide: SatelliteService, useValue: mockSatelliteService },
                { provide: RelationsService, useValue: mockRelationsService },
                { provide: MatDialog, useValue: mockDialog },
                { provide: SnackBarService, useValue: mockSnackBarService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Router, useValue: mockRouter },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SatelliteEditComponent);
        comp = fixture.componentInstance;
    });

    afterEach(() => {
        if (fixture) {
            fixture.destroy();
        }
        jest.resetAllMocks();
    });

    it('should create', () => {
        expect(comp).toBeTruthy();
    });

    it('should get all satellite parts on init', () => {
        const parts = [
            {
                id: '1',
                partName: 'Part 1',
                description: 'Part 1 description',
            },
            {
                id: '2',
                partName: 'Part 2',
                description: 'Part 2 description',
            },
        ] as ISatellitePart[];
        mockSatelliteService.getSatelliteParts.mockReturnValue(of(parts));
        comp.ngOnInit();
        expect(mockSatelliteService.getSatelliteParts).toHaveBeenCalled();
        expect(comp.allSatelliteParts).toEqual(parts);
    });

    it('should get a satellite if satelliteId is set', () => {
        mockSatelliteService.getById.mockReturnValue(of(existingSatellite));
        comp.ngOnInit();
        expect(mockSatelliteService.getById).toHaveBeenCalled();
        expect(comp.satellite).toEqual({ ...existingSatellite, satelliteParts: [] });
        expect(comp.componentExists).toBe(true);
        expect(comp.satellite.satelliteParts).toEqual([]);
        expect(comp.purposes).toContain(existingSatellite.purpose);
    });

    it('should create a satellite if satelliteId is not set', () => {
        mockActivatedRoute.paramMap = of(convertToParamMap({ username: 'test_user' }));
        const satellite = comp.satellite;
        comp.ngOnInit();
        expect(mockSatelliteService.getById).not.toHaveBeenCalled();
        expect(comp.satellite).toEqual(satellite);
        expect(comp.componentExists).toBe(false);
    });

    it('should add a purpose to the list of purposes', () => {
        const purpose = 'Purpose 1';
        mockDialog.open.mockReturnValue({ afterClosed: jest.fn(() => of(purpose)) });
        comp.openPurposeDialog();
        expect(comp.purposes).toContain(purpose);
    });

    it('should not add a purpose to the list of purposes if the dialog is closed', () => {
        mockDialog.open.mockReturnValue({ afterClosed: jest.fn(() => of(null)) });
        comp.openPurposeDialog();
        expect(comp.purposes).not.toContain(null);
    });

    it('should remove a satellitepart from the satellite', () => {
        comp.table = mockTable;
        comp.satellite.satelliteParts = Object.assign([], customSatelliteParts);
        comp.removePart(customSatelliteParts[0]);
        expect(comp.table!.renderRows).toHaveBeenCalled();
        expect(comp.satellite.satelliteParts).toEqual([customSatelliteParts[1]]);
    });

    it('should add a satellitepart to the satellite', () => {
        mockDialog.open.mockReturnValue({ afterClosed: jest.fn(() => of(customSatelliteParts[1])) });
        comp.satellite.satelliteParts = Object.assign([], [customSatelliteParts[0]]);
        comp.openAddPartDialog();
        expect(comp.satellite.satelliteParts).toEqual(customSatelliteParts);
        expect(comp.satellitePartError).toBe(undefined);
    });

    it('should check dependencies of a satellitepart and give an error if there are unsatisfied dependencies', () => {
        comp.satellite.satelliteParts = Object.assign(
            [],
            [
                customSatelliteParts[1],
                {
                    satellitePart: {
                        id: '3',
                        partName: 'Part 3',
                        dependsOn: [{ partName: customSatelliteParts[0].satellitePart.partName }],
                    },
                    color: '#000000',
                    quantity: 1,
                    size: 1,
                },
            ]
        );
        const ok = comp.checkDependencies(comp.satellite.satelliteParts);
        const error =
            'The part ' +
            comp.satellite.satelliteParts[1].satellitePart.partName +
            ' cannot function if the satellite does not have any of the following parts: ' +
            customSatelliteParts[0].satellitePart.partName +
            ', please add at least one.';
        expect(comp.satellitePartError).toBe(error);
        expect(ok).toBe(false);
    });

    it('should check dependencies of a satellitepart and give no error if all dependencies are satisfied', () => {
        comp.satellite.satelliteParts = Object.assign(
            [],
            [
                customSatelliteParts[0],
                {
                    satellitePart: {
                        id: '3',
                        partName: 'Part 3',
                        dependsOn: [{ partName: customSatelliteParts[0].satellitePart.partName }],
                    },
                    color: '#000000',
                    quantity: 1,
                    size: 1,
                },
            ]
        );
        const ok = comp.checkDependencies(comp.satellite.satelliteParts);
        expect(comp.satellitePartError).toBe(undefined);
        expect(ok).toBe(true);
    });

    it('should update a satellite if the component exists', () => {
        mockSatelliteService.update.mockReturnValue(of(existingSatellite));
        comp.componentExists = true;
        comp.satellite = existingSatellite;
        comp.onSubmit();
        expect(mockSatelliteService.update).toHaveBeenCalled();
        expect(mockSnackBarService.success).toHaveBeenCalled();
    });

    it('should create a satellite if the component does not exist', () => {
        mockSatelliteService.create.mockReturnValue(of(existingSatellite));
        comp.componentExists = false;
        comp.satellite = { ...existingSatellite, id: undefined };
        comp.onSubmit();
        expect(mockSatelliteService.create).toHaveBeenCalled();
        expect(mockSnackBarService.success).toHaveBeenCalled();
    });

    it('should not create/update a satellite if the component exists but the satellitepart dependencies are not satisfied', () => {
        jest.spyOn(comp, 'checkDependencies');
        comp.satellite.satelliteParts = Object.assign(
            [],
            [
                customSatelliteParts[1],
                {
                    satellitePart: {
                        id: '3',
                        partName: 'Part 3',
                        dependsOn: [{ partName: customSatelliteParts[0].satellitePart.partName }],
                    },
                    color: '#000000',
                    quantity: 1,
                    size: 1,
                },
            ]
        );
        comp.satellitePartError =
            'The part ' +
            comp.satellite.satelliteParts[1].satellitePart.partName +
            ' cannot function if the satellite does not have any of the following parts: ' +
            customSatelliteParts[0].satellitePart.partName +
            ', please add at least one.';
        comp.onSubmit();
        expect(comp.checkDependencies).toHaveBeenCalled();
        expect(mockDialog.open).not.toHaveBeenCalled();
        expect(mockSatelliteService.create).not.toHaveBeenCalled();
        expect(mockSatelliteService.update).not.toHaveBeenCalled();
    });

    // check that tracking$ is called after create and update
});
