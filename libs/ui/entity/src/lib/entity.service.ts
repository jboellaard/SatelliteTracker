import { IEntity } from './entity.interface';
import { Observable, throwError } from 'rxjs';
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

    public getAll(options?: any): Observable<T[]> {
        const endpoint = `${this.url}${this.endpoint}`;
        console.log(`list ${endpoint}`);
        return this.http.get<T[]>(endpoint, { ...options, ...httpOptions }).pipe(
            tap((response: any) => console.log(response)),
            // map((response: any) => response),
            catchError(this.handleError)
        );
    }

    public getById(id: Id | null, options?: any): Observable<T> {
        const endpoint = `${this.url}${this.endpoint}/${id}`;
        console.log(`get one ${endpoint}`);
        return this.http.get<T[]>(endpoint, { ...options, ...httpOptions }).pipe(
            // map((response: any) => response.results),
            catchError(this.handleError)
        );
    }

    public create(item: T, options?: any): Observable<T> {
        return this.http.post<T>(`${this.url}${this.endpoint}`, item, { ...options, ...httpOptions }).pipe(
            // map((response: any) => response.results),
            catchError(this.handleError)
        );
    }

    public update(item: T, options?: any) {
        return this.http.patch<T>(`${this.url}${this.endpoint}/${item.id}`, item, { ...options, ...httpOptions }).pipe(
            tap((response: any) => console.log(response)),
            // map((response: any) => response.results),
            catchError(this.handleError)
        );
    }

    public delete(id: Id, options?: any): Observable<T> {
        console.log('delete');
        console.log(`${this.url}${this.endpoint}/${id}`);
        return this.http.delete<T>(`${this.url}${this.endpoint}/${id}`, { ...options, ...httpOptions }).pipe(
            // map((response: any) => response.result),
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
        // return throwError(errorResponse);
    }
}
