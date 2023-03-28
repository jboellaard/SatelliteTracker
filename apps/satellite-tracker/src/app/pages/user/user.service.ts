import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AdminUserInfo, APIResponse, IUser } from 'shared/domain';
import { catchError, map, Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EntityService } from 'ui/entity';
import { SnackBarService } from '../../utils/snack-bar.service';

@Injectable({
    providedIn: 'root',
})
export class UserService extends EntityService<IUser> {
    constructor(http: HttpClient, public override snackBar: SnackBarService) {
        super(http, environment.API_URL, 'users', snackBar);
    }

    getByUsername(username: string | null, options?: any): Observable<IUser | undefined> {
        return this.http.get<APIResponse<IUser | undefined>>(`${this.url}${this.endpoint}/${username}`).pipe(
            map((response: any) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    getAllIdentities(): Observable<AdminUserInfo[]> {
        return this.http.get<APIResponse<AdminUserInfo[]>>(`${environment.API_URL}identities`).pipe(
            map((response: any) => response.result),
            catchError((error) => this.handleError(error))
        );
    }

    protected override handleError(error: HttpErrorResponse): Observable<any> {
        let res = {
            status: error.status,
            message: 'An error occurred, please try again later',
        };
        if (error.status === 400) {
            if (error.error.message && error.error.message.includes('duplicate')) {
                res.message = 'A user with this username already exists';
            } else res.message = 'The request was invalid';
        } else if (error.status === 403) res.message = `You are not authorized to perform this action`;
        else if (error.status === 404) res.message = `Could not get the requested data`;
        if (error.status != 500 && error.status != 0) this.snackBar.error(res.message);

        return new Observable((observer) => {
            observer.error(res);
        });
    }
}
