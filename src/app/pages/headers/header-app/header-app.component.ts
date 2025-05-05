import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from 'src/services/token/token.service';
import { UserService } from 'src/services/user/user.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-header-app',
  templateUrl: './header-app.component.html',
  styleUrls: ['./header-app.component.css']
})
export class HeaderAppComponent implements OnInit {
  
  userid!:number
  userobject!:User
  currentUrl:string = '';
  constructor(private cd:Router, private TokenService:TokenService, private route:ActivatedRoute, private userService:UserService) { 
    this.userobject = {} as User
  }

  ngOnInit() {
    this.userid = parseInt(this.route.snapshot.paramMap.get('userid')!);
    console.log(this.userid)
    this.userService.getbyId(this.userid).subscribe((response:any) =>{
      console.log(response)
      this.userobject = response
    })

    this.currentUrl = this.cd.url;

    this.cd.events.subscribe(() => {
      this.currentUrl = this.cd.url;
    });
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

  GoToEntries(){
    this.cd.navigate(['inventory','register','entries',this.TokenService.getId()])
  }

  GoToExits(){
    this.cd.navigate(['inventory','exits',this.TokenService.getId()])
  }

  GoToStock(){
    this.cd.navigate(['inventory','stock',this.TokenService.getId()])
  }

  GoToLogin(){
    this.TokenService.logOut()
  }

  isActive(paths: string[]): boolean {
    return paths.some(path => this.currentUrl.includes(path));
  }

}
