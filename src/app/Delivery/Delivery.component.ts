import {
  Component,
  OnInit,
  Input,
  AfterViewChecked,
  inject,
  ChangeDetectorRef,
  AfterContentInit,
  NgModule,
} from '@angular/core';
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
  CommonModule,
} from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import {
  bootstrapApplication,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { TripService } from '../TripService/trip.service';
import { FilterPipe } from '../pipes/filter.pipe';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { filterValueByArrayPipe } from '../pipes/filterValueByArray.pipe';
import { provideToastr, ToastrModule, ToastrService } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from '../app.component';
import { HttpClientModule, HttpEventType } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
    importProvidersFrom(HttpClientModule), // <-- Add this line
  ],
});

@Component({
  selector: 'app-Delivery',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    NgFor,
    NgIf,
    FilterPipe,
    CommonModule,
    OrderByPipe,
    filterValueByArrayPipe,
    ToastrModule,
  ],
  templateUrl: './Delivery.html',
  styleUrl: './Delivery.component.css',
})
export class DeliveryComponent implements AfterContentInit {
  // selectedRow: any={};
  // record: any = {}
  currentPositionUrl: SafeResourceUrl | null = null;
  mapVisible: boolean = false;
  pictureVisible: boolean = false;
  search: any = {};
  eventList: any = [];
  SaleDeliveryOnTripStatusList: any = [];
  SaleDeliveryRejectReasonList: any = [];
  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    public tripService: TripService,
    public location: PlatformLocation,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.tripService.getSaleDeliveryOnTripStatusList().subscribe((data) => {
      this.SaleDeliveryOnTripStatusList = data;
    });

    this.tripService.getSaleDeliveryRejectReasonList().subscribe((data) => {
      this.SaleDeliveryRejectReasonList = data;
    });

    this.tripService.getEventList().subscribe((data) => {
      this.eventList = data;
    });
  }

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

  isTripStarted(): boolean {
    if (this.tripService.record == null) {
      return false;
    }

    // console.log(this.record.TripEvent.filter(function(e:any){return e.EventID=='StartTrip'}).length > 0);
    // console.log("Opened")
    return (
      this.tripService.record.TripEvent.filter(function (e: any) {
        return e.EventID == 'StartTrip';
      }).length > 0
    );
  }

  isDeliveryInDestination(): boolean {
    if (this.tripService.record == null) {
      return false;
    }
    return (
      this.tripService.record.TripEvent.filter((e: any) => {
        return (
          e.EventID == 'ArrivedToDestination' &&
          e.SaleDeliveryID == this.tripService.selectedRow.SaleDeliveryID
        );
      }).length > 0
    );
  }

  isNotDeliveryInDestination(): boolean {
    if (this.tripService.record == null) {
      return false;
    }
    return (
      this.tripService.record.TripEvent.filter((e: any) => {
        return (
          e.EventID == 'LeftFromDestination' &&
          e.SaleDeliveryID == this.tripService.selectedRow.SaleDeliveryID
        );
      }).length > 0
    );
  }

  isTripclosed(): boolean {
    if (this.tripService.record == null) {
      return false;
    }

    // console.log(this.record.TripEvent.filter(function(e:any){return e.EventID=='FinishTrip'}).length>0);
    // console.log("Closed")
    return (
      this.tripService.record.TripEvent.filter(function (e: any) {
        return e.EventID == 'FinishTrip';
      }).length > 0
    );
  }

  SaleDeliveryOnTripStatusChanged(selectedRow: any): void {
    this.tripService.http
      .put(this.tripService.baseUrl + 'Api/Trip', selectedRow)
      .subscribe(
        (data: any) => {
          this.toastr.success('Guardado', 'Bien', {
            positionClass: 'toast-top-right',
          });
          this.tripService.record.TripSaleDelivery.filter(
            (e: any) => e.SaleDeliveryID == selectedRow.SaleDeliveryID
          )[0].SaleDeliveryOnTripStatusID =
            selectedRow.SaleDeliveryOnTripStatusID;
          this.tripService.record.TripSaleDelivery.filter(
            (e: any) => e.SaleDeliveryID == selectedRow.SaleDeliveryID
          )[0].SaleDeliveryOnTripStatusName =
            this.SaleDeliveryOnTripStatusList.find(
              (e: any) =>
                e.SaleDeliveryOnTripStatusID ==
                selectedRow.SaleDeliveryOnTripStatusID
            ).SaleDeliveryOnTripStatusName;
        },
        (err: any) => console.log(err)
      );
  }

  async setLocation(EventID: string, SaleDeliveryID: string, SourceID: string): Promise<void> {
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

  ngAfterContentInit(): void {
    // this.selectedRow = this.tripService.selectedRow
    // this.record = this.tripService.record;
  }

  backToRecordList(): void {
    this.tripService.selectedRow = null;
    this.location.back();
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

    var fileID = this.tripService.newGuid();

    try {
      var response = await this.tripService.uploadFileToURL(files[0], fileID);
      if (response.type === HttpEventType.Response && response.body) {
        tripEvent.Preview = response.body.Preview;
        // Aquí puedes trabajar con la respuesta
        console.log(response);
      }
    } catch (error) {
      // Aquí manejas el error
      console.error('Error al subir el archivo:', error);
    }
    var tripEvent: any = {};
    tripEvent.Preview = false;
    tripEvent.FileID = fileID;
    tripEvent.TripID = this.tripService.record.TripID;
    tripEvent.SaleDeliveryID = null;
    tripEvent.SourceID = null;
    tripEvent.EventID = 'PictureInDestination';

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
}
