import { Component, OnInit, Input } from '@angular/core';
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
  @Input() opened: boolean = false;  // Recibe el estado desde el componente padre
  isEditMode: boolean = false;
  userid!:number
  enteredProducts: any[] = [];
  displayedColumns: string[] = ['id','type', 'imported', 'minsa_code', 'minsa_description', 
    'description', 'brand', 'model',
    'origin', 'serie', 'date_manufacture', 'supplier','quantity_enter','quantity_total_stock','date', 'exit_date', 'entry_guide', 'exit_guide', 
    'proyect', 'responsible', 'coin_bill', 'unit_price', 'total_amount', 'total_amount_2', 'type_change', 'final_amount', 'final_amount_2',
    'bill_text', 'date_bill']; // Agrega el resto
  productobject!:Product
  serieobject!:Serie
  serieslist:any[] = []
  originalEnteredProducts: any[] = [];
  pipedate:DatePipe = new DatePipe("en-US")
  startdateformatselected!:any
  productlist: any[] = []
  startenterDate!:any
  endenterDate!:any
  startexitDate!:any
  endexitDate!:any

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

        product.quantity_total_stock = Math.max(0, (product.quantity_total ?? 0) - (product.quantity_total_exit ?? 0));
        
        if (productSeries.length > 0) {
          const selectedSerie = productSeries[0];
          const totalAmount = product.unit_price * (selectedSerie?.quantity ?? 0);
          let finalAmount;
          if (!product.type_change || product.type_change === 0) {
            finalAmount = totalAmount;  // No aplicar tipo de cambio
          } else {
            finalAmount = totalAmount * product.type_change;
          }
          
          const totalAmount2 = product.unit_price * (product.quantity_total_stock ?? 0);
          let finalAmount2 = totalAmount2;
          if (product.type_change && product.type_change !== 0) {
            finalAmount2 = totalAmount2 * product.type_change;
          }

  
          return {
            ...product,
            series: productSeries,
            selected_serie: selectedSerie,
            total_amount: totalAmount,
            final_amount: finalAmount,
            quantity_total_stock: product.quantity_total_stock,
            total_amount_2: totalAmount2,
            final_amount_2: finalAmount2
          };
        }else {
            // Producto sin series, pero igual lo incluimos con series vacías y sin selected_serie
            const totalAmount2 = product.unit_price * (product.quantity_total_stock ?? 0);
            let finalAmount2 = totalAmount2;
            if (product.type_change && product.type_change !== 0) {
              finalAmount2 = totalAmount2 * product.type_change;
            }
            return {
              ...product,
              series: [],
              selected_serie: null,
              total_amount: 0,
              final_amount: 0,
              quantity_total_stock: product.quantity_total_stock,
              total_amount_2: totalAmount2,
              final_amount_2: finalAmount2
            };
        }
    });
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

  deployproductsbyExitDate(date:any){
    
    if (!date) {
      this.enteredProducts = this.originalEnteredProducts // Si no hay fecha seleccionada, recarga todos
      return;
    }
  
    const selectedDate = this.pipedate.transform(date, 'yyyy-MM-dd');
  
    this.enteredProducts = this.originalEnteredProducts.filter(product => {
      const productexitDate = this.pipedate.transform(product.exit_date, 'yyyy-MM-dd');
      return productexitDate === selectedDate;
    });
  
    console.log("Productos filtrados por fecha de salida:", this.enteredProducts);
    
  }

  deployEnterproductsbyDateRange(startDate: any, endDate: any) {
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

  deployExitproductsbyDateRange(startDate: any, endDate: any) {
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
      const productDate = this.pipedate.transform(product.exit_date, 'yyyy-MM-dd');

      // Verificar si productDate es null o undefined antes de hacer la comparación
      if (!productDate) {
        return false; // Excluir el producto si la fecha no es válida
      }

      // Asegurarse de que las fechas no sean null antes de la comparación
      return (productDate >= (formattedStartDate ?? '') && productDate <= (formattedEndDate ?? ''));
    });

    console.log("Productos filtrados por rango de fechas:", this.enteredProducts);
  }

  onStartEnterDateChange() {
    if (!this.startenterDate) {
      this.endenterDate = null;  // Si no hay fecha en startDate, limpiamos endDate
    }
  }

  onStartExitDateChange() {
    if (!this.startexitDate) {
      this.endexitDate = null;  // Si no hay fecha en startDate, limpiamos endDate
    }
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
            const totalAmount2 = product.total_amount_2 ?? (product.unit_price * product.quantity_total_stock);
            const finalAmount = product.type_change ? totalAmount * product.type_change : totalAmount;
            const finalAmount2 = product.final_amount_2 ?? (product.type_change && product.type_change !== 0 
              ? totalAmount2 * product.type_change
              : totalAmount2);

            // Creamos una fila para cada serie válida
            exportData.push({
              Código: `M0000${product.id}`,
              Tipo: product.type,
              Importados: product.imported,
              Codigo_minsa: product.minsa_code,
              Descripción_Requerimiento: product.minsa_description,
              Descripcion: product.description,
              Marca: product.brand,
              Modelo: product.model,
              Procedencia: product.origin,
              Serie_Lote: serie.name || '',
              Año_Fabricacion: product.date_manufacture,
              Proveedor: product.supplier,
              Cantidad_total_serie_lote: quantity,
               // Aquí va quantity_total (aunque para fila de serie normalmente no cambia, la pongo para que esté en orden)
              Cantidad_total_stock: product.quantity_total_stock ?? 0,
              Fecha_de_Entrada: product.date,
              Fecha_de_Salida: product.exit_date,
              Guia_Ingreso: product.entry_guide,
              Guia_Salida: product.exit_guide,
              Proyecto: product.proyect,
              Responsable: product.responsible,
              Moneda_Factura: product.coin_bill,
              Precio_Unitario: product.unit_price,
              Cantidad_serie_lote_x_precio: totalAmount,
              // Aquí va total_amount_2
              Cantidad_total_x_precio: totalAmount2,
              Tipo_Cambio: product.type_change,
              Precio_Total_serie_lote: finalAmount,
              // Aquí va final_amount_2
              Precio_total_stock: finalAmount2,
              Factura: product.bill_text,
              Fecha_Factura: product.date_bill
            });
          });

           // Fila resumen usando quantity_total y totales 2, si quantity_total > 0
          if (validSeries.length === 0 && (product.quantity_total_stock ?? 0) > 0) {
            const totalAmount2 = product.total_amount_2 ?? (product.unit_price * product.quantity_total_Stock);
            const finalAmount2 = product.final_amount_2 ?? (product.type_change && product.type_change !== 0
              ? totalAmount2 * product.type_change
              : totalAmount2);

            exportData.push({
              Código: `M0000${product.id}`,
              Tipo: product.type,
              Importados: product.imported,
              Codigo_minsa: product.minsa_code,
              Descripción_Requerimiento: product.minsa_description,
              Descripcion: product.description,
              Marca: product.brand,
              Modelo: product.model,
              Procedencia: product.origin,
              Serie_Lote: '', // Indicativo fila resumen
              Año_Fabricacion: product.date_manufacture,
              Proveedor: product.supplier,
              Cantidad_total_serie_lote: 0,  // Para fila resumen no hay cantidad por serie

              // Aquí va quantity_total con el valor correcto
              Cantidad_total_stock: product.quantity_total,

              Fecha_de_Entrada: product.date,
              Guia_Ingreso: product.entry_guide,
              Proyecto: product.proyect,
              Responsable: product.responsible,
              Moneda_Factura: product.coin_bill,
              Precio_Unitario: product.unit_price,
              Cantidad_serie_lote_x_precio: 0,  // Cantidad por serie no aplica aquí

              // Aquí va total_amount_2 con valor correcto
              Cantidad_total_x_precio: totalAmount2,

              Tipo_Cambio: product.type_change,
              Precio_Total_serie_lote: 0,  // Precio total por serie no aplica aquí

              // Aquí va final_amount_2 con valor correcto
              Precio_total_stock: finalAmount2,

              Factura: product.bill_text,
              Fecha_Factura: product.date_bill
            });
          }
        });
      
        // Convertir los datos exportados a formato de Excel
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'Inventario': worksheet }, SheetNames: ['Inventario'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
        // Crear un blob con los datos de Excel y descargarlo
        const blob: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        });
        FileSaver.saveAs(blob, 'inventario.xlsx');
      }
}