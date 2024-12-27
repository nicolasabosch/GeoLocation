import { Component, OnInit, Input, AfterViewChecked, inject, ChangeDetectorRef, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe, TitleCasePipe, JsonPipe, formatDate, NgFor, NgIf, NgStyle, PlatformLocation, DecimalPipe } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { SafePipe } from './../common';
import { CommonModule } from '@angular/common'

import { GeolocationService } from '@ng-web-apis/geolocation';
import { catchError, Observable, pipe, take, tap, throwError } from 'rxjs';
import { TripService } from '../TripService/trip.service';
import { FilterPipe } from "../pipes/filter.pipe";
import { OrderByPipe } from "../pipes/order-by.pipe";

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [JsonPipe, FormsModule, DatePipe, NgFor, NgIf, NgStyle, CurrencyPipe, SafePipe, FilterPipe, OrderByPipe, DecimalPipe, CommonModule],
  templateUrl: './Trip-crud.html',
  styleUrl: './trip.component.css'

})
export class TripComponent implements OnInit, AfterViewChecked {
  id: string
  record: any = {}
  selectedID: any;
  r: any;
  selectedRow: any;
  url: string = "";
  inputFile: HTMLInputElement | undefined;
  error: GeolocationPositionError | null = null;
  fileID: string | null = null;
  currentPositionUrl: SafeResourceUrl | null = null;
  mapVisible: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public tripService: TripService,
    public router: Router,
    public location: PlatformLocation,
    private readonly changeDetectorRef: ChangeDetectorRef

  ) {

  }
  ngAfterViewChecked(): void {
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

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.tripService.record && this.tripService.record.TripID == this.id) {
      this.record = this.tripService.record
    }
    else {

      this.tripService.getTrip(this.id)
        .subscribe(data => {
          this.record = data;
          this.tripService.getEventList().subscribe(data => { this.tripService.eventList = data }, function (error) {
            alert("error");
          })
        }, function (error) {

        })
    }
  }

isTripStarted():boolean{

  return this.record.TripEvent.filter(function(e:any){return e.EventID=='StartTrip'}).length>0;
}


  setLocation(EventID: string, SaleDeliveryID:string, SourceID: string): void {
    var tripEvent: any = {};

    tripEvent.TripID = this.record.TripID
    tripEvent.SaleDeliveryID = SaleDeliveryID
    tripEvent.SourceID = SourceID
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

  viewRecord(r: any): void {
    this.tripService.selectedRow = r
    this.tripService.record = this.record
    this.router.navigate([this.location.pathname, r.SaleDeliveryID], {
      relativeTo: this.route,
    });


  }
  backToRecordList() {
    this.tripService.selectedRow = null
    this.record = this.tripService.record
  }

  public handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      alert((error));
      return throwError(() => new Error('Something bad happened; please try again later.'));
    };
  }

  public async uploadFile(event: any, model: any, fieldName: string) {

    let target: HTMLInputElement = <HTMLInputElement>event.target;
    let files: FileList = target.files;

    var ctx = (<HTMLCanvasElement>document.getElementById('canvaid')).getContext('2d');
    var img = new Image;
    img.src = URL.createObjectURL(target.files[0]);
    var canva = (<HTMLCanvasElement>document.getElementById('canvaid'));
    img.onload = function () {
      var size = 1000
      const ratio = Math.min(size / img.width, size / img.height)
      canva.width = img.width * ratio
      canva.height = img.height * ratio
      ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
    };


  }
}