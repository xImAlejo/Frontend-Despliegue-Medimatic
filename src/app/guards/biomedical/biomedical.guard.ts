import { TokenService } from 'src/services/token/token.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BiomedicalGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router){}
   
  
  canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot): boolean {
      console.log("Es biomedico")
      
      if(!this.tokenService.isBiomedical()){
        
        this.router.navigate(['/login']);
        return false
      }
      return true;
  }
  
}