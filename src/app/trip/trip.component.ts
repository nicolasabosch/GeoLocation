import { Component, OnInit, Input, AfterViewChecked, inject, ChangeDetectorRef, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe, TitleCasePipe, JsonPipe, formatDate, NgFor, NgIf, NgStyle, PlatformLocation } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { SafePipe } from './../common';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { catchError, Observable, take, tap, throwError } from 'rxjs';
import { TripService } from '../TripService/trip.service';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [JsonPipe, FormsModule, DatePipe, NgFor, NgIf, NgStyle, CurrencyPipe, SafePipe],
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

  constructor(
    private route: ActivatedRoute,
    public tripService: TripService,
    public router: Router,
    public location: PlatformLocation

  ) {

  }
  ngAfterViewChecked(): void {
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    // console.log(this.id);
    if (this.tripService.record && this.tripService.record.TripID==this.id) {
      this.record = this.tripService.record
    }
    else{
    
    this.tripService.getTrip(this.id)
      .subscribe(data => { this.record = data }, function (error) {
        console.log(error);
        alert("error");
      })
    }
  }

  viewRecord(r: any): void {
    //this.selectedRow=r
    this.tripService.selectedRow = r
    this.tripService.record = this.record
    console.log(r)
    this.router.navigate([this.location.pathname, r.SaleDeliveryID], {
      relativeTo: this.route,
    });


  }
  backToRecordList() {
    //this.selectedRow=null
    this.tripService.selectedRow = null
    this.record = this.tripService.record
  }

  public handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      alert((error)); // log to console instead
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
    //ctx.scale(0.3,0.3);
    img.onload = function () {
      var size = 1000
      const ratio = Math.min(size / img.width, size / img.height)
      canva.width = img.width * ratio
      canva.height = img.height * ratio
      ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
    };


  }
}