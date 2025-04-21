import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Activity } from 'src/app/models/activity';
import { User } from 'src/app/models/user';
import { ActivityService } from 'src/services/activity/activity.service';
import { UserService } from 'src/services/user/user.service';
import { DatePipe } from '@angular/common';
import { Coordination } from 'src/app/models/coordination';
import { CoordinationService } from 'src/services/coordination/coordination.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-coordination-record',
  templateUrl: './coordination-record.component.html',
  styleUrls: ['./coordination-record.component.css']
})
export class CoordinationRecordComponent implements OnInit {

  displayedColumns: string[] = ['pos', 'fecha_registro', 'cliente_proyecto', 'detalle_actividad', 
                                'prioridad', 'orden_trabajo', 'fecha_llegada',
                                'fecha_inicio', 'fecha_finalizacion', 'estado_actividad', 
                                'done', 'observaciones']; 
  dataSource = [
  { pos: 1, fecha_registro: 'Fecha de registro 1', cliente_proyecto: 'cliente proyecto 1', detalle_actividad: 'detalle actividad 1', 
    prioridad: 'Alta', orden_trabajo: 'orden trabajo 1', fecha_llegada: 'fecha llegada 1',
    fecha_inicio: 'fecha inicio 1', fecha_finalizacion: 'fecha finalizacion 1', dias_restantes: 'dias restantes 1', estado_actividad: 'estado actividad 1', 
    done: 'done 1', observaciones: 'observacion 1'},
  ];

  statebox:string[] = ["SIN EMPEZAR","EN PROGRESO", "PAUSADO", "TERMINADO", "ANULADO"]
  prioritybox:string[] = ["BAJA","MEDIA", "ALTA", "MUY ALTA"]
  orderbox:string[] = ["1°","2°", "3°", "4°","5°","6°", "7°", "8°","9°","10°"]

  coordinationform!:FormGroup
  coordinationobject!:Coordination
  startdateformatselected!:any
  pipedate:DatePipe = new DatePipe("en-US")
  coordinationlist:Coordination[] = []
  isEditMode: boolean = false;

  userid!:number
  userobject!:User

  constructor(private formBuilder: FormBuilder, private coordinationService:CoordinationService,private route:ActivatedRoute,private userService:UserService) {
    this.coordinationobject = {} as Coordination
    this.userobject = {} as User
  }

  ngOnInit() {
    this.userid = parseInt(this.route.snapshot.paramMap.get('userid')!);
    console.log(this.userid)
    this.userService.getbyId(this.userid).subscribe((response:any) =>{
      console.log(response)
      this.userobject = response
    })
    this.GetCoordinations()
    this.coordinationform = this.formBuilder.group({
      clientname:['',Validators.required],
      finaldate:['',Validators.required],
      activity_detail:['',Validators.required],
      initial_date:['',Validators.required],
      arrival_date:['',Validators.required],
      final_date:['',Validators.required],
      priority:['',Validators.required],
      job_order:['',Validators.required],
     })
  }

  onReset() {
    this.coordinationform.reset();
  }
  
  CreateCoordination(){
    this.coordinationobject.state = this.statebox[0]

    console.log(this.coordinationobject)
    console.log(this.coordinationobject.initial_date)
    console.log(this.coordinationobject.arrival_date)
    
    this.coordinationService.create(this.coordinationobject).subscribe((response:any) =>{
      console.log("Coordinacion creada correctamente!")
      console.log(response)
      this.onReset()
      this.GetCoordinations()
    },err =>{
      alert("Coordinacion ya existente")
      console.log(err)
    })
  }

  GetCoordinations(){
    this.coordinationService.getAll().subscribe((response:any) =>{
      console.log(response.rows)
      this.coordinationlist = response.rows
      for (let coordination of this.coordinationlist) {
        coordination.initial_date = new Date(coordination.initial_date);
        coordination.arrival_date = new Date(coordination.arrival_date);
      }
    })
  
  }

  onDoneChange(checked: boolean, coordinationparam: any) {
    coordinationparam.done = checked ? 1 : 0;

    //colocar la fecha actual a finalization date
    if(coordinationparam.done == 1){
      coordinationparam.final_date = new Date();
    }
    if(coordinationparam.done == 0){
      coordinationparam.final_date = null
    }

    console.log(coordinationparam)
    this.coordinationService.update(coordinationparam.id, coordinationparam).subscribe((response:any) =>{
      console.log(response)
    },err =>{
      console.log(err)
    });
  }

  saveChanges(){
    for (let coordination of this.coordinationlist) {
      this.coordinationService.update(coordination.id, coordination).subscribe((response:any) =>{
        console.log(response)
        console.log("Actualizado")
      },err =>{
        console.log(err)
      });
    }
  
    this.isEditMode = false;
  }


}
