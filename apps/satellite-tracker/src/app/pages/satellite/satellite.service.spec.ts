import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { ICustomSatellitePart, IOrbit, ISatellite, ISatellitePart, APIResponse } from 'shared/domain';
import { SatelliteService } from './satellite.service';

describe('SatelliteService', () => {
    let satelliteService: SatelliteService;
    let httpMock: HttpTestingController;

    const satelliteParts: ISatellitePart[] = [
        {
            id: '1',
            partName: 'Part 1',
            description: 'Part 1 description',
            function: 'Part 1 function',
            material: 'Part 1 material',
        },
        {
            id: '2',
            partName: 'Part 2',
            description: 'Part 2 description',
            function: 'Part 2 function',
            material: 'Part 2 material',
        },
        {
            id: '3',
            partName: 'Part 3',
            description: 'Part 3 description',
            function: 'Part 3 function',
            material: 'Part 3 material',
        },
    ];

    const satellitesOfUser = [
        {
            id: '1',
            satelliteName: 'Satellite 1',
            description: 'Satellite 1 description',
            mass: 100,
            sizeOfBase: 100,
            colorOfBase: '#000000',
            createdBy: 'username',
            orbit: {
                semiMajorAxis: 100000,
                inclination: 0,
                longitudeOfAscendingNode: 0,
                argumentOfPerigee: 0,
                eccentricity: 0,
                dateTimeOfLaunch: new Date(),
                createdAt: new Date(),
            } as IOrbit,
            satelliteParts: [
                {
                    satellitePart: satelliteParts[0],
                    quantity: 1,
                    size: 1,
                    color: '#000000',
                },
                {
                    satellitePart: satelliteParts[1],
                    quantity: 1,
                    size: 1,
                    color: '#000000',
                },
            ] as ICustomSatellitePart[],
        },
        {
            id: '2',
            satelliteName: 'Satellite 2',
            description: 'Satellite 2 description',
            mass: 100,
            sizeOfBase: 100,
            colorOfBase: '#000000',
            createdBy: 'username',
        },
    ] as ISatellite[];

    const newSatellite: ISatellite = {
        satelliteName: 'Satellite 3',
        description: 'Satellite 3 description',
        mass: 100,
        sizeOfBase: 100,
        colorOfBase: '#000000',
        createdBy: 'username',
    };

    const satellites: ISatellite[] = [
        ...satellitesOfUser,
        { ...newSatellite, id: '3' },
        {
            id: '4',
            satelliteName: 'Satellite 4',
            description: 'Satellite 4 description',
            mass: 100,
            sizeOfBase: 100,
            colorOfBase: '#000000',
            createdBy: 'adifferentuser',
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatSnackBarModule],
            providers: [SatelliteService],
        });

        satelliteService = TestBed.inject(SatelliteService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(satelliteService).toBeTruthy();
    });

    it('should send a GET request at users/:username/satellites when calling getSatelllitesOfUserWithUsername', () => {
        const username = 'username';
        satelliteService.getSatellitesOfUserWithUsername(username).subscribe({
            next: (satellites) => {
                expect(satellites).toEqual(satellitesOfUser);
            },
        });
        const req = httpMock.expectOne(`${environment.API_URL}users/${username}/satellites`);
        req.flush({ result: satellitesOfUser } as APIResponse<ISatellite[]>);
        expect(req.request.method).toBe('GET');
    });

    it('should send a GET request at satellites/parts when calling getSatelliteParts', () => {
        satelliteService.getSatelliteParts().subscribe((parts) => {
            expect(parts).toEqual(satelliteParts);
        });
        const req = httpMock.expectOne(`${environment.API_URL}satellites/parts`);
        req.flush({ result: satelliteParts } as APIResponse<ISatellitePart[]>);
        expect(req.request.method).toBe('GET');
    });

    it('should send a POST request at satellites when calling create', () => {
        satelliteService.create(newSatellite).subscribe((satellite) => {
            expect(satellite).toEqual({ ...newSatellite, id: '3' });
        });
        const req = httpMock.expectOne(`${environment.API_URL}satellites`);
        req.flush({ result: { ...newSatellite, id: '3' } } as APIResponse<ISatellite>);
        expect(req.request.method).toBe('POST');
    });

    it('should send a PATCH request at satellites/:satelliteId when calling update', () => {
        satelliteService.update({ ...newSatellite, id: '3' }).subscribe((satellite) => {
            expect(satellite).toEqual({ ...newSatellite, id: '3', satelliteName: 'Satellite 3 updated' });
        });
        const req = httpMock.expectOne(`${environment.API_URL}satellites/3`);
        req.flush({
            result: { ...newSatellite, id: '3', satelliteName: 'Satellite 3 updated' },
        } as APIResponse<ISatellite>);
        expect(req.request.method).toBe('PATCH');
    });

    it('should send a DELETE request at satellites/:satellitesId when calling delete', () => {
        satelliteService.delete('3').subscribe((satellite) => {
            expect(satellite).toEqual({ ...newSatellite, id: '3' });
        });
        const req = httpMock.expectOne(`${environment.API_URL}satellites/3`);
        req.flush({ result: { ...newSatellite, id: '3' } } as APIResponse<ISatellite>);
        expect(req.request.method).toBe('DELETE');
    });

    it('should send a GET request at satellites/:satelliteId when calling getById', () => {
        satelliteService.getById(satellites[0].id).subscribe((satellite) => {
            expect(satellite).toEqual(satellites[0]);
        });
        const req = httpMock.expectOne(`${environment.API_URL}satellites/${satellites[0].id}`);
        req.flush({ result: satellites[0] } as APIResponse<ISatellite>);
        expect(req.request.method).toBe('GET');
    });

    it('should send a GET request at satellites when calling getAll', () => {
        satelliteService.getAll().subscribe((satellites) => {
            expect(satellites).toEqual(satellites);
        });
        const req = httpMock.expectOne(`${environment.API_URL}satellites`);
        req.flush({ result: satellites } as APIResponse<ISatellite[]>);
        expect(req.request.method).toBe('GET');
    });

    it('should handle errors', () => {
        const error = new ErrorEvent('error', {
            message: 'error',
        });
        const spy = jest.spyOn(console, 'log');
        satelliteService.getAll().subscribe({
            error: (err) => {
                expect(err).toEqual(error);
            },
        });
        const req = httpMock.expectOne(`${environment.API_URL}satellites`);
        req.flush(error, { status: 500, statusText: 'error' });
        expect(spy).toHaveBeenCalled();

        spy.mockRestore();

        satelliteService.getById('1').subscribe({
            error: (err) => {
                expect(err).toEqual(error);
            },
        });
        const req2 = httpMock.expectOne(`${environment.API_URL}satellites/1`);
        req2.flush(error, { status: 500, statusText: 'error' });

        satelliteService.create(newSatellite).subscribe({
            error: (err) => {
                expect(err).toEqual(error);
            },
        });
        const req3 = httpMock.expectOne(`${environment.API_URL}satellites`);
        req3.flush(error, { status: 500, statusText: 'error' });

        satelliteService.update({ ...newSatellite, id: '3' }).subscribe({
            error: (err) => {
                expect(err).toEqual(error);
            },
        });
        const req4 = httpMock.expectOne(`${environment.API_URL}satellites/3`);
        req4.flush(error, { status: 500, statusText: 'error' });

        satelliteService.delete('3').subscribe({
            error: (err) => {
                expect(err).toEqual(error);
            },
        });
        const req5 = httpMock.expectOne(`${environment.API_URL}satellites/3`);
        req5.flush(error, { status: 500, statusText: 'error' });

        satelliteService.getSatellitesOfUserWithUsername('username').subscribe({
            error: (err) => {
                expect(err).toEqual(error);
            },
        });
        const req6 = httpMock.expectOne(`${environment.API_URL}users/username/satellites`);
        req6.flush(error, { status: 500, statusText: 'error' });

        satelliteService.getSatelliteParts().subscribe({
            error: (err) => {
                expect(err).toEqual(error);
            },
        });
        const req7 = httpMock.expectOne(`${environment.API_URL}satellites/parts`);
        req7.flush(error, { status: 500, statusText: 'error' });
    });
});
