import { IEntity } from './entity.interface';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { APIResponse } from 'shared/domain';
import { validateHeaderValue } from 'http';

/**
 * See https://angular.io/guide/http#requesting-data-from-a-server
 */
const httpOptions = {
  observe: 'body',
  responseType: 'json',
};

/**
 * Generic service class for communicating objects to/from services.
 * Serves generic CRUD operations.
 */
export class EntityService<T extends IEntity> {
  /**
   * Service constructor.
   */
  constructor(protected readonly http: HttpClient, public readonly url: string, public readonly endpoint: string) {}

  /**
   * Get all items.
   *
   * @options options
   */
  public list(options?: any): Observable<T[] | null> {
    const endpoint = `${this.url}${this.endpoint}`;
    console.log(`list ${endpoint}`);
    return this.http.get<APIResponse<T[]>>(endpoint, { ...options, ...httpOptions }).pipe(
      map((response: any) => response.results),
      catchError(this.handleError)
    );
  }

  /**
   * Create the item at the service.
   *
   * @param item Item to be created.
   */
  // public create(item: T, options?: any): Observable<T> {
  //   const endpoint = `${this.url}${this.endpoint}`;
  //   console.log(`create ${endpoint}`);
  //   return this.http.post<T>(endpoint, item, { ...options, ...httpOptions }).pipe(
  //     // tap(console.log),
  //     // map((response: any) => response.result),
  //     catchError(this.handleError)
  //   );
  // }

  public create(item: T, options?: any): Observable<T> {
    return this.http.post<APIResponse<T>>(`${this.url}${this.endpoint}`, item, { ...options, ...httpOptions }).pipe(
      map((response: any) => response.results),
      tap((value) => {
        return value;
      })
    );
  }

  /**
   * Get a single item from the service.
   *
   * @param id ID of the item to get.
   */
  public read(id: string | null, options?: any): Observable<T> {
    const endpoint = `${this.url}${this.endpoint}/${id}`;
    console.log(`read ${endpoint}`);
    return this.http.get<APIResponse<T[]>>(endpoint, { ...options, ...httpOptions }).pipe(
      map((response: any) => response.results),
      tap((value) => {
        return value;
      }),
      catchError(this.handleError)
    );
  }

  // readOne(id: string | null): Observable<T> {
  //   console.log('readOne');
  //   console.log(`${this.url}${this.endpoint}/${id}`);
  //   return this.http.get<T>(`${this.url}${this.endpoint}/${id}`);
  // }

  /**
   * Update (put) new info.
   *
   * @param item The new item.
   */
  // public update(item: T, options?: any): Observable<T> {
  //   const endpoint = `${this.url}${this.endpoint}/${item.id}`;
  //   console.log(`update ${endpoint}`);
  //   return this.http.put(endpoint, item, { ...options, ...httpOptions }).pipe(
  //     map((response: any) => response.result),
  //     catchError(this.handleError)
  //   );
  // }

  public update(item: T, options?: any) {
    return this.http
      .patch<APIResponse<T>>(`${this.url}${this.endpoint}/${item.id}`, item, { ...options, ...httpOptions })
      .pipe(
        map((response: any) => response.results),
        tap((value) => {
          return value;
        })
      );
  }

  /**
   * Delete an item at the service.
   *
   * @param id ID of item to be deleted.
   */
  //  public delete(id: string, options?: any): Observable<T> {
  //   const endpoint = `${this.url}${this.endpoint}/${id}`
  //   console.log(`delete ${endpoint}`)
  //   return this.http.delete(endpoint, { ...options, ...httpOptions }).pipe(
  //     // map((response: any) => response.result),
  //     catchError(this.handleError)
  //   )
  // }

  public delete(id: number, options?: any): Observable<T> {
    // const endpoint = `${this.url}${this.endpoint}/${id}`;
    // console.log(`delete ${endpoint}`);
    console.log('delete');
    console.log(`${this.url}${this.endpoint}/${id}`);
    return this.http.delete(`${this.url}${this.endpoint}/${id}`, { ...options, ...httpOptions }).pipe(
      map((response: any) => response.result),
      catchError(this.handleError)
    );
  }

  // public delete(id: string, options?: any): Observable<T> {
  //   return this.http
  //     .delete<APIResponse<T>>(`${this.url}${this.endpoint}/${id}`, { ...options, ...httpOptions })
  //     .pipe(
  //       map((response: any) => response.results),
  //       tap((value) => {
  //         return value;
  //       })
  //     );
  // }

  /**
   * Handle errors.
   */
  public handleError(error: HttpErrorResponse): Observable<any> {
    console.log(error);

    const errorResponse = {
      type: 'error',
      message: error.error.message || error.message,
    };
    // return an error observable with a user-facing error message
    return throwError(errorResponse);
  }
}
