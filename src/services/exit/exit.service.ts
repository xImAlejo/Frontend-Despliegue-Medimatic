import { Injectable } from '@angular/core';
import { Exit } from 'src/app/models/exit';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExitService {

  //basePath = 'http://localhost:8000/exit/ExitViewSets/';
  basePath = 'https://medimatic-services-zzy7.onrender.com/exit/ExitViewSets/';

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

  getAll(): Observable<Exit> {
    return this.http.get<Exit>(this.basePath, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }
  
  getbyId(id:any): Observable<Exit> {
    return this.http.get<Exit>(`${this.basePath}${id}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }


  update(id: any, item: any): Observable<Exit> {
    return this.http.put<Exit>(`${this.basePath}${id}/`, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }

  updateQuantityBySerieId(serieid: any, item: any): Observable<Exit> {
      return this.http.put<Exit>(`${this.basePath}${serieid}/UpdateQuantityBySerieId/`, JSON.stringify(item), this.httpOptions)
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


  create(item: any): Observable<Exit> {
    return this.http.post<Exit>(this.basePath, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }

  getbySerieId(productid:any): Observable<Exit> {
      return this.http.get<Exit>(`${this.basePath}${productid}/getExitsbySerieId/`, this.httpOptions)
        .pipe(
          retry(2),
          catchError(this.handleError));
  }
}
