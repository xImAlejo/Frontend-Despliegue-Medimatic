import { TokenService } from '../../services/token/token.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private TokenService:TokenService,private router: Router,){}
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.TokenService.isLogged()) {
        if(this.TokenService.isCoordination()){
           this.router.navigate(['activity','register',this.TokenService.getId()]);
           return false
        }
        if(this.TokenService.isAdmin()){
          this.router.navigate(['inventory','register','entries',this.TokenService.getId()]);
          return false
        }
        if(this.TokenService.isBiomedical()){
          this.router.navigate(['activity','record',this.TokenService.getId()]);
          return false
        }
        if(this.TokenService.isAccountant()){
          this.router.navigate(['inventory','register','entries',this.TokenService.getId()]);
          return false
        }
    }
    return true;
  }
  
}