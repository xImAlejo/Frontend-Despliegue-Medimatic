import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Activity } from 'src/app/models/activity';
import { User } from 'src/app/models/user';
import { ActivityService } from 'src/services/activity/activity.service';
import { UserService } from 'src/services/user/user.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from 'src/services/token/token.service';

@Component({
  selector: 'app-activity-register',
  templateUrl: './activity-register.component.html',
  styleUrls: ['./activity-register.component.css']
})
export class ActivityRegisterComponent implements OnInit {
  @Input() opened: boolean = false;  // Recibe el estado desde el componente padre
  activityobject!:Activity
  activityform!:FormGroup
  userlist:User[] = []
  statebox:string[] = ["SIN EMPEZAR","EN PROGRESO", "PAUSADO", "TERMINADO", "ANULADO"]
  progressbox:string[] = ["0-25%","25%-50%", "50%-75%", "75%-100%"]
  prioritybox:string[] = ["BAJA","MEDIA", "ALTA", "MUY ALTA"]
  startdateformatselected!:any
  pipedate:DatePipe = new DatePipe("en-US")
  userid!:number
  userobject!:User
  currentUrl:string = '';

  constructor(private formBuilder: FormBuilder, private activityService:ActivityService, private userService:UserService,private route:ActivatedRoute, private cd:Router,  private TokenService:TokenService) { 
    this.activityobject = {} as Activity
    this.userobject = {} as User
  }

  ngOnInit() {
    this.userid = parseInt(this.route.snapshot.paramMap.get('userid')!);
    console.log(this.userid)
    this.userService.getbyId(this.userid).subscribe((response:any) =>{
      console.log(response)
      this.userobject = response
    })

    this.GetUsers()
    this.activityform = this.formBuilder.group({
      task:['',Validators.required],
      area:['',Validators.required],
      asignation_date:[''],
      limit_date:[''],
      detail:['',Validators.required],
      priority:['',Validators.required],
      user:['',Validators.required],
     })

    this.currentUrl = this.cd.url;

    this.cd.events.subscribe(() => {
      this.currentUrl = this.cd.url;
    });

  }

  onReset() {
    this.activityform.reset();
  }

  CreateActivity(){
    this.activityobject.state = this.statebox[0]
    this.activityobject.progress = this.progressbox[0]

    console.log(this.activityobject)
    console.log(this.activityobject.asignation_date)
    console.log(this.activityobject.limit_date)

    this.activityService.create(this.activityobject).subscribe((response:any) =>{
      console.log("Actividad creada correctamente!")
      console.log(response)
      this.onReset()
    },err =>{
      alert("Actividad de usuario ya existente")
      console.log(err)
    })
  }

  GetUsers(){
    this.userService.getAll().subscribe((response:any) =>{
      console.log(response.rows)
      this.userlist = response.rows
    })
  }

}
