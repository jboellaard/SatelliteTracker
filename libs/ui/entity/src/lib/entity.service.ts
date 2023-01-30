import { IEntity } from './entity.interface';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { APIResponse, Id } from 'shared/domain';

const httpOptions = {
    observe: 'body',
    responseType: 'json',
};

// Generic service for all entities
export class EntityService<T extends IEntity> {
    constructor(protected readonly http: HttpClient, public readonly url: string, public readonly endpoint: string) {}

    protected _refreshRequired = new Subject<void>();

    getRefreshRequired() {
        return this._refreshRequired;
    }

    public getAll(options?: any): Observable<T[] | undefined> {
        return this.http
            .get<APIResponse<T[] | undefined>>(`${this.url}${this.endpoint}`, { ...options, ...httpOptions })
            .pipe(
                map((response: any) => response.result),
                catchError(this.handleError)
            );
    }

    public getById(id: Id | null, options?: any): Observable<T | undefined> {
        return this.http
            .get<APIResponse<T | undefined>>(`${this.url}${this.endpoint}/${id}`, { ...options, ...httpOptions })
            .pipe(
                map((response: any) => response.result),
                catchError(this.handleError)
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
                catchError(this.handleError)
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
                catchError(this.handleError)
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
                catchError(this.handleError)
            );
    }

    public handleError(error: HttpErrorResponse): Observable<any> {
        console.log(error);

        const errorResponse = {
            type: 'error',
            message: error.error.message || error.message,
        };
        return new Observable((observer) => {
            observer.error(errorResponse);
        });
    }
}
