import {
  Component,
  OnInit,
  Input,
  AfterViewChecked,
  inject,
  ChangeDetectorRef,
  Injectable,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CurrencyPipe,
  DatePipe,
  TitleCasePipe,
  JsonPipe,
  formatDate,
  NgFor,
  NgIf,
  NgStyle,
  PlatformLocation,
  DecimalPipe,
} from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { SafePipe } from './../common';
import { CommonModule } from '@angular/common';

import { GeolocationService } from '@ng-web-apis/geolocation';
import { catchError, Observable, pipe, take, tap, throwError } from 'rxjs';
import { TripService } from '../TripService/trip.service';
import { FilterPipe } from '../pipes/filter.pipe';
import { OrderByPipe } from '../pipes/order-by.pipe';
import {
  OnlineStatusService,
  OnlineStatusType,
} from '../TripService/online-status.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    NgFor,
    NgIf,
    FilterPipe,
    OrderByPipe,
    CommonModule,
  ],
  templateUrl: './Trip.html',
  styleUrl: './trip.component.css',
})
export class TripComponent implements OnInit, AfterViewChecked {
  id: string;
  record: any;
  selectedID: any;
  r: any;
  selectedRow: any;
  url: string = '';
  inputFile: HTMLInputElement | undefined;
  error: GeolocationPositionError | null = null;
  fileID: string | null = null;
  currentPositionUrl: SafeResourceUrl | null = null;
  mapVisible: boolean = false;
  pictureVisible: boolean = false;
  locationEnabled: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public tripService: TripService,
    public router: Router,
    public location: PlatformLocation,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }
  ngAfterViewChecked(): void { }
  viewPosition(r: any): void {
    var position: any = {};
    position = {
      coords: {
        latitude: parseFloat(r.Latitude),
        longitude: parseFloat(r.Longitude),
      },
    };
    this.mapVisible = true;
    this.currentPositionUrl = this.tripService.getUrl(position);
    this.changeDetectorRef.markForCheck();
  }
  closeMap(): void {
    this.mapVisible = false;
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (
      this.tripService.record &&
      this.tripService.record.TripCode == this.id
    ) {
      // this.record = this.tripService.record
    } else {
      this.tripService.getTrip(this.id).subscribe(
        (data) => {
          //this.record = data;
          this.tripService.record = data;
          this.tripService.getEventList().subscribe(
            (data) => {
              this.tripService.eventList = data;
            },
            function (error) {
              alert('error');
            }
          );
        },
        function (error) { }
      );
    }

    if (navigator.geolocation) {
      this.locationEnabled = true;
    } else {
      this.locationEnabled = false;
      alert('Debe tener habilitado el acceso a la ubicación en el navegador');
    }

    // this.tripService.getLocation().subscribe(
    //   (position: GeolocationPosition) => {
    //     this.locationEnabled = true;
    //     console.log(navigator.geolocation);
    //   },
    //   (error: any) => {
    //     alert(
    //       'Error obteniendo ubicacion, porfavor vertifica si esta activada en tu celular y los permisos concedidos en tu navegador' +
    //         error.message
    //     );
    //     this.locationEnabled = false;
    //   }
    // );
  }

  isTripStarted(): boolean {
    if (this.tripService.record == null) {
      return false;
    }
    // if(this.record==null){
    //   return false;
    // }

    //return this.record.TripEvent.filter(function(e:any){return e.EventID=='StartTrip'}).length>0;
    return (
      this.tripService.record.TripEvent.filter(function (e: any) {
        return e.EventID == 'StartTrip';
      }).length > 0
    );
  }

  isTripclosed(): boolean {
    // if(this.record==null){
    //   return false;
    // }
    //return this.record.TripEvent.filter(function(e:any){return e.EventID=='FinishTrip'}).length>0;

    if (this.tripService.record == null) {
      return false;
    }

    return (
      this.tripService.record.TripEvent.filter(function (e: any) {
        return e.EventID == 'FinishTrip';
      }).length > 0
    );
  }

  public async takePicture(event: any) {
    let target: HTMLInputElement = <HTMLInputElement>event.target;
    let files: FileList = target.files;

    var ctx = (<HTMLCanvasElement>(
      document.getElementById('canvaid')
    )).getContext('2d');
    var img = new Image();
    img.src = URL.createObjectURL(target.files[0]);
    var canva = <HTMLCanvasElement>document.getElementById('canvaid');
    //ctx.scale(0.3,0.3);

    // img.onload = function () {
    //   var size = 1000;
    //   const ratio = Math.min(size / img.width, size / img.height);
    //   canva.width = img.width * ratio;
    //   canva.height = img.height * ratio;
    //   ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
    // };
    console.log("Aca");
    await new Promise<void>((resolve) => {
      console.log("Aca2");
      img.onload = function () {
        var size = 1000;
        const ratio = Math.min(size / img.width, size / img.height);
        canva.width = img.width * ratio;
        canva.height = img.height * ratio;
        ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
        resolve();
      };
    });
    var fileID = this.tripService.newGuid();

    try {
      console.log("Aca3");
      var response = await this.tripService.uploadFileToURL(files[0], fileID);
      console.log("Aca4");
      var tripEvent: any = {};
      tripEvent.Preview = false;
      tripEvent.FileID = fileID;
      tripEvent.TripID = this.tripService.record.TripID;
      tripEvent.SaleDeliveryID = null;
      tripEvent.SourceID = null;
      tripEvent.EventID = 'PictureInTrip';
      if (response.type === HttpEventType.Response && response.body) {
        tripEvent.Preview = response.body.Preview;
        // Aquí puedes trabajar con la respuesta
        console.log(response);
      }
    } catch (error) {
      // Aquí manejas el error
      console.error('Error al subir el archivo:', error);
    }

    try {
      const posicion = await this.tripService.getLocationAsync();
      this.currentPositionUrl = this.tripService.getUrl(posicion);
      this.changeDetectorRef.markForCheck();
      tripEvent.Longitude = posicion.coords.longitude;
      tripEvent.Latitude = posicion.coords.latitude;

      console.log(posicion);
    } catch (error) {
      console.error('Error obteniendo la posición', error);

      alert('Error obteniendo ubicacion' + error);
    }

    this.tripService.addTripEvent(tripEvent);
  }
  // this.tripService.getLocation().subscribe(
  //   (position: GeolocationPosition) => {
  //     this.currentPositionUrl = this.tripService.getUrl(position);
  //     this.changeDetectorRef.markForCheck();
  //     tripEvent.Longitude = position.coords.longitude;
  //     tripEvent.Latitude = position.coords.latitude;
  //     this.tripService.addTripEvent(tripEvent);
  //   },
  //   (error: any) => {
  //     this.tripService.addTripEvent(tripEvent);
  //     alert('Error obteniendo ubicacion' + error);
  //   }
  // );

  async setLocation(EventID: string, SaleDeliveryID: string, SourceID: string): Promise<void> {
    if (this.tripService.onlineStatus == OnlineStatusType.OFFLINE) {
      this.tripService.baseUrl = '';
    }

    if (this.tripService.onlineStatus == OnlineStatusType.ONLINE && this.tripService.baseUrl == '') {
      this.tripService.baseUrl = environment.webAPIUrl;
    }


    var tripEvent: any = {};



    tripEvent.TripID = this.tripService.record.TripID;
    //tripEvent.TripID = this.record.TripID
    tripEvent.SaleDeliveryID = SaleDeliveryID;
    tripEvent.SourceID = SourceID;

    try {
      const posicion = await this.tripService.getLocationAsync();
      this.currentPositionUrl = this.tripService.getUrl(posicion);
      this.changeDetectorRef.markForCheck();
      tripEvent.Longitude = posicion.coords.longitude;
      tripEvent.Latitude = posicion.coords.latitude;

      this.mapVisible = true;
      tripEvent.EventID = EventID;
      tripEvent.Preview = false;


      console.log(posicion);
    } catch (error) {
      console.error('Error obteniendo la posición', error);

      alert('Error obteniendo ubicacion' + error);
    }
    this.tripService.addTripEvent(tripEvent);

  }

  viewRecord(r: any): void {
    this.tripService.selectedRow = r;
    if (this.tripService.selectedRow.SaleDeliveryOnTripStatusID == 'Assigned') {
      this.tripService.selectedRow.SaleDeliveryOnTripStatusID = undefined;
      this.tripService.selectedRow.SaleDeliveryRejectReasonID = undefined;
    }

    this.router.navigate([this.location.pathname, r.SaleDeliveryID], {
      relativeTo: this.route,
    });
  }
  backToRecordList() {
    this.tripService.selectedRow = null;
    // this.record = this.tripService.record
  }

  public handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      alert(error);
      return throwError(
        () => new Error('Something bad happened; please try again later.')
      );
    };
  }

  public async uploadFile(event: any, model: any, fieldName: string) {
    alert('Uploading file');
    let target: HTMLInputElement = <HTMLInputElement>event.target;
    let files: FileList = target.files;

    var ctx = (<HTMLCanvasElement>(
      document.getElementById('canvaid')
    )).getContext('2d');
    var img = new Image();
    img.src = URL.createObjectURL(target.files[0]);
    var canva = <HTMLCanvasElement>document.getElementById('canvaid');
    img.onload = function () {
      var size = 1000;
      const ratio = Math.min(size / img.width, size / img.height);
      canva.width = img.width * ratio;
      canva.height = img.height * ratio;
      ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
    };
  }
}
