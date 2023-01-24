import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { Observable, tap } from 'rxjs';
import { ISatellite, UserIdentity } from 'shared/domain';
import { AuthService } from '../../auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    constructor(private http: HttpClient) {}

    getMySatellites(username: string): Observable<ISatellite[] | undefined> {
        console.log('getSatellitesByUsername');
        return this.http
            .get<ISatellite[]>(environment.API_URL + `users/${username}/satellites`)
            .pipe(tap((response: any) => console.log(response)));
    }
}
