import { Injectable } from '@angular/core';
import { map, tap, Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APIResponse } from '../../core/api-response/api-reponse.model';
import { RandomUser } from './randomuser.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RandomUserService {
  BASE_URL = environment.API_URL;
  constructor(private http: HttpClient) {}

  getRandomUsers(): Observable<RandomUser[]> {
    return this.http.get<APIResponse<RandomUser[]>>(`${this.BASE_URL}` + '/?results=10').pipe(
      map((response: APIResponse<RandomUser[]>) => response.results),
      tap((randomusers: RandomUser[]) => {
        //
        return randomusers;
      })
    );
  }
}
