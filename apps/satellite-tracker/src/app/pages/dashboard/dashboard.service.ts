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
                return response.result;
            })
        );
    }

    getFollowingFeed() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}feed/following`).pipe(
            map((response: any) => {
                return response.result;
            })
        );
    }

    getFollowRecommendations() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/to-follow`).pipe(
            map((response: any) => {
                return response.result;
            })
        );
    }

    getSatelliteRecommendations() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/to-track`).pipe(
            map((response: any) => {
                return response.result;
            })
        );
    }

    getSimilarCreators() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/similar-creators`).pipe(
            map((response: any) => {
                return response.result;
            })
        );
    }

    getPopularCreators() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/popular-creators`).pipe(
            map((response: any) => {
                return response.result;
            })
        );
    }

    getPopularSatellites() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/popular-satellites`).pipe(
            map((response: any) => {
                return response.result;
            })
        );
    }

    getRecentlyCreatedSatellites() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/new-satellites`).pipe(
            map((response: any) => {
                return response.result;
            })
        );
    }
}
