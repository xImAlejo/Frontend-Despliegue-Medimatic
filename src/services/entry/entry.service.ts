import { Injectable } from '@angular/core';
import { Entry } from 'src/app/models/entry';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntryService {
 
    basePath = 'http://localhost:8000/entry/EntryViewSets/';
  //basePath = 'https://medimatic-services-zzy7.onrender.com/entry/EntryViewSets/';

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

  getAll(): Observable<Entry> {
    return this.http.get<Entry>(this.basePath, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }
  
  getbyId(id:any): Observable<Entry> {
    return this.http.get<Entry>(`${this.basePath}${id}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }


  update(id: any, item: any): Observable<Entry> {
    return this.http.put<Entry>(`${this.basePath}${id}/`, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }

  updateQuantityBySerieId(serieid: any, item: any): Observable<Entry> {
      return this.http.put<Entry>(`${this.basePath}${serieid}/UpdateQuantitybySerieId/`, JSON.stringify(item), this.httpOptions)
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


  create(item: any): Observable<Entry> {
    return this.http.post<Entry>(this.basePath, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }

  getbySerieId(productid:any): Observable<Entry> {
      return this.http.get<Entry>(`${this.basePath}${productid}/getEntriesbySerieId/`, this.httpOptions)
        .pipe(
          retry(2),
          catchError(this.handleError));
  }

}
