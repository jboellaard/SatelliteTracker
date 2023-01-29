import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { map, Observable } from 'rxjs';
import { APIResponse, Id, IOrbit, ISatellite, ISatellitePart } from 'shared/domain';
import { EntityService } from 'ui/entity';

@Injectable({
    providedIn: 'root',
})
export class SatelliteService extends EntityService<ISatellite> {
    constructor(http: HttpClient) {
        super(http, environment.API_URL, 'satellites');
    }

    getSatellitesOfUserWithUsername(username: string): Observable<ISatellite[] | undefined> {
        return this.http
            .get<APIResponse<ISatellite[] | undefined>>(environment.API_URL + `users/${username}/satellites`)
            .pipe(map((response: any) => response.result));
    }

    getSatelliteParts(): Observable<ISatellitePart[]> {
        return this.http.get<APIResponse<ISatellitePart[]>>(environment.API_URL + 'satellites/parts').pipe(
            map((response: any) => {
                response.result.forEach((part: ISatellitePart) => {
                    part.id = part._id;
                });
                return response.result;
            })
        );
    }

    addOrbit(id: Id, orbit: IOrbit): Observable<ISatellite> {
        return this.http.post<APIResponse<ISatellite>>(`${environment.API_URL}satellites/${id}/orbit`, orbit).pipe(
            map((response: any) => {
                response.result.id = response.result._id;
                return response.result;
            })
        );
    }

    updateOrbit(id: Id, orbit: IOrbit): Observable<ISatellite> {
        return this.http.patch<APIResponse<ISatellite>>(`${environment.API_URL}satellites/${id}/orbit`, orbit).pipe(
            map((response: any) => {
                response.result.id = response.result._id;
                return response.result;
            })
        );
    }

    deleteOrbit(id: Id): Observable<ISatellite> {
        return this.http.delete<APIResponse<ISatellite>>(`${environment.API_URL}satellites/${id}/orbit`).pipe(
            map((response: any) => {
                response.result.id = response.result._id;
                return response.result;
            })
        );
    }
}
