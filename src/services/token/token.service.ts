import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const Token_key='AuthToken';
@Injectable({
  providedIn: 'root'
})
export class TokenService {
  token !: string
  roles:Array<string>=[]

  constructor(private Router:Router) { }
  
  public setToken(token:string) {
    window.localStorage.removeItem(Token_key);
    window.localStorage.setItem(Token_key,token)
  }

  public getToken() {
    return window.localStorage.getItem(Token_key)
    }
    
  public isLogged(){
    if(this.getToken())
    {
      return true
    }
   
    return false
  }

  public logOut(): void {
    window.localStorage.clear();
    this.Router.navigate(['/login']);
  }

  public getUserName()  {
    if (!this.isLogged()) {
      return null;
    }
    const token = this.getToken()!;
    const payload = token.split('.')[1];
    const payloadDecoded = atob(payload);
    const values = JSON.parse(payloadDecoded);
    const username = values.user;
    
    return username;
  }

  public getId()  {
    if (!this.isLogged()) {
      return null;
    }

    const token = this.getToken()!;
    const payload = token.split('.')[1];
    const payloadDecoded = atob(payload);
    const values = JSON.parse(payloadDecoded);
    const id = values.user_id;
    return id;
  }

  public isCoordination(){

    if (!this.isLogged()) {
     
      return false;
    }

    const token = this.getToken()!;
    const payload = token.split('.')[1];
    const payloadDecoded = atob(payload);
    const values = JSON.parse(payloadDecoded);
    const roles = values.rol;

    if (roles!= 1) {
      return false;
    }

    return true;
  }

  public isAdmin(){
  
    if (!this.isLogged()) {
     
      return false;
    }

    const token = this.getToken()!;
    const payload = token.split('.')[1];
    const payloadDecoded = atob(payload);
    const values = JSON.parse(payloadDecoded);
    const roles = values.rol;

    if (roles!= 2) {
      return false;
    }

    return true; 
  }

  public isBiomedical(){
  
    if (!this.isLogged()) {
     
      return false;
    }

    const token = this.getToken()!;
    const payload = token.split('.')[1];
    const payloadDecoded = atob(payload);
    const values = JSON.parse(payloadDecoded);
    const roles = values.rol;

    if (roles!= 3) {
      return false;
    }

    return true; 
  }

  public isAccountant(){
  
    if (!this.isLogged()) {
     
      return false;
    }

    const token = this.getToken()!;
    const payload = token.split('.')[1];
    const payloadDecoded = atob(payload);
    const values = JSON.parse(payloadDecoded);
    const roles = values.rol;

    if (roles!= 4) {
      return false;
    }

    return true; 
  }
}