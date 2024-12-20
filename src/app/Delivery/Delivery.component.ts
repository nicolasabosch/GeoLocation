import { Component, OnInit, Input, AfterViewChecked, inject, ChangeDetectorRef, AfterContentInit, NgModule } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe, TitleCasePipe, JsonPipe, formatDate, NgFor, NgIf, NgStyle, PlatformLocation, CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { SafePipe } from '../common';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { catchError, Observable, take, tap, throwError } from 'rxjs';
import { TripService } from '../TripService/trip.service';
import { FilterPipe } from '../pipes/filter.pipe';
import { OrderByPipe } from '../pipes/order-by.pipe';


@Component({
  selector: 'app-Delivery',
  standalone: true,
  imports: [JsonPipe, FormsModule, DatePipe, NgFor, NgIf, NgStyle, CurrencyPipe, SafePipe, FilterPipe, CommonModule, OrderByPipe],
  templateUrl: './Delivery.html',
  styleUrl: './Delivery.component.css'

})
export class DeliveryComponent implements AfterContentInit {

  selectedRow: any;
  record: any = {}
  currentPositionUrl: SafeResourceUrl | null = null;
  mapVisible: boolean = false;
  pictureVisible: boolean = false;
  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    public tripService: TripService,
    public location: PlatformLocation,

  ) { }

viewPosition(r:any):void{
  
  var position:any= {};
  position = {
    coords: {
      latitude: parseFloat(r.Latitude),
      longitude: parseFloat(r.Longitude)
    }
  }
  console.log(position)
  this.mapVisible = true;
  this.currentPositionUrl = this.tripService.getUrl(position);
  this.changeDetectorRef.markForCheck();
}

  closeMap(): void {
    this.mapVisible = false;
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
          console.log(res)
          console.log(this.record)
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
