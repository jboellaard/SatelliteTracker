import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { map } from 'rxjs';
import { APIResponse, ISatellite } from 'shared/domain';

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    constructor(private http: HttpClient) {}

    getSatelliteFeed() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}feed/tracked-satellites`).pipe(
            map((response: any) => {
                response.result.forEach((satellite: any) => {
                    satellite.id = satellite._id;
                });
                return response.result;
            })
        );
    }
}
