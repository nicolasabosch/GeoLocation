import { Component, OnInit, Input, AfterViewChecked, inject, ChangeDetectorRef, AfterContentInit, NgModule } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe, TitleCasePipe, JsonPipe, formatDate, NgFor, NgIf, NgStyle, PlatformLocation, CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { bootstrapApplication, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { SafePipe } from '../common';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { catchError, Observable, sequenceEqual, take, tap, throwError } from 'rxjs';
import { TripService } from '../TripService/trip.service';
import { FilterPipe } from '../pipes/filter.pipe';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { filterValueByArrayPipe } from "../pipes/filterValueByArray.pipe";
import { provideToastr, ToastrModule, ToastrService } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from '../app.component';


bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
  ]
});

@Component({
  selector: 'app-Delivery',
  standalone: true,
  imports: [JsonPipe, FormsModule, DatePipe, NgFor, NgIf, NgStyle, CurrencyPipe, SafePipe, FilterPipe, CommonModule, OrderByPipe, filterValueByArrayPipe, ToastrModule],
  templateUrl: './Delivery.html',
  styleUrl: './Delivery.component.css'
})

export class DeliveryComponent implements AfterContentInit {

  selectedRow: any={};
  record: any = {}
  currentPositionUrl: SafeResourceUrl | null = null;
  mapVisible: boolean = false;
  pictureVisible: boolean = false;
  search: any = {};
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
    this.tripService.getSaleDeliveryOnTripStatusList()
      .subscribe(data => {
        this.SaleDeliveryOnTripStatusList = data;
      });

      this.tripService.getSaleDeliveryRejectReasonList()
      .subscribe(data => {
        this.SaleDeliveryRejectReasonList = data;
      });
  }

  viewPosition(r: any): void {

    var position: any = {};
    position = {
      coords: {
        latitude: parseFloat(r.Latitude),
        longitude: parseFloat(r.Longitude)
      }
    }
    this.mapVisible = true;
    this.currentPositionUrl = this.tripService.getUrl(position);
    this.changeDetectorRef.markForCheck();
  }

  closeMap(): void {
    this.mapVisible = false;
  }

  isTripStarted():boolean{

    if(this.record==null){
      return false;
    }
  
    // console.log(this.record.TripEvent.filter(function(e:any){return e.EventID=='StartTrip'}).length > 0);
    // console.log("Opened")
    return this.record.TripEvent.filter(function(e:any){return e.EventID=='StartTrip'}).length>0;
  }


  isDeliveryInDestination():boolean{

  if(this.record==null){
    return false;
  }
  return this.record.TripEvent.filter(function(e:any){return e.EventID=='ArrivedToDestination'}).length>0;
}

isNotDeliveryInDestination():boolean{

  if(this.record==null){
    return false;
  }
  return this.record.TripEvent.filter(function(e:any){return e.EventID=='LeftFromDestination'}).length>0;
}

  
  isTripclosed():boolean{
    if(this.record==null){
      return false;
    }
  
    console.log(this.record.TripEvent.filter(function(e:any){return e.EventID=='FinishTrip'}).length>0);
    console.log("Closed")
    return this.record.TripEvent.filter(function(e:any){return e.EventID=='FinishTrip'}).length>0;
  
  }

  SaleDeliveryOnTripStatusChanged(selectedRow:any):void{

    this.tripService.http.put(this.tripService.baseUrl + "Api/Trip", selectedRow).subscribe((data: any) => {
      this.toastr.success('Guardado', 'Bien', {
        positionClass: 'toast-top-right',
      });


    }, (err: any) => console.log(err));
    
  }


  setLocation(EventID: string): void {
    var tripEvent: any = {};

    tripEvent.TripID = this.selectedRow.TripID
    tripEvent.SaleDeliveryID = this.selectedRow.SaleDeliveryID
    tripEvent.SourceID = this.selectedRow.SourceID
    this.tripService.getLocation().subscribe((position: GeolocationPosition) => {
      this.mapVisible = true;

      this.currentPositionUrl = this.tripService.getUrl(position);
      this.changeDetectorRef.markForCheck();


      tripEvent.Longitude = position.coords.longitude;
      tripEvent.Latitude = position.coords.latitude;
      tripEvent.EventID = EventID;
      tripEvent.Preview = false;

      this.tripService.addTripEvent(tripEvent)


    }, (error: any) => {
      alert('Error getting location' + error);
      tripEvent.EventID = "FailedToGetLocation";
      this.tripService.addTripEvent(tripEvent)
    }
    )
  }

  ngAfterContentInit(): void {

    this.selectedRow = this.tripService.selectedRow
    this.record = this.tripService.record;

  }

  backToRecordList(): void {
    this.location.back();
  }

  public async takePicture(event: any, model: any, fieldName: string) {

    let target: HTMLInputElement = <HTMLInputElement>event.target;
    let files: FileList = target.files;

    var ctx = (<HTMLCanvasElement>document.getElementById('canvaid')).getContext('2d');
    var img = new Image;
    img.src = URL.createObjectURL(target.files[0]);
    var canva = (<HTMLCanvasElement>document.getElementById('canvaid'));
    //ctx.scale(0.3,0.3);


    img.onload = function () {
      var size = 1000
      const ratio = Math.min(size / img.width, size / img.height)
      canva.width = img.width * ratio
      canva.height = img.height * ratio
      ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
    };

    (await this.tripService.uploadFileToURL(files[0])).subscribe(
      (res: any) => {
        if (res.body) {

          var tripEvent: any = {};
          tripEvent.Preview = res.body.Preview
          tripEvent.FileID = res.body.FileID
          tripEvent.TripID = this.selectedRow.TripID
          tripEvent.SaleDeliveryID = this.selectedRow.SaleDeliveryID
          tripEvent.SourceID = this.selectedRow.SourceID
          tripEvent.EventID = "PictureInDestination"

          this.tripService.getLocation().subscribe((position: GeolocationPosition) => {
            this.currentPositionUrl = this.tripService.getUrl(position);
            this.changeDetectorRef.markForCheck();
            tripEvent.Longitude = position.coords.longitude;
            tripEvent.Latitude = position.coords.latitude;
            this.tripService.addTripEvent(tripEvent);
          }, (error: any) => {
            this.tripService.addTripEvent(tripEvent);
            alert('Error getting location' + error)
          });

        }

      },
      (err: any) => alert(err)
    );



  }



}
