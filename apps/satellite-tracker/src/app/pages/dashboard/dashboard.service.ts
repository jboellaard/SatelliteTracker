import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { catchError, map, Observable } from 'rxjs';
import { APIResponse, ISatellite } from 'shared/domain';
import { SnackBarService } from '../../utils/snack-bar.service';

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    constructor(private http: HttpClient, private snackBar: SnackBarService) {}

    getSatelliteFeed() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}feed/tracked-satellites`).pipe(
            map((response: any) => response.result),
            catchError((err) => this.handleError(err))
        );
    }

    getFollowingFeed() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}feed/following`).pipe(
            map((response: any) => response.result),
            catchError((err) => this.handleError(err))
        );
    }

    getFollowRecommendations() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/to-follow`).pipe(
            map((response: any) => response.result),
            catchError((err) => this.handleError(err))
        );
    }

    getSatelliteRecommendations() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/to-track`).pipe(
            map((response: any) => response.result),
            catchError((err) => this.handleError(err))
        );
    }

    getSimilarCreators() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/similar-creators`).pipe(
            map((response: any) => response.result),
            catchError((err) => this.handleError(err))
        );
    }

    getPopularCreators() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/popular-creators`).pipe(
            map((response: any) => response.result),
            catchError((err) => this.handleError(err))
        );
    }

    getPopularSatellites() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/popular-satellites`).pipe(
            map((response: any) => response.result),
            catchError((err) => this.handleError(err))
        );
    }

    getRecentlyCreatedSatellites() {
        return this.http.get<APIResponse<any[]>>(`${environment.API_URL}recommendations/new-satellites`).pipe(
            map((response: any) => response.result),
            catchError((err) => this.handleError(err))
        );
    }

    private handleError(error: HttpErrorResponse): Observable<any> {
        let res = {
            status: error.status,
            message: 'Something went wrong, please try again later',
        };
        if (error.status === 400) res.message = 'This request is invalid';
        else if (error.status === 403) res.message = `You are not authorized to access this resource`;
        else if (error.status === 404) res.message = `Could not get the requested information`;
        if (error.status != 500 && error.status != 0) this.snackBar.error(res.message);

        return new Observable((observer) => {
            observer.error(res);
        });
    }
}
