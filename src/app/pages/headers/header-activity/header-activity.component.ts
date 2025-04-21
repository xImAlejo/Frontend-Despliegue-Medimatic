import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/services/token/token.service';

@Component({
  selector: 'app-header-activity',
  templateUrl: './header-activity.component.html',
  styleUrls: ['./header-activity.component.css']
})
export class HeaderActivityComponent implements OnInit {
  
  
  

  constructor(private cd:Router, private TokenService:TokenService) { }

  ngOnInit() {
  }


  GoToRegister(){
    this.cd.navigate(['activity','register',this.TokenService.getId()])
  }

  GoToActivities(){
    this.cd.navigate(['activity','record',this.TokenService.getId()])
  }

  GoToCoordination(){
    this.cd.navigate(['coordination','record',this.TokenService.getId()])
  }

  GoToLogin(){
    this.TokenService.logOut()
  }

}
