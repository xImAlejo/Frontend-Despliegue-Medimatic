import { Injectable } from '@angular/core';
import { Serie } from 'src/app/models/serie';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SerieService {
 
    basePath = 'http://localhost:8000/serie/SerieViewSets/';
  //basePath = 'https://medimatic-services-zzy7.onrender.com/serie/SerieViewSets/';

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

  getAll(): Observable<Serie> {
    return this.http.get<Serie>(this.basePath, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }
  
  getbyId(id:any): Observable<Serie> {
    return this.http.get<Serie>(`${this.basePath}${id}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }


  update(id: any, item: any): Observable<Serie> {
    return this.http.put<Serie>(`${this.basePath}${id}/`, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }

  updateQuantityEnter(id: any, item: any): Observable<Serie> {
      return this.http.put<Serie>(`${this.basePath}${id}/UpdateQuantityEnter/`, JSON.stringify(item), this.httpOptions)
        .pipe(
          retry(2),
          catchError(this.handleError));
  }
  
  updateQuantityExit(id: any, item: any): Observable<Serie> {
      return this.http.put<Serie>(`${this.basePath}${id}/UpdateQuantityExit/`, JSON.stringify(item), this.httpOptions)
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


  create(item: any): Observable<Serie> {
    return this.http.post<Serie>(this.basePath, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }

  getbyProductId(productid:any): Observable<Serie> {
      return this.http.get<Serie>(`${this.basePath}${productid}/getSeriesbyProductId/`, this.httpOptions)
        .pipe(
          retry(2),
          catchError(this.handleError));
  }

}
