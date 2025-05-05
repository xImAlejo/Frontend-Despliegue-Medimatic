import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product';
import { Serie } from 'src/app/models/serie';
import { ProductService } from 'src/services/product/product.service';
import { SerieService } from 'src/services/serie/serie.service';
import { EntryService } from 'src/services/entry/entry.service';
import { ExitService } from 'src/services/exit/exit.service';
import { ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-inventory-stock',
  templateUrl: './inventory-stock.component.html',
  styleUrls: ['./inventory-stock.component.css']
})
export class InventoryStockComponent implements OnInit {

  isEditMode: boolean = false;
  userid!:number
  enteredProducts: any[] = [];
  displayedColumns: string[] = ['id','type', 'imported', 'minsa_code', 'minsa_description', 
    'description', 'brand', 'model',
    'origin', 'serie', 'date_manufacture', 'supplier','quantity_enter','date', 'entry_guide', 'exit_guide', 
    'proyect', 'responsible', 'coin_bill', 'unit_price', 'total_amount', 'type_change', 'final_amount',
    'bill_text', 'date_bill']; // Agrega el resto
  productobject!:Product
  serieobject!:Serie
  serieslist:any[] = []
  originalEnteredProducts: any[] = [];
  pipedate:DatePipe = new DatePipe("en-US")
  startdateformatselected!:any
  productlist: any[] = []

  constructor(private route:ActivatedRoute, private cd:Router, private productService:ProductService, private serieService:SerieService,
              private entryService:EntryService, private exitService:ExitService, private cdr: ChangeDetectorRef) { 
    this.productobject = {} as Product
    this.serieobject = {} as Serie
  }

  ngOnInit() {
    this.userid = parseInt(this.route.snapshot.paramMap.get('userid')!);
    console.log(this.userid)
    this.GetProducts()
  }

  saveChanges(){

  }

  GetProducts(){
    Promise.all([
      this.productService.getAll().toPromise(),
      this.serieService.getAll().toPromise(),
      this.entryService.getAll().toPromise(),
      this.exitService.getAll().toPromise(),
    ]).then(([productsRes, seriesRes, entriesRes, exitRes]) => {
      this.filterEnteredProducts(
        (productsRes as any).rows,
        (seriesRes as any).rows,
        (entriesRes as any).rows,
        (exitRes as any).rows
      );
    });
  }

  /*filterEnteredProducts(products: any[], series: any[]) {
    const result = [];
    const serieslistconst = [];

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
        for(let eachserie of validSeries){
          serieslistconst.push(eachserie) 
        }
        cleanProduct.selected_serie = validSeries[0]?.id;
        result.push(cleanProduct);
      }
    }
    
    this.enteredProducts = result;
    this.serieslist = serieslistconst;
    console.log(this.enteredProducts)
    console.log(this.serieslist)
  }*/

  filterEnteredProducts(products: any[], series: any[], entries: any[], exits:any[]) {
    this.enteredProducts = products.map(product => {
      const productSeries = series
        .filter(serie => serie.product == product.id)
        .map(serie => {
          // Buscar la entry correspondiente a esta serie
          const entry = entries.find(entry => entry.serie == serie.id);
          // Buscar todas las salidas correspondientes a esta serie
          const relatedExits = exits.filter(exit => exit.serie == serie.id);

          const totalEntryQuantity = entry ? entry.quantity : 0;
          const totalExitQuantity = relatedExits.reduce((sum, exit) => sum + (exit.quantity || 0), 0);

          const availableQuantity = totalEntryQuantity - totalExitQuantity;

          return {
            ...serie,
            quantity: availableQuantity > 0 ? availableQuantity : 0 // Si no hay availableQuantity, cantidad 0
          };
        });

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
    }).filter(product => product.series.length > 0);
    console.log(this.enteredProducts)
    this.originalEnteredProducts = this.enteredProducts
    this.productlist = this.enteredProducts
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

  getSelectedSerie(product: any): any {
    if (!product.selected_serie) return null;
    return product.series.find((serie: any) => serie.id === (product.selected_serie.id || product.selected_serie));
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
  
    console.log("Productos filtrados por fecha:", this.enteredProducts);
  }

  exportToExcel(): void {
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
          Cantidad: quantity,
          Fecha: product.date,
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
        };
      });
    
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
      const workbook: XLSX.WorkBook = { Sheets: { 'Inventario': worksheet }, SheetNames: ['Inventario'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
      const blob: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      });
      FileSaver.saveAs(blob, 'inventario.xlsx');
    }
  
}