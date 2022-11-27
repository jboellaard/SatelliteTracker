import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { map, Observable, tap } from 'rxjs';
import { APIResponse, Satellite, User } from 'shared/domain';
import { EntityService } from 'ui/entity';

@Injectable({
  providedIn: 'root',
})
export class SatelliteService extends EntityService<Satellite> {
  constructor(http: HttpClient) {
    super(http, environment.API_URL, 'satellites');
  }

  getSatellitesOfUserWithId(id: string): Observable<Satellite[] | undefined> {
    console.log('getUserById');
    return this.http.get<APIResponse<Satellite[]>>(environment.API_URL + `users/${id}/satellites`).pipe(
      map((response: APIResponse<Satellite[]>) => response.results),
      tap((satellites: Satellite[]) => {
        return satellites;
      })
    );
  }
}
