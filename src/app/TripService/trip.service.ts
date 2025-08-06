import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { filter, firstValueFrom, Observable, take, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { OnlineStatusService, OnlineStatusType } from './online-status.service';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  selectedRow: any = {};
  record: any = null;
  baseUrl: string = environment.webAPIUrl;
  eventList: any = null;
  saleDeliveryOnTripStatusList: any = [];
  saleDeliveryRejectReasonList: any = [];
  SaleDeliveryOnTripStatusList: any = [];
  uploadImagesList: any = [];
  TripEventList: any = [];
  onlineStatus: OnlineStatusType = OnlineStatusType.OFFLINE;
  currentPositionUrl: SafeResourceUrl | null = null;
  mapVisible: boolean = false;
  pendingSelectedRow: any = [];


  constructor(
    public http: HttpClient,
    private readonly domSanitizer: DomSanitizer,
    readonly geolocation$: GeolocationService,
    public onlineStatusService: OnlineStatusService,
    private toastr: ToastrService) {
    this.getSaleDeliveryOnTripStatusList().subscribe((data) => {
      this.saleDeliveryOnTripStatusList = data;
    },
      function (error) {
        alert('error');
      }
    );

    this.getSaleDeliveryRejectReasonList().subscribe((data) => {
      this.saleDeliveryRejectReasonList = data;
    },
      function (error) {
        alert('error');
      }
    );

    this.getSaleDeliveryOnTripStatusList().subscribe((data) => {
      this.SaleDeliveryOnTripStatusList = data;
    },
      function (error) {
        alert('error');
      });


    this.onlineStatus = this.onlineStatusService.getStatus();

    this.onlineStatusService.status.subscribe(
      async (status: OnlineStatusType) => {
        console.log('Online status changed:', status);

        if (status === OnlineStatusType.ONLINE) {
          this.onlineStatus = OnlineStatusType.ONLINE;
        } else {
          this.onlineStatus = OnlineStatusType.OFFLINE;
        }
        if (this.onlineStatus === OnlineStatusType.ONLINE) {
          this.baseUrl = environment.webAPIUrl;
          this.toastr.success('Volviste a estar en linea', 'En linea');

          await this.processError();



        } else {
          this.toastr.error('Perdiste la conexión a internet', 'Sin conexión');
          this.onlineStatus = OnlineStatusType.OFFLINE;
          this.baseUrl = 'http://localhost:00000/';
        }

      }
    );
  }


  async processError(): Promise<void> {
    this.pendingSelectedRow = this.pendingSelectedRow.filter((e: any) => e.status == "Error");
    this.pendingSelectedRow.forEach(
      (selectedRow: any) => {

        this.http.put(this.baseUrl + 'Api/Trip', selectedRow)
          .subscribe(
            (data: any) => {
              console.log(data);
              selectedRow.SaleDeliveryOnTripStatusID = data.SaleDeliveryOnTripStatusID;
              selectedRow.SaleDeliveryOnTripRemarks = data.SaleDeliveryOnTripRemarks;
              selectedRow.SaleDeliveryRejectReasonID = data.SaleDeliveryRejectReasonID;
              selectedRow.status = "Completed";
            },
            (err: any) => {
              console.error(err);
            }
          );

      }
    );

    if (this.uploadImagesList.length > 0) {
      for (let i = this.uploadImagesList.length - 1; i >= 0; i--) {
        const row = this.uploadImagesList[i];
        if (row.status == 'Error') {
          try {
            var response = await this.uploadFileToURL(
              row.file,
              row.fileID
            );
            if (response.type === HttpEventType.Response && response.body) {
              this.uploadImagesList.splice(i, 1);

              // Aquí puedes trabajar con la respuesta
              console.log(response);
            }
          } catch (error) {
            // Aquí manejas el error
            console.error('Error al subir el archivo:', error);

          }
        }
      }
    }

    this.record.TripEvent.forEach(
      (tripEvent: {
        TripEventID: any;
        CreatedOn: any;
        status: string;
      }) => {
        if (tripEvent.status === 'Error') {
          this.http
            .post<any>(this.baseUrl + 'Api/TripEvent', tripEvent, {})
            .subscribe(
              (data: any) => {
                tripEvent.TripEventID = data.TripEventID;
                tripEvent.CreatedOn = data.CreatedOn;
                tripEvent.status = 'Ok';
              },
              (err: any) => {
                console.error(err);
                tripEvent.status = 'Error';
              }
            );
        }
      }
    );
  }


  public newGuid(): string {
    var guid: string;

    guid =
      formatDate(new Date(), 'yyyyMMdd-HHmmssSSS', 'en') +
      '-' +
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1) +
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1) +
      '-' +
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1) +
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);

    return guid;
  }

  getTrip(tripID: any): Observable<any> {
    return this.http.get(this.baseUrl + 'Api/Trip/' + tripID);
  }
  getSaleDeliveryRejectReasonList(): Observable<any> {
    return this.http.get(this.baseUrl + 'Api/SaleDeliveryRejectReason');
  }

  getSaleDeliveryOnTripStatusList(): Observable<any> {
    return this.http.get(this.baseUrl + 'Api/SaleDeliveryOnTripStatus');
  }

  getEventList(): Observable<any> {
    return this.http.get(this.baseUrl + 'Api/Event');
  }

  async SaleDeliveryOnTripStatusChanged(selectedRow: any): Promise<void> {

    await this.http.put(this.baseUrl + 'Api/Trip', selectedRow)
      .subscribe(
        (data: any) => {
          this.toastr.success('Guardado', 'Bien', {
            positionClass: 'toast-top-right',
          });
          this.record.TripSaleDelivery.filter(
            (e: any) => e.SaleDeliveryID == selectedRow.SaleDeliveryID
          )[0].SaleDeliveryOnTripStatusID =
            selectedRow.SaleDeliveryOnTripStatusID;
          this.record.TripSaleDelivery.filter(
            (e: any) => e.SaleDeliveryID == selectedRow.SaleDeliveryID
          )[0].SaleDeliveryOnTripStatusName =
            this.SaleDeliveryOnTripStatusList.find(
              (e: any) =>
                e.SaleDeliveryOnTripStatusID ==
                selectedRow.SaleDeliveryOnTripStatusID
            ).SaleDeliveryOnTripStatusName;
        },
        (err: any) => {
          console.log(err);
          if (this.pendingSelectedRow.length > 0) {
            let found = false;
            let currentSaleDeliveryID = selectedRow.SaleDeliveryID
            selectedRow.status = "Error";
            for (var i = this.pendingSelectedRow.length - 1; i >= 0; i--) {
              if (this.pendingSelectedRow[i].SaleDeliveryID == currentSaleDeliveryID) {
                this.pendingSelectedRow.splice(i, 1);

                this.pendingSelectedRow.push(selectedRow);

                found = true;
                break;
              }
            }
            if (!found) {
              this.pendingSelectedRow.push(selectedRow);
            }
          } else {
            this.pendingSelectedRow.push(selectedRow);
          }
        }
      );



  }

  public async uploadFileToURL(file: any, fileID: string) {
    let uploadURL = this.baseUrl + 'api/File';
    const headers = new HttpHeaders({ 'ngsw-bypass': '' });
    const formData: FormData = new FormData();
    var resizedFile: any = await this.ImageResizeAsync(file);
    formData.append('file', resizedFile, file.name);
    formData.append('fileID', fileID);

    // Usar firstValueFrom para convertir el observable en promesa y esperar el resultado
    return await firstValueFrom(
      this.http.post<any>(uploadURL, formData, {

        reportProgress: true,
        observe: 'events',
        headers: headers,
      }).pipe(filter((event) => event.type === HttpEventType.Response))
    );
  }

  public async takePicture(event: any, SaleDeliveryID: any, SourceID: any, EventID: any): Promise<void> {
    let target: HTMLInputElement = <HTMLInputElement>event.target;
    let files: FileList = target.files;

    var ctx = (<HTMLCanvasElement>(
      document.getElementById('canvaid')
    )).getContext('2d');
    var img = new Image();
    img.src = URL.createObjectURL(target.files[0]);
    var canva = <HTMLCanvasElement>document.getElementById('canvaid');

    await new Promise<void>((resolve) => {
      img.onload = function () {
        var size = 1000;
        const ratio = Math.min(size / img.width, size / img.height);
        canva.width = img.width * ratio;
        canva.height = img.height * ratio;
        ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
        resolve();
      };
    });

    var fileID = this.newGuid();
    var tripEvent: any = {};
    tripEvent.Preview = false;
    tripEvent.FileID = fileID;
    tripEvent.TripID = this.record.TripID;
    tripEvent.SaleDeliveryID = SaleDeliveryID;
    tripEvent.SourceID = SourceID;
    tripEvent.EventID = EventID;

    try {
      var response = await this.uploadFileToURL(files[0], fileID);
      if (response.type === HttpEventType.Response && response.body) {
        tripEvent.Preview = response.body.Preview;
        // Aquí puedes trabajar con la respuesta
        console.log(response);
      }
    } catch (error) {
      this.uploadImagesList.push({
        fileName: files[0].name,
        fileID: fileID,
        file: files[0],
        status: 'Error'

      });
      tripEvent.status = 'Error';
      console.log(this.uploadImagesList);
      // Aquí manejas el error
      console.error('Error al subir el archivo:', error);
    }

    try {
      const posicion = await this.getLocationAsync();
      this.currentPositionUrl = this.getUrl(posicion);
      // this.changeDetectorRef.markForCheck();
      tripEvent.Longitude = posicion.coords.longitude;
      tripEvent.Latitude = posicion.coords.latitude;

      console.log(posicion);
    } catch (error) {
      console.error('Error obteniendo la posición', error);

      alert('Error obteniendo ubicacion' + error);
    }

    this.addTripEvent(tripEvent);
  }

  async setLocation(EventID: string, SaleDeliveryID: string, SourceID: string): Promise<void> {
    if (this.onlineStatus == OnlineStatusType.OFFLINE) {
      this.baseUrl = '';
    }

    if (this.onlineStatus == OnlineStatusType.ONLINE && this.baseUrl == '') {
      this.baseUrl = environment.webAPIUrl;
    }

    var tripEvent: any = {};

    tripEvent.TripID = this.record.TripID;
    //tripEvent.TripID = this.record.TripID
    tripEvent.SaleDeliveryID = SaleDeliveryID;
    tripEvent.SourceID = SourceID;
    tripEvent.EventID = EventID;

    try {
      const posicion = await this.getLocationAsync();
      this.currentPositionUrl = this.getUrl(posicion);
      tripEvent.Longitude = posicion.coords.longitude;
      tripEvent.Latitude = posicion.coords.latitude;

      this.mapVisible = true;
      tripEvent.Preview = false;


      console.log(posicion);
    } catch (error) {
      console.error('Error obteniendo la posición', error);
      tripEvent.status = 'Error';
    }
    this.addTripEvent(tripEvent);

  }


  async ImageResizeAsync(file: any) {
    var size = 1000;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    var bitmap = await createImageBitmap(file);

    const width = bitmap.width;
    const height = bitmap.height;

    const ratio = Math.min(size / width, size / height);
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.drawImage(bitmap, 0, 0, width * ratio, height * ratio);

    return new Promise(function (resolve, reject) {
      canvas.toBlob(
        function (blob: any) {
          blob.name = file.name;
          blob.filename = file.FileName;
          resolve(blob);
        },
        'image/jpeg',
        1
      );
    });
  }

  getUrl(position: any): SafeResourceUrl {
    const longitude = position.coords.longitude;
    const latitude = position.coords.latitude;
    return this.domSanitizer.bypassSecurityTrustResourceUrl(
      `//www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005},${latitude - 0.005
      },${longitude + 0.005},${latitude + 0.005}&marker=${position.coords.latitude
      },${position.coords.longitude}&layer=mapnik`
    );
  }

  async getLocationAsync(): Promise<any> {
    return await firstValueFrom(this.geolocation$.pipe(take(1)));
  }

  public handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return throwError(
        () => new Error('Something bad happened; please try again later.')
      );
    };
  }

  addTripEvent(tripEvent: any): any {
    const headers = new HttpHeaders({ 'ngsw-bypass': '' });

    this.http
      .post<any>(this.baseUrl + 'Api/TripEvent', tripEvent, {})
      .subscribe(
        (data: any) => {
          tripEvent.TripEventID = data.TripEventID;
          tripEvent.CreatedOn = data.CreatedOn;
          this.record.TripEvent.push(tripEvent);
        },
        (err: any) => {
          console.error(err);
          tripEvent.status = 'Error';
          this.record.TripEvent.push(tripEvent);
        }
      );
  }

  filterValueByArray(items: any[], fieldName: string, values: any[]) {
    if (!values || values.length === 0) {
      return items;
    }
    var filtered: any[] = [];
    items.forEach((item) => {
      try {
        if (item[fieldName] === null) {
          if (
            values.some(function (e) {
              return e === null;
            })
          )
            filtered.push(item);
        } else {
          var noNullValue = values.filter(function (e) {
            return e !== null;
          });
          if (
            noNullValue.some(function (e) {
              return e.toString() === item[fieldName].toString();
            })
          )
            filtered.push(item);
        }
      } catch (e) { }
    });

    return filtered;
  }
}
