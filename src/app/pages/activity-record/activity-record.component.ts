import { Component, OnInit } from '@angular/core';
import { ActivityService } from 'src/services/activity/activity.service';
import { Activity } from 'src/app/models/activity';
import { UserService } from 'src/services/user/user.service';
import { User } from 'src/app/models/user';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-activity-record',
  templateUrl: './activity-record.component.html',
  styleUrls: ['./activity-record.component.css']
})
export class ActivityRecordComponent implements OnInit {

  displayedColumns: string[] = ['pos', 'tarea', 'detalle', 'area_o_proyecto', 
                                'prioridad', 'fecha_de_asignacion', 'fecha_limite',
                                'finalization_date', 'estado', 'progreso', 'done', 'observaciones','notes']; // Agrega el resto
  dataSource = [
    { pos: 1, tarea: 'Informe', detalle: 'Completar sección 1', area_o_proyecto: 'Area 1', 
      prioridad: 'Alta', fecha_de_asignacion: '23/10/2025', fecha_limite: '23/10/2025',
      dias_restantes: '23', estado: 'estado 1', progreso: 'progreso 1', done: 'done 1', 
      observaciones: 'observacion 1'},
  ];

  activitylist:Activity[] = []
  userlist:User[] = []
  activityobject!:Activity
  startdateformatselected!:any
  pipedate:DatePipe = new DatePipe("en-US")
  isEditMode: boolean = false;

  states: string[] = ['SIN EMPEZAR', 'EN PROGRESO', 'PAUSADO', 'TERMINADO', 'ANULADO'];
  progressOptions: string[] = ['0%-25%', '25%-50%', '50%-75%', '75%-100%'];
  prioritybox:string[] = ["BAJA","MEDIA", "ALTA", "MUY ALTA"]

  userid!:number
  userobject!:User

  constructor(private activityService:ActivityService, private userService:UserService,private route:ActivatedRoute) { 
    this.activityobject = {} as Activity
    this.userobject = {} as User
  }

  ngOnInit() {
    this.userid = parseInt(this.route.snapshot.paramMap.get('userid')!);
    console.log(this.userid)
    this.userService.getbyId(this.userid).subscribe((response:any) =>{
      console.log(response)
      this.userobject = response
      this.GetActivities(this.userobject)
    })
    this.GetUsers()
   
  }


  GetActivities(user:User){
    console.log(this.userobject.rol)
    if(this.userobject.rol == 1 || this.userobject.rol == 2){
      this.activityService.getAll().subscribe((response:any) =>{
        console.log(response.rows)
        this.activitylist = response.rows
        for (let activity of this.activitylist) {
          activity.asignation_date = new Date(activity.asignation_date);
          activity.limit_date = new Date(activity.limit_date);
        }
      })
    }else{
      this.activityService.getbyUserId(this.userobject.id).subscribe((response:any) =>{
        console.log(response.rows)
        this.activitylist = response.rows
        for (let activity of this.activitylist) {
          activity.asignation_date = new Date(activity.asignation_date);
          activity.limit_date = new Date(activity.limit_date);
        }
      })
    }
  }

  onDoneChange(checked: boolean, activityparam: any) {
    activityparam.done = checked ? 1 : 0;

    //colocar la fecha actual a finalization date
    if(activityparam.done == 1){
      activityparam.finalization_date = new Date();
    }
    if(activityparam.done == 0){
      activityparam.finalization_date = null
    }
    
    console.log(activityparam)
    this.activityService.update(activityparam.id, activityparam).subscribe((response:any) =>{
      console.log(response)
    },err =>{
      console.log(err)
    });
  }

  GetUsers(){
    this.userService.getAll().subscribe((response:any) =>{
      console.log(response.rows)
      this.userlist = response.rows
    })
  }

  saveChanges() {
    for (let activity of this.activitylist) {
      this.activityService.update(activity.id, activity).subscribe((response:any) =>{
        console.log(response)
        console.log("Actualizado")
      },err =>{
        console.log(err)
      });
    }
  
    this.isEditMode = false;
  }

  deployActivitiesbyUser(user:any){
    console.log(user)
    this.userService.getbyId(user).subscribe((responseuser:any) =>{
      console.log(responseuser)
      this.activityService.getbyUserId(responseuser.id).subscribe((response:any) =>{
        console.log(response.rows)
        this.activitylist = response.rows
      })
    })
    
  }

}
