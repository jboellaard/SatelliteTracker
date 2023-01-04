import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { map, Observable, tap } from 'rxjs';
import { APIResponse, Id, ISatellite } from 'shared/domain';
import { EntityService } from 'ui/entity';

@Injectable({
    providedIn: 'root',
})
export class SatelliteService extends EntityService<ISatellite> {
    constructor(http: HttpClient) {
        super(http, environment.API_URL, 'satellites');
        console.log('SatelliteService created');
    }

    getSatellitesOfUserWithUsername(username: string): Observable<ISatellite[] | undefined> {
        console.log('getUserByUsername');
        return this.http
            .get<ISatellite[]>(environment.API_URL + `users/${username}/satellites`)
            .pipe(tap((response: any) => console.log(response)));
    }
}
