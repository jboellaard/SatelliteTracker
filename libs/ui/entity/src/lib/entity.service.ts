import { IEntity } from './entity.interface';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { APIResponse, Id } from 'shared/domain';
import { SnackBarServiceGeneric } from 'ui/utils';

const httpOptions = {
    observe: 'body',
    responseType: 'json',
};

// Generic service for all entities
export class EntityService<T extends IEntity> {
    constructor(
        protected readonly http: HttpClient,
        public readonly url: string,
        public readonly endpoint: string,
        public snackBar: SnackBarServiceGeneric
    ) {}

    protected _refreshRequired = new Subject<void>();

    getRefreshRequired() {
        return this._refreshRequired;
    }

    public getAll(options?: any): Observable<T[] | undefined> {
        return this.http
            .get<APIResponse<T[] | undefined>>(`${this.url}${this.endpoint}`, { ...options, ...httpOptions })
            .pipe(
                map((response: any) => response.result),
                catchError((error) => this.handleError(error))
            );
    }

    public getById(id: Id | null, options?: any): Observable<T | undefined> {
        return this.http
            .get<APIResponse<T | undefined>>(`${this.url}${this.endpoint}/${id}`, { ...options, ...httpOptions })
            .pipe(
                map((response: any) => response.result),
                catchError((error) => this.handleError(error))
            );
    }

    public create(item: T, options?: any): Observable<T | undefined> {
        return this.http
            .post<APIResponse<T | undefined>>(`${this.url}${this.endpoint}`, item, { ...options, ...httpOptions })
            .pipe(
                tap(() => {
                    this._refreshRequired.next();
                }),
                map((response: any) => response.result),
                catchError((error) => this.handleError(error))
            );
    }

    public update(item: T, options?: any): Observable<T | undefined> {
        return this.http
            .patch<APIResponse<T | undefined>>(`${this.url}${this.endpoint}/${item.id}`, item, {
                ...options,
                ...httpOptions,
            })
            .pipe(
                tap(() => {
                    this._refreshRequired.next();
                }),
                map((response: any) => response.result),
                catchError((error) => this.handleError(error))
            );
    }

    public delete(id: Id, options?: any): Observable<T | undefined> {
        return this.http
            .delete<APIResponse<T | undefined>>(`${this.url}${this.endpoint}/${id}`, { ...options, ...httpOptions })
            .pipe(
                tap(() => {
                    this._refreshRequired.next();
                }),
                map((response: any) => response.result),
                catchError((error) => this.handleError(error))
            );
    }

    protected handleError(error: HttpErrorResponse): Observable<any> {
        console.log(error);

        let res = {
            status: error.status,
            message: 'Something went wrong, please try again later',
        };
        if (error.status === 400) {
            if (error.error.message && error.error.message.includes('duplicate')) {
                res.message = 'This entity already exists';
            } else res.message = 'The request was invalid';
        } else if (error.status === 403) res.message = `You are not authorized to edit this entity`;
        else if (error.status === 404) res.message = `Could not find this entity`;
        else if (error.status === 500) res.message = 'Something went wrong, please try again later';
        else if (error.status === 0) res.message = 'The server is not responding, please try again later';
        this.snackBar.error(res.message);

        return new Observable((observer) => {
            observer.error(res);
        });
    }
}
