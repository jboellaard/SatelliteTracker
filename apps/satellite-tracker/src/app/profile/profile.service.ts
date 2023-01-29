import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, Subject, tap } from 'rxjs';
import { ISatellite, APIResponse } from 'shared/domain';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    constructor(private http: HttpClient) {}

    getMySatellites(username: string): Observable<ISatellite[] | undefined> {
        return this.http
            .get<APIResponse<ISatellite[] | undefined>>(environment.API_URL + `users/${username}/satellites`)
            .pipe(map((response) => response.result));
    }
}
