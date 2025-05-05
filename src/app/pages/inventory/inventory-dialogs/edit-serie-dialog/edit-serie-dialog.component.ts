import { Component, Inject, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SerieService } from 'src/services/serie/serie.service';
import { Serie } from 'src/app/models/serie';
import { EntryService } from 'src/services/entry/entry.service';

@Component({
  selector: 'app-edit-serie-dialog',
  templateUrl: './edit-serie-dialog.component.html',
  styleUrls: ['./edit-serie-dialog.component.css']
})
export class EditSerieDialogComponent implements OnInit {
  productserie!:Serie
  serieform!:FormGroup
  newseries_input:any
  serielist:any = []
  constructor(private formBuilder: FormBuilder,  @Inject(MAT_DIALOG_DATA) public idproduct:any, private serieService:SerieService, public dialogRef: MatDialogRef<EditSerieDialogComponent>, private entryService:EntryService) { 
    this.productserie = {} as Serie
  }

  ngOnInit() {
    console.log(this.idproduct)
    this.serieform = this.formBuilder.group({
              series_input:['',Validators.required],
        })
  }

  AddSeries(series:any) {
    const input = series;
    if (!input) return;
  
    // Dividir por coma o punto y coma, eliminar espacios y vacíos
    const seriesArray = input.split(/[,;]+/)
      .map((name: string) => name.trim())
      .filter((name: string) => name.length > 0);
  
    // Enviar cada serie individualmente
    for (const name of seriesArray) {
      const serie = {
        name: name,
        product: this.idproduct // o this.idproduct.id según cómo se pasa
      };
  
      this.serieService.create(serie).subscribe({
        next: (res) => {
          console.log('Serie creado:', res);
          const entry = {
            serie: res.id
          }
          this.entryService.create(entry).subscribe((responseentry:any)=>{
            console.log('Entry creado:', responseentry);
            this.closeDialog(responseentry);
          },err =>{
            console.error('Error al crear el entry:', err);
          });
        },
        error: (err) => {
          console.error('Error al crear la serie:', err);
        }
      });
    }
  
    // Limpia el formulario si deseas
    this.serieform.reset();
  }

  closeDialog(updatedData?: any): void {
    // Aquí, `updatedData` podría ser cualquier dato que quieras devolver al componente padre
    this.dialogRef.close(updatedData); // Este método cierra el diálogo
  }

}