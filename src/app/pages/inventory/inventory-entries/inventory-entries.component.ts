import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/services/product/product.service';
import { SerieService } from 'src/services/serie/serie.service';
import { ChangeDetectorRef } from '@angular/core';
import { EntryService } from 'src/services/entry/entry.service';
import { ExitService } from 'src/services/exit/exit.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditSerieDialogComponent } from '../inventory-dialogs/edit-serie-dialog/edit-serie-dialog.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-inventory-entries',
  templateUrl: './inventory-entries.component.html',
  styleUrls: ['./inventory-entries.component.css']
})
export class InventoryEntriesComponent implements OnInit {
  @Input() opened: boolean = false;  // Recibe el estado desde el componente padre
  isEditMode: boolean = false;
  userid!:number
  enteredProducts: any[] = [];
  displayedColumns: string[] = ['id','type', 'imported', 'minsa_code', 'minsa_description', 
    'description', 'brand', 'model',
    'origin', 'serie', 'date_manufacture', 'supplier', 'entry_point','quantity','date', 'entry_guide', 
    'proyect', 'responsible', 'coin_bill', 'unit_price', 'total_amount', 'type_change', 'final_amount',
    'bill_text', 'date_bill', 'edit_serie']; // Agrega el resto
  serieslist:string[] = []
  productobject!: Product
  pipedate:DatePipe = new DatePipe("en-US")
  startdateformatselected!:any
  originalEnteredProducts: any[] = [];
  productlist: any[] = []
  startDate!:any
  endDate!:any

  constructor(private route:ActivatedRoute, private cd:Router, private productService:ProductService, private serieService:SerieService, private cdr: ChangeDetectorRef, 
              private entryService:EntryService, private exitService:ExitService, private dialog:MatDialog) { 
                this.productobject = {} as Product
              }

  ngOnInit() {
    this.userid = parseInt(this.route.snapshot.paramMap.get('userid')!);
    console.log(this.userid)
    this.GetProducts()
  }

  saveChanges() {
    if (!this.enteredProducts?.length) return;

  const updatePromises = this.enteredProducts.map(product => {
      const selectedSerie = product.selected_serie;

      // Verificar si el valor de quantity es una cadena vacía y convertirlo a 0
    if (selectedSerie && selectedSerie.quantity === '') {
        selectedSerie.quantity = 0;
      }

    if (selectedSerie && selectedSerie.quantity != null) {
        return new Promise<void>((resolve, reject) => {
          this.entryService.getbySerieId(selectedSerie.id).subscribe({
            next: (response: any) => {
                this.entryService.updateQuantityBySerieId(selectedSerie.id, {
                  quantity: selectedSerie.quantity
                }).subscribe({
                  next: (res: any) => {
                    console.log("Actualizado:", res);
                    resolve(); // <- Muy importante llamar a resolve
                  },
                  error: (err: any) => {
                    console.error("Error actualizando:", err);
                    reject(err);
                  }
                });
            },
            error: (err: any) => {
              console.error("Error obteniendo serie:", err);
              reject(err);
            }
          });
        });
      } else {
        return Promise.resolve(); // Si no hay que hacer nada
      }
    });

    Promise.all(updatePromises).then(() => {
      console.log("Todos los cambios guardados");
      this.GetProducts(); // Aquí recién recarga productos
      this.isEditMode = false;
    }).catch(error => {
      console.error("Error guardando cambios:", error);
    });
  }
  

  GoToRegisterProducts(){
    console.log(this.userid)
    this.cd.navigate(['inventory','register','entries',this.userid])
  }

  GetProducts(){
    Promise.all([
      this.productService.getAll().toPromise(),
      this.serieService.getAll().toPromise(),
      this.entryService.getAll().toPromise()
    ]).then(([productsRes, seriesRes, entriesRes]) => {
      this.filterEnteredProducts(
        (productsRes as any).rows,
        (seriesRes as any).rows,
        (entriesRes as any).rows
      );
    });
  }

  /*filterEnteredProducts(products: any[], series: any[]) {
    const result = [];
  
    for (let product of products) {
      const validSeries = series.filter(s =>
        s.product === product.id && s.is_enter && !s.is_exit
      );
  
      const cleanProduct = { ...product };
      const newQuantityEnter = validSeries.length;
  
      // Solo si hay diferencia, actualizamos
      if (product.quantity_enter !== newQuantityEnter) {
        this.productService.updateQuantityEnter(cleanProduct.id, { quantity_enter: newQuantityEnter })
        .subscribe((response: any) => {
            console.log(`Producto ${cleanProduct.id}: quantity_enter actualizado a ${newQuantityEnter}`);
          });
      }
  
      if (newQuantityEnter > 0) {
        cleanProduct.quantity_enter = newQuantityEnter;
        cleanProduct.series = validSeries;
        cleanProduct.selected_serie = validSeries[0]?.id;
        result.push(cleanProduct);
      }
    }
    
    this.enteredProducts = result;
    console.log(this.enteredProducts)
  }*/

//cleanProduct.selected_serie = validSeries[0];

  filterEnteredProducts(products: any[], series: any[], entries: any[]) {
    this.enteredProducts = products.map(product => {
      const productSeries = series
        .filter(serie => serie.product == product.id)
        .map(serie => {
          // Buscar la entry correspondiente a esta serie
          const entry = entries.find(entry => entry.serie == serie.id);
          return {
            ...serie,
            quantity: entry ? entry.quantity : null // Si no hay entry, cantidad 0
          };
        }).filter(serie => serie.quantity !== 0);

      if (productSeries.length > 0) {
        const selectedSerie = productSeries[0];
        const totalAmount = product.unit_price * (selectedSerie?.quantity ?? 0);
        let finalAmount;
        if (!product.type_change || product.type_change === 0) {
          finalAmount = totalAmount;  // No aplicar tipo de cambio
        } else {
          finalAmount = totalAmount * product.type_change;
        }


        return {
          ...product,
          series: productSeries,
          selected_serie: selectedSerie,
          total_amount: totalAmount,
          final_amount: finalAmount
        };
      }else {
        return null; // eliminar el producto si no quedan series
      }
    }).filter(product => product !== null);
    console.log(this.enteredProducts)
    this.originalEnteredProducts = this.enteredProducts
    this.productlist = this.enteredProducts
  }

  getSelectedSerie(product: any): any {
    return product.series.find((serie: any) => serie.id === product.selected_serie?.id);
  }

  onSerieChange() {
    for (let product of this.enteredProducts) {
      const selectedSerie = product.selected_serie;
      if (selectedSerie) {
        const quantity = selectedSerie.quantity ?? 0;
        product.total_amount = product.unit_price * quantity;
        
        if (!product.type_change || product.type_change === 0) {
          product.final_amount = product.total_amount;  // No aplicar tipo de cambio
        } else {
          product.final_amount = product.total_amount * product.type_change;
        }
      }
    }
    this.cdr.detectChanges();
  }

  deployproductsbyDate(date:any){
    
    if (!date) {
      this.enteredProducts = this.originalEnteredProducts // Si no hay fecha seleccionada, recarga todos
      return;
    }
  
    const selectedDate = this.pipedate.transform(date, 'yyyy-MM-dd');
  
    this.enteredProducts = this.originalEnteredProducts.filter(product => {
      const productDate = this.pipedate.transform(product.date, 'yyyy-MM-dd');
      return productDate === selectedDate;
    });
  
    console.log("Productos filtrados por fecha:", this.enteredProducts);
    
  }

  deployproductsbyProductId(id:any){
    if (!id) {
      this.enteredProducts = this.originalEnteredProducts // Si no hay fecha seleccionada, recarga todos
      return;
    }

    this.enteredProducts = this.originalEnteredProducts.filter(product => {
      return product.id === id;
    });
  
    console.log("Productos filtrados por codigo:", this.enteredProducts);
  }

  deployproductsbyDescription(description:any){
    if (!description) {
      this.enteredProducts = this.originalEnteredProducts // Si no hay fecha seleccionada, recarga todos
      return;
    }

    this.enteredProducts = this.originalEnteredProducts.filter(product => {
      return product.description && product.description.toLowerCase().includes(description.toLowerCase());
    });
  
    console.log("Productos filtrados por descripcion:", this.enteredProducts);
  }

  deployproductsbyDateRange(startDate: any, endDate: any) {
    if (!startDate && !endDate) {
      this.enteredProducts = this.originalEnteredProducts; // Si no hay fechas seleccionadas, recarga todos los productos
      return;
    }

    const formattedStartDate = this.pipedate.transform(startDate, 'yyyy-MM-dd');
    const formattedEndDate = endDate ? this.pipedate.transform(endDate, 'yyyy-MM-dd') : formattedStartDate;

    if (!formattedStartDate) {
      console.error("La fecha de inicio no es válida");
      return;
    }

    if (endDate && !formattedEndDate) {
      console.error("La fecha de fin no es válida");
      return;
    }

    this.enteredProducts = this.originalEnteredProducts.filter(product => {
      const productDate = this.pipedate.transform(product.date, 'yyyy-MM-dd');

      // Verificar si productDate es null o undefined antes de hacer la comparación
      if (!productDate) {
        return false; // Excluir el producto si la fecha no es válida
      }

      // Asegurarse de que las fechas no sean null antes de la comparación
      return (productDate >= (formattedStartDate ?? '') && productDate <= (formattedEndDate ?? ''));
    });

    console.log("Productos filtrados por rango de fechas:", this.enteredProducts);
  }

  onStartDateChange() {
    if (!this.startDate) {
      this.endDate = null;  // Si no hay fecha en startDate, limpiamos endDate
    }
  }

  OpenEditSerie(idproduct:any){
    const dialogcustomer = this.dialog.open(EditSerieDialogComponent,{
      data: idproduct       
    })

    dialogcustomer.afterClosed().subscribe(result => {
      if (result) {
        this.GetProducts(); // Recarga los datos si se hicieron cambios
      }    
    }) 
    
  }

  /*exportToExcel(): void {
    const exportData = this.enteredProducts.map(product => {
      const serie = product.selected_serie || {};
      const quantity = serie.quantity ?? 0;
      const totalAmount = quantity * product.unit_price;
      const finalAmount = product.type_change ? totalAmount * product.type_change : totalAmount;
  
      return {
        Código: `M0000${product.id}`,
        Tipo: product.type,
        Importados: product.imported,
        Codigo_minsa: product.minsa_code,
        Descripción_Minsa: product.minsa_description,
        Descripcion: product.description,
        Marca: product.brand,
        Modelo: product.model,
        Procedencia: product.origin,
        Serie_Lote: serie.name || '',
        Año_Fabricacion: product.date_manufacture,
        Proveedor: product.supplier,
        Sede_Ingreso: product.entry_point,
        Cantidad: quantity,
        Fecha: product.date,
        Guia_Ingreso: product.entry_guide,
        Proyecto: product.proyect,
        Responsable: product.responsible,
        Moneda_Factura: product.coin_bill,
        Precio_Unitario: product.unit_price,
        Cantidad_x_precio: totalAmount,
        Tipo_Cambio: product.type_change,
        Precio_Total: finalAmount,
        Factura: product.bill_text,
        Fecha_Factura: product.date_bill
      };
    });
  
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Entradas': worksheet }, SheetNames: ['Entradas'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    FileSaver.saveAs(blob, 'entradas.xlsx');
  }*/
 exportToExcel(): void {
         const exportData: { [key: string]: any }[] = [];;
       
         // Recorremos cada producto en enteredProducts
         this.enteredProducts.forEach(product => {
           // Filtramos las series con cantidad mayor a 0
           const validSeries = product.series.filter((serie: any) => serie.quantity > 0);
       
           // Si el producto tiene series válidas, las agregamos a la exportación
           validSeries.forEach((serie: any) => {
             const quantity = serie.quantity ?? 0;
             const totalAmount = quantity * product.unit_price;
             const finalAmount = product.type_change ? totalAmount * product.type_change : totalAmount;
       
             // Creamos una fila para cada serie válida
             exportData.push({
               Código: `M0000${product.id}`,
               Tipo: product.type,
               Importados: product.imported,
               Codigo_minsa: product.minsa_code,
               Descripción_Minsa: product.minsa_description,
               Descripcion: product.description,
               Marca: product.brand,
               Modelo: product.model,
               Procedencia: product.origin,
               Serie_Lote: serie.name || '',
               Año_Fabricacion: product.date_manufacture,
               Proveedor: product.supplier,
               Cantidad: quantity,
               Fecha_de_Entrada: product.date,
               Guia_Ingreso: product.entry_guide,
               Guia_Salida: product.exit_guide,
               Proyecto: product.proyect,
               Responsable: product.responsible,
               Moneda_Factura: product.coin_bill,
               Precio_Unitario: product.unit_price,
               Cantidad_x_precio: totalAmount,
               Tipo_Cambio: product.type_change,
               Precio_Total: finalAmount,
               Factura: product.bill_text,
               Fecha_Factura: product.date_bill
             });
           });
         });
       
         // Convertir los datos exportados a formato de Excel
         const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
         const workbook: XLSX.WorkBook = { Sheets: { 'Entradas': worksheet }, SheetNames: ['Entradas'] };
         const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
       
         // Crear un blob con los datos de Excel y descargarlo
         const blob: Blob = new Blob([excelBuffer], {
           type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
         });
         FileSaver.saveAs(blob, 'entradas.xlsx');
       }

}
