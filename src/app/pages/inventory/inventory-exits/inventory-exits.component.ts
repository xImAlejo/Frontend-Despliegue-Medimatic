import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/services/product/product.service';
import { SerieService } from 'src/services/serie/serie.service';
import { EntryService } from 'src/services/entry/entry.service';
import { ExitService } from 'src/services/exit/exit.service';
import { ChangeDetectorRef } from '@angular/core';
import { Exit } from 'src/app/models/exit';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-inventory-exits',
  templateUrl: './inventory-exits.component.html',
  styleUrls: ['./inventory-exits.component.css']
})
export class InventoryExitsComponent implements OnInit {

    isEditMode: boolean = false;
    userid!:number
    exitedProducts: any[] = [];
    displayedColumns: string[] = ['id','type', 'imported', 'minsa_code', 'minsa_description', 
      'description', 'brand', 'model',
      'origin', 'serie', 'date_manufacture', 'supplier', 'exit_point','quantity_exit','date', 'exit_guide', 
      'proyect', 'responsible', 'coin_bill', 'unit_price', 'total_amount', 'type_change', 'final_amount',
      'bill_text', 'date_bill']; // Agrega el resto
    serieslist:string[] = []
    exitobject!:Exit
    productobject!: Product
    pipedate:DatePipe = new DatePipe("en-US")
    startdateformatselected!:any
    originalExitedProducts: any[] = [];
    productlist: any[] = []
  
    constructor(private route:ActivatedRoute, private cd:Router, private productService:ProductService, private serieService:SerieService,
                private entryService:EntryService, private exitService:ExitService, private cdr: ChangeDetectorRef,  private zone: NgZone) { 
                  this.exitobject = {} as Exit
                  this.productobject = {} as Product
                }
  
    ngOnInit() {
      this.userid = parseInt(this.route.snapshot.paramMap.get('userid')!);
      console.log(this.userid)
      this.GetProducts()
    }
  
    saveChanges() {
      if (!this.exitedProducts?.length) return;

      const updatePromises = this.exitedProducts.map(product => {
          const selectedSerie = product.selected_serie;
      
          // Verificar si el valor de quantity es una cadena vacía y convertirlo a 0
      if (selectedSerie && selectedSerie.quantity === '') {
            selectedSerie.quantity = 0;
          }
        
      if (selectedSerie && selectedSerie.quantity != null) {
        return new Promise<void>((resolve, reject) => {
          this.exitService.getbySerieId(selectedSerie.id).subscribe({
            next: (response: any) => {
              if (response.total > 0) {
                this.exitService.updateQuantityBySerieId(selectedSerie.id, {
                  quantity: selectedSerie.quantity
                }).subscribe({
                  next: (res: any) => {
                    console.log("Actualizado:", res);
                    this.productobject.exit_point = product.exit_point
                    this.productobject.proyect = product.proyect
                    this.productobject.exit_guide = product.exit_guide

                    console.log(this.productobject)
                    console.log(product.id)
                  
                    this.productService.updateExitandProyectandGuide(product.id, this.productobject).subscribe({
                      next: () => {
                        this.productService.getbyId(product.id).subscribe({
                          next: updated => {
                            product.exit_point = updated.exit_point;
                            product.proyect = updated.proyect;
                            product.exit_guide = updated.exit_guide;
                    
                            console.log("Producto actualizado manualmente:", product);
                    
                            this.exitedProducts = [...this.exitedProducts];
                            this.cdr.detectChanges(); // <-- Aquí forzamos la detección de cambios
                    
                            resolve();
                          },
                          error: err => {
                            console.error("Error obteniendo producto actualizado:", err);
                            reject(err);
                          }
                        });
                      },
                      error: err => {
                        console.error("Error actualizando producto:", err);
                        reject(err);
                      }
                    });
                  },
                  error: (err: any) => {
                    console.error("Error actualizando:", err);
                    reject(err);
                  }
                });
              } else {
                this.exitobject.serie = selectedSerie.id;
                this.exitobject.quantity = selectedSerie.quantity;
                this.exitService.create(this.exitobject).subscribe({
                  next: (res: any) => {
                    console.log("Se creó correctamente:", res);
                    this.productobject.exit_point = product.exit_point
                    this.productobject.proyect = product.proyect
                    this.productobject.exit_guide = product.exit_guide

                    console.log(this.productobject)
                    console.log(product.id)
                  
                    this.productService.updateExitandProyectandGuide(product.id, this.productobject).subscribe({
                      next: () => {
                        this.productService.getbyId(product.id).subscribe({
                          next: updated => {
                            product.exit_point = updated.exit_point;
                            product.proyect = updated.proyect;
                            product.exit_guide = updated.exit_guide;
                    
                            console.log("Producto actualizado manualmente:", product);
                    
                            this.exitedProducts = [...this.exitedProducts];
                            this.cdr.detectChanges(); // <-- Aquí forzamos la detección de cambios
                    
                            resolve();
                          },
                          error: err => {
                            console.error("Error obteniendo producto actualizado:", err);
                            reject(err);
                          }
                        });
                      },
                      error: err => {
                        console.error("Error actualizando producto:", err);
                        reject(err);
                      }
                    });
                  },
                  error: (err: any) => {
                    console.error("Error creando:", err);
                    reject(err);
                  }
                });
              }
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
  
    GetProducts(){
      Promise.all([
        this.productService.getAll().toPromise(),
        this.serieService.getAll().toPromise(),
        this.exitService.getAll().toPromise()
      ]).then(([productsRes, seriesRes, exitsRes]) => {
        this.filterExitedProducts(
          (productsRes as any).rows,
          (seriesRes as any).rows,
          (exitsRes as any).rows
        );
      });
    }
  
    filterExitedProducts(products: any[], series: any[], exits: any[]) {
      this.exitedProducts = products.map(product => {
        const productSeries = series
          .filter(serie => serie.product == product.id)
          .map(serie => {
            // Buscar la entry correspondiente a esta serie
            const exit = exits.find(exit => exit.serie == serie.id);
            return {
              ...serie,
              quantity: exit ? exit.quantity : null // Si no hay entry, cantidad 0
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
      console.log(this.exitedProducts)
      this.originalExitedProducts = this.exitedProducts
      this.productlist = this.exitedProducts
    }

    onSerieChange() {
      for (let product of this.exitedProducts) {
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
      return product.series.find((serie: any) => serie.id === product.selected_serie?.id);
    }

    deployproductsbyDate(date:any){
    
      if (!date) {
        this.exitedProducts = this.originalExitedProducts // Si no hay fecha seleccionada, recarga todos
        return;
      }
    
      const selectedDate = this.pipedate.transform(date, 'yyyy-MM-dd');
    
      this.exitedProducts = this.originalExitedProducts.filter(product => {
        const productDate = this.pipedate.transform(product.date, 'yyyy-MM-dd');
        return productDate === selectedDate;
      });
    
      console.log("Productos filtrados por fecha:", this.exitedProducts);
      
    }

    deployproductsbyProductId(id:any){
      if (!id) {
        this.exitedProducts = this.originalExitedProducts // Si no hay fecha seleccionada, recarga todos
        return;
      }
  
      this.exitedProducts = this.originalExitedProducts.filter(product => {
        return product.id === id;
      });
    
      console.log("Productos filtrados por fecha:", this.exitedProducts);
    }

    exportToExcel(): void {
        const exportData = this.exitedProducts.map(product => {
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
            Sede_Salida: product.exit_point,
            Cantidad: quantity,
            Fecha: product.date,
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
        const workbook: XLSX.WorkBook = { Sheets: { 'Salidas': worksheet }, SheetNames: ['Salidas'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
        const blob: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        });
        FileSaver.saveAs(blob, 'salidas.xlsx');
      }
}
