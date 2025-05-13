import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { Proyect } from 'src/app/models/proyect';

@Injectable({
  providedIn: 'root'
})
export class ProyectService {

  //basePath = 'http://localhost:8000/proyect/ProyectViewSets/';
  basePath = 'https://medimatic-services-zzy7.onrender.com/proyect/ProyectViewSets/';
  
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
  
    getAll(): Observable<Proyect> {
      return this.http.get<Proyect>(this.basePath, this.httpOptions)
        .pipe(
          retry(2),
          catchError(this.handleError));
    }
    
    getbyId(id:any): Observable<Proyect> {
      return this.http.get<Proyect>(`${this.basePath}${id}`, this.httpOptions)
        .pipe(
          retry(2),
          catchError(this.handleError));
    }
  
  
    update(id: any, item: any): Observable<Proyect> {
      return this.http.put<Proyect>(`${this.basePath}${id}/`, JSON.stringify(item), this.httpOptions)
        .pipe(
          retry(2),
          catchError(this.handleError));
    }
    
    delete(id: any){
      return this.http.delete(`${this.basePath}${id}/`, this.httpOptions)
        .pipe(
          retry(2),
          catchError(this.handleError));
    }
  
  
    create(item: any): Observable<Proyect> {
      return this.http.post<Proyect>(this.basePath, JSON.stringify(item), this.httpOptions)
        .pipe(
          retry(2),
          catchError(this.handleError));
    }
  
}
