import { Injectable } from '@angular/core';
import { Product } from 'src/app/models/product';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
 
  //basePath = 'http://localhost:8000/product/ProductViewSets/';
  basePath = 'https://medimatic-services-zzy7.onrender.com/product/ProductViewSets/';

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

  getAll(): Observable<Product> {
    return this.http.get<Product>(this.basePath, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }
  
  getbyId(id:any): Observable<Product> {
    return this.http.get<Product>(`${this.basePath}${id}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }


  update(id: any, item: any): Observable<Product> {
    return this.http.put<Product>(`${this.basePath}${id}/`, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }

  updateQuantityEnter(id: any, item: any): Observable<Product> {
    return this.http.put<Product>(`${this.basePath}${id}/UpdateQuantityEnter/`, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }

  updateQuantityExit(id: any, item: any): Observable<Product> {
    return this.http.put<Product>(`${this.basePath}${id}/UpdateQuantityExit/`, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }

  UpdateExitandProyectandGuideandExitDate(id: any, item: any): Observable<Product> {
    return this.http.put<Product>(`${this.basePath}${id}/UpdateExitandProyectandGuideandExitDate/`, JSON.stringify(item), this.httpOptions)
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


  create(item: any): Observable<Product> {
    return this.http.post<Product>(this.basePath, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError));
  }

}
