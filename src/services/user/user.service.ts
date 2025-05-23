import { Injectable } from '@angular/core';
import { User } from 'src/app/models/user';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  //basePath = 'http://localhost:8000/user/UserViewSets/';
  basePath = 'https://medimatic-services-zzy7.onrender.com/user/UserViewSets/';

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
        `Backend returned code ${error.status}, body was: ${error.error}`
      );
    }
  
    return throwError('Something happened with request, please try again later');
  }

  getAll(): Observable<User> {
    return this.http.get<User>(this.basePath, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }
  
  getbyId(id:any): Observable<User> {
    return this.http.get<User>(`${this.basePath}${id}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }


  update(id: any, item: any): Observable<User> {
    return this.http.put<User>(`${this.basePath}${id}`, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }
  
  delete(id: any){
    return this.http.delete(`${this.basePath}${id}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }


  create(item: any): Observable<User> {
    return this.http.post<User>(this.basePath, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }

}
