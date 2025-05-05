import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import {catchError, retry} from "rxjs/operators"
import { Login } from 'src/app/models/login';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  basePath = 'http://localhost:8000/';
  //basePath = 'https://medimatic-services-zzy7.onrender.com/';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  }
  constructor(private http: HttpClient) { }
  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.log(`An error occurred: ${error.error.message} `);
    }
    else {
      console.error(
        `Backend returned code ${error.status}, body was: ${error.error.error}`
      );
    }

    return throwError('Something happened with request, please try again later');
  }
  Login(item:Login){
    return this.http.post<any>(`${this.basePath}login/`, item, this.httpOptions)
    .pipe(
      retry(2),
      catchError(this.handleError)
    ).pipe(
      // Aquí guardamos el token si login fue exitoso
      tap(response => {
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('refresh_token', response['refresh-token']);
      })
    );

  }

}