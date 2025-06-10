import { Component, Input, OnInit, NgZone } from '@angular/core';
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
    @Input() opened: boolean = false;  // Recibe el estado desde el componente padre
    isEditMode: boolean = false;
    loading: boolean = false;
    userid!:number
    exitedProducts: any[] = [];
    displayedColumns: string[] = ['id','type', 'imported', 'minsa_code', 'minsa_description', 
      'description', 'brand', 'model',
      'origin', 'serie', 'date_manufacture', 'supplier', 'exit_point','quantity_exit','quantity_total_exit', 'date', 'exit_guide', 
      'proyect', 'unit_price', 'total_amount_2', 'type_change', 'final_amount_2',
      'bill_text', 'date_bill']; // Agrega el resto
    serieslist:string[] = []
    exitobject!:Exit
    productobject!: Product
    pipedate:DatePipe = new DatePipe("en-US")
    startdateformatselected!:any
    originalExitedProducts: any[] = [];
    productlist: any[] = []
    startDate!:any
    endDate!:any
  
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
  
    /*saveChanges() {
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
                    this.startdateformatselected = this.pipedate.transform(product.exit_date, 'yyyy-MM-dd');
                    this.productobject.exit_date = this.startdateformatselected;

                    console.log(this.productobject)
                    console.log(product.id)
                  
                    this.productService.UpdateExitandProyectandGuideandExitDate(product.id, this.productobject).subscribe({
                      next: () => {
                        this.productService.getbyId(product.id).subscribe({
                          next: updated => {
                            product.exit_point = updated.exit_point;
                            product.proyect = updated.proyect;
                            product.exit_guide = updated.exit_guide;
                            product.exit_date = updated.exit_date;
                    
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
                    this.startdateformatselected = this.pipedate.transform(product.exit_date, 'yyyy-MM-dd');
                    this.productobject.exit_date = this.startdateformatselected;

                    console.log(this.productobject)
                    console.log(product.id)
                  
                    this.productService.UpdateExitandProyectandGuideandExitDate(product.id, this.productobject).subscribe({
                      next: () => {
                        this.productService.getbyId(product.id).subscribe({
                          next: updated => {
                            product.exit_point = updated.exit_point;
                            product.proyect = updated.proyect;
                            product.exit_guide = updated.exit_guide;
                            product.exit_date = updated.exit_date;
                    
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
  }*/

  saveChanges() {
    this.loading = true; 
    if (!this.exitedProducts?.length) return;

    const updatePromises = this.exitedProducts.map(product => {
      const selectedSerie = product.selected_serie;

      // Si hay selectedSerie y quantity, actualizar cantidad y luego producto
      if (selectedSerie && selectedSerie.quantity != null) {
        if (selectedSerie.quantity === '') {
          selectedSerie.quantity = 0;
        }

        return new Promise<void>((resolve, reject) => {
          this.exitService.getbySerieId(selectedSerie.id).subscribe({
            next: (response: any) => {
              const updateOrCreateEntry = response.total > 0
                ? this.exitService.updateQuantityBySerieId(selectedSerie.id, { quantity: selectedSerie.quantity })
                : this.exitService.create({ serie: selectedSerie.id, quantity: selectedSerie.quantity });

              updateOrCreateEntry.subscribe({
                next: () => {
                  this.updateProductFields(product).then(resolve).catch(reject);
                },
                error: (err: any) => {
                  console.error("Error al guardar cantidad:", err);
                  reject(err);
                }
              });
            },
            error: (err: any) => {
              console.error("Error buscando serie:", err);
              reject(err);
            }
          });
        });
      }

      // Si NO hay selectedSerie, igual actualizar los campos del producto
      return this.updateProductFields(product);
    });

    Promise.all(updatePromises).then(() => {
      console.log("Todos los cambios guardados");
      this.GetProducts();
      this.isEditMode = false;
      this.loading = false;
    }).catch(error => {
      console.error("Error guardando cambios:", error);
      this.loading = false;
    });
  }

  updateProductFields(product: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.productobject.exit_point = product.exit_point;
      this.productobject.proyect = product.proyect;
      this.productobject.exit_guide = product.exit_guide;
      this.startdateformatselected = this.pipedate.transform(product.exit_date, 'yyyy-MM-dd');
      this.productobject.exit_date = this.startdateformatselected;
      this.productobject.origin = product.origin;
      this.productobject.quantity_total_exit = product.quantity_total_exit;

      this.productService.UpdateExitandProyectandGuideandExitDate(product.id, this.productobject).subscribe({
        next: () => {
          this.productService.getbyId(product.id).subscribe({
            next: updated => {
              product.exit_point = updated.exit_point;
              product.proyect = updated.proyect;
              product.exit_guide = updated.exit_guide;
              product.exit_date = updated.exit_date;
              product.origin = updated.origin;
              product.quantity_total_exit = updated.quantity_total_exit;

              console.log("Producto actualizado sin serie:", product);
              this.exitedProducts = [...this.exitedProducts];
              this.cdr.detectChanges();
              resolve();
            },
            error: err => {
              console.error("Error obteniendo producto actualizado:", err);
              reject(err);
            }
          });
        },
        error: err => {
          console.error("Error actualizando producto sin serie:", err);
          reject(err);
        }
        });
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
     // Nueva función para convertir fecha string 'yyyy-MM-dd' a objeto Date local
    parseDateToLocal(dateString: string): Date | null {
      if (!dateString) return null;
      const parts = dateString.split('-');
      if(parts.length < 3) return null;
      return new Date(+parts[0], +parts[1] - 1, +parts[2]);
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
        
        // Convertir fechas string a objetos Date locales para evitar desfase por zona horaria
        product.exit_date = this.parseDateToLocal(product.exit_date);
          
        if (productSeries.length > 0) {
          const selectedSerie = productSeries[0];
          const totalAmount = product.unit_price * (selectedSerie?.quantity ?? 0);
          let finalAmount;
          if (!product.type_change || product.type_change === 0) {
            finalAmount = totalAmount;  // No aplicar tipo de cambio
          } else {
            finalAmount = totalAmount * product.type_change;
          }

          const totalAmount2 = product.unit_price * (product.quantity_total_exit ?? 0);
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
            total_amount_2: totalAmount2,
            final_amount_2: finalAmount2
          };
        }else {
          // Producto sin series, pero igual lo incluimos con series vacías y sin selected_serie
          const totalAmount2 = product.unit_price * (product.quantity_total_exit ?? 0);
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
            total_amount_2: totalAmount2,
            final_amount_2: finalAmount2
          };
        }
      });
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
        const productexitDate = this.pipedate.transform(product.exit_date, 'yyyy-MM-dd');
        return productexitDate === selectedDate;
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

    deployproductsbyDescription(description:any){
      if (!description) {
        this.exitedProducts = this.originalExitedProducts // Si no hay fecha seleccionada, recarga todos
        return;
      }
  
      this.exitedProducts = this.originalExitedProducts.filter(product => {
        return product.description && product.description.toLowerCase().includes(description.toLowerCase());
      });
    
      console.log("Productos filtrados por descripcion:", this.exitedProducts);
    }

    deployproductsbyDateRange(startDate: any, endDate: any) {
      if (!startDate && !endDate) {
        this.exitedProducts = this.originalExitedProducts; // Si no hay fechas seleccionadas, recarga todos los productos
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

      this.exitedProducts = this.originalExitedProducts.filter(product => {
        const productDate = this.pipedate.transform(product.exit_date, 'yyyy-MM-dd');

        // Verificar si productDate es null o undefined antes de hacer la comparación
        if (!productDate) {
          return false; // Excluir el producto si la fecha no es válida
        }

        // Asegurarse de que las fechas no sean null antes de la comparación
        return (productDate >= (formattedStartDate ?? '') && productDate <= (formattedEndDate ?? ''));
      });

      console.log("Productos filtrados por rango de fechas:", this.exitedProducts);
    }

    onStartDateChange() {
      if (!this.startDate) {
        this.endDate = null;  // Si no hay fecha en startDate, limpiamos endDate
      }
    }

    /*exportToExcel(): void {
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
      }*/
    
    exportToExcel(): void {
             const exportData: { [key: string]: any }[] = [];;
           
             // Recorremos cada producto en exitedProducts
             this.exitedProducts.forEach(product => {
               // Filtramos las series con cantidad mayor a 0
               const validSeries = product.series.filter((serie: any) => serie.quantity > 0);
           
               // Si el producto tiene series válidas, las agregamos a la exportación
               validSeries.forEach((serie: any) => {
                 const quantity = serie.quantity ?? 0;
                 const totalAmount = quantity * product.unit_price;
                 const totalAmount2 = product.total_amount_2 ?? (product.unit_price * product.quantity_total_exit);
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
                   Cantidad_de_serie_lote: quantity,
                    // Aquí va quantity_total (aunque para fila de serie normalmente no cambia, la pongo para que esté en orden)
                   Cantidad_total_salida: product.quantity_total_exit ?? 0,
                   Fecha_de_Salida: product.exit_date,
                   Guia_Salida: product.exit_guide,
                   Proyecto: product.proyect,
                   //Responsable: product.responsible,
                   //Moneda_Factura: product.coin_bill,
                   Precio_Unitario: product.unit_price,
                   //Cantidad_serie_lote_x_precio: totalAmount,
                   Cantidad_salida_x_precio: totalAmount2,
                   Tipo_Cambio: product.type_change,
                   //Precio_Total_serie_lote: finalAmount,
                   // Aquí va final_amount_2
                   Monto_total_salida: finalAmount2,
                   Factura: product.bill_text,
                   Fecha_Factura: product.date_bill
                 });
               });

               
              // Fila resumen usando quantity_total_exit y totales 2, si quantity_total_exit > 0
                if (validSeries.length === 0 && (product.quantity_total_exit ?? 0) > 0) {
                  const totalAmount2 = product.total_amount_2 ?? (product.unit_price * product.quantity_total_exit);
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
                    Cantidad_de_serie_lote: 0,  // Para fila resumen no hay cantidad por serie

                    // Aquí va quantity_total con el valor correcto
                    Cantidad_total_salida: product.quantity_total_exit,

                    Fecha_de_Entrada: product.date,
                    Guia_Ingreso: product.entry_guide,
                    Proyecto: product.proyect,
                    //Responsable: product.responsible,
                    //Moneda_Factura: product.coin_bill,
                    Precio_Unitario: product.unit_price,
                    //Cantidad_serie_lote_x_precio: 0,  // Cantidad por serie no aplica aquí

                    // Aquí va total_amount_2 con valor correcto
                    Cantidad_salida_x_precio: totalAmount2,

                    Tipo_Cambio: product.type_change,
                    //Precio_Total_serie_lote: 0,  // Precio total por serie no aplica aquí

                    // Aquí va final_amount_2 con valor correcto
                    Monto_total_salida: finalAmount2,

                    Factura: product.bill_text,
                    Fecha_Factura: product.date_bill
                  });
                }
             });
           
             // Convertir los datos exportados a formato de Excel
             const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
             const workbook: XLSX.WorkBook = { Sheets: { 'Salidas': worksheet }, SheetNames: ['Salidas'] };
             const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
           
             // Crear un blob con los datos de Excel y descargarlo
             const blob: Blob = new Blob([excelBuffer], {
               type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
             });
             FileSaver.saveAs(blob, 'salidas.xlsx');
           }
}
