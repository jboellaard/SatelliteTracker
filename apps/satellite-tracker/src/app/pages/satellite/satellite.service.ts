import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { BehaviorSubject, catchError, map, Observable, tap } from 'rxjs';
import { APIResponse, Id, IOrbit, ISatellite, ISatellitePart, IUser } from 'shared/domain';
import { EntityService } from 'ui/entity';
import { SnackBarService } from '../../utils/snack-bar.service';

@Injectable({
    providedIn: 'root',
})
export class SatelliteService extends EntityService<ISatellite> {
    currentSatellite$ = new BehaviorSubject<ISatellite | undefined>(undefined);
    trackersOfCurrentSatellite$ = new BehaviorSubject<IUser[] | undefined>(undefined);
    canEdit$ = new BehaviorSubject<boolean>(false);

    constructor(http: HttpClient, public override snackBar: SnackBarService) {
        super(http, environment.API_URL, 'satellites', snackBar);
    }

    getSatellitesOfUserWithUsername(username: string): Observable<ISatellite[] | undefined> {
        return this.http
            .get<APIResponse<ISatellite[] | undefined>>(environment.API_URL + `users/${username}/satellites`)
            .pipe(
                map((response: any) => response.result),
                catchError((error) => this.handleError(error))
            );
    }

    getSatelliteParts(): Observable<ISatellitePart[]> {
        return this.http.get<APIResponse<ISatellitePart[]>>(environment.API_URL + 'satellites/parts').pipe(
            map((response: any) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    addOrbit(id: Id, orbit: IOrbit): Observable<ISatellite> {
        return this.http.post<APIResponse<ISatellite>>(`${environment.API_URL}satellites/${id}/orbit`, orbit).pipe(
            tap(() => {
                this._refreshRequired.next();
            }),
            map((response: any) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    updateOrbit(id: Id, orbit: IOrbit): Observable<ISatellite> {
        return this.http.patch<APIResponse<ISatellite>>(`${environment.API_URL}satellites/${id}/orbit`, orbit).pipe(
            tap(() => {
                this._refreshRequired.next();
            }),
            map((response: any) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    deleteOrbit(id: Id): Observable<ISatellite> {
        return this.http.delete<APIResponse<ISatellite>>(`${environment.API_URL}satellites/${id}/orbit`).pipe(
            tap(() => {
                this._refreshRequired.next();
            }),
            map((response: any) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    getTrackers(id: Id): Observable<IUser[]> {
        return this.http.get<APIResponse<IUser[]>>(`${environment.API_URL}satellites/${id}/track`).pipe(
            tap((response) => {
                if (response.result) this.trackersOfCurrentSatellite$.next(response.result);
            }),
            map((response: any) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    protected override handleError(error: HttpErrorResponse): Observable<any> {
        console.log(error);
        let res = {
            status: error.status,
            message: 'An error occurred, please try again later',
        };
        if (error.status === 400) {
            if (error.error.message && error.error.message.includes('duplicate')) {
                res.message = 'You have already created a satellite with this name';
            } else res.message = 'The request was invalid';
        } else if (error.status === 403) res.message = `You are not authorized to edit this satellite`;
        else if (error.status === 404) res.message = `Could not find this satellite`;
        if (error.status != 500 && error.status != 0) this.snackBar.error(res.message);

        return new Observable((observer) => {
            observer.error(res);
        });
    }
}
