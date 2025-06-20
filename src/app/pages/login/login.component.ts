import { Component, OnInit } from '@angular/core';
import { Login } from 'src/app/models/login';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/services/auth/auth.service';
import { TokenService } from 'src/services/token/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide:boolean = true
  loginobject!:Login
  loginform!:FormGroup
  isLoading: boolean = false;

  constructor(private formBuilder:FormBuilder, private AuthService:AuthService, private Router:Router, private TokenService: TokenService) {
    this.loginobject = {} as Login
  }

  ngOnInit() {
    this.loginform=this.formBuilder.group({
      username:['',[Validators.required]],
      password:['',[Validators.required]],
     })
  }
  Login(){
    this.isLoading = true;
    console.log(this.loginobject)

    this.AuthService.Login(this.loginobject).subscribe((response:any)=>{
        this.isLoading = false;
        console.log(response)
        this.TokenService.setToken(response.token)
        if(this.TokenService.isCoordination()){
          console.log("Es coordinador")
          this.Router.navigate(['activity','register',this.TokenService.getId()])
        }
        if(this.TokenService.isAdmin()){
          console.log("Es administrador")
          this.Router.navigate(['inventory','register','entries',this.TokenService.getId()])
        }
        if(this.TokenService.isBiomedical()){
          console.log("Es biomedico")
          this.Router.navigate(['activity','record',this.TokenService.getId()])
        }
        if(this.TokenService.isAccountant()){
          console.log("Es contador")
          this.Router.navigate(['inventory','register','entries',this.TokenService.getId()])
        }
    },err=>{
        this.isLoading = false;
        alert("usuario o contraseña incorrecta")
        console.log(err)
    })
  }

}