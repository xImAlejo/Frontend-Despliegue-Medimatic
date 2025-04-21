import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/services/token/token.service';

@Component({
  selector: 'app-header-activity-others',
  templateUrl: './header-activity-others.component.html',
  styleUrls: ['./header-activity-others.component.css']
})
export class HeaderActivityOthersComponent implements OnInit {

  
    constructor(private cd:Router, private TokenService:TokenService) { }
  
    ngOnInit() {
    }
  
    GoToActivities(){
      this.cd.navigate(['activity','record',this.TokenService.getId()])
    }
  
    GoToLogin(){
      this.TokenService.logOut()
    }
  

}
