import { Component, Input,  OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product';
import { User } from 'src/app/models/user';
import { UserService } from 'src/services/user/user.service';
import { ProductService } from 'src/services/product/product.service';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register-entries',
  templateUrl: './register-entries.component.html',
  styleUrls: ['./register-entries.component.css']
})
export class RegisterEntriesComponent implements OnInit {
  @Input() opened: boolean = false;  // Recibe el estado desde el componente padre
  registerentriesform!:FormGroup
  productobject!:Product
  pipedate:DatePipe = new DatePipe("en-US")
  startdateformatselected!:any
  coinlist:string[] = ["SOLES","DOLARES", "EUROS"]
  userlist:User[] = []
  userid!:number

  constructor(private formBuilder: FormBuilder, private userService:UserService, private productService:ProductService, private cd:Router, private route:ActivatedRoute) { 
    this.productobject = {} as Product
  }

  ngOnInit() {
    this.userid = parseInt(this.route.snapshot.paramMap.get('userid')!);
    console.log(this.userid)

    this.GetUsers()
    this.registerentriesform = this.formBuilder.group({
          type:['',Validators.required],
          imported:['',Validators.required],
          description:['',Validators.required],
          brand:['',Validators.required],
          unit_price:['',Validators.required],
          type_change:['',Validators.required],
          bill_text:['',Validators.required],
          date_bill:['',Validators.required],
          model:['',Validators.required],
          origin:['',Validators.required],
          date_manufacture:['',Validators.required],
          minsa_code:['',Validators.required],
          minsa_description:['',Validators.required],
          supplier:['',Validators.required],
          entry_point:['',Validators.required],
          date:['',Validators.required],
          entry_guide:['',Validators.required],
          proyect:['',Validators.required],
          responsible:['',Validators.required],
          coin_bill:['',Validators.required],
          series_input:['',Validators.required],
          quantity_total:['',Validators.required]
    })
  }

  onReset(){
    this.registerentriesform.reset();
    this.productobject = {} as Product; // Limpia el objeto para el siguiente registr
  }

  CreateEntries(){
    console.log(this.productobject)

    this.startdateformatselected = this.pipedate.transform(this.productobject.date, 'yyyy-MM-dd')
    console.log(typeof this.startdateformatselected)
    console.log(this.startdateformatselected)
    this.productobject.date = this.startdateformatselected

    this.startdateformatselected = this.pipedate.transform(this.productobject.date_bill, 'yyyy-MM-dd')
    console.log(typeof this.startdateformatselected)
    console.log(this.startdateformatselected)
    this.productobject.date_bill = this.startdateformatselected

    this.startdateformatselected = this.pipedate.transform(this.productobject.date_manufacture, 'yyyy-MM-dd')
    console.log(typeof this.startdateformatselected)
    console.log(this.startdateformatselected)
    this.productobject.date_manufacture = this.startdateformatselected
    
    this.productobject.responsible = "Patricia"

    console.log(this.productobject)

    this.productService.create(this.productobject).subscribe((response:any) =>{
      console.log("Producto creado correctamente")
      console.log(response)
      this.onReset()
    },err =>{
      alert("Faltan datos por completar")
      console.log(err)
    })
  }

  GetUsers(){
    this.userService.getAll().subscribe((response:any) =>{
      console.log(response.rows)
      this.userlist = response.rows
    })
  }

  GoToEntries(){
    console.log(this.userid)
    this.cd.navigate(['inventory','entries',this.userid])
  }

}
