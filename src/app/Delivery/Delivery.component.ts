import { Component, OnInit, Input, AfterViewChecked, inject, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe, TitleCasePipe, JsonPipe, formatDate, NgFor, NgIf, NgStyle, PlatformLocation } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { SafePipe } from '../common';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { catchError, Observable, take, tap, throwError } from 'rxjs';
import { TripService } from '../TripService/trip.service';

@Component({
  selector: 'app-Delivery',
  standalone: true,
  imports: [JsonPipe, FormsModule, DatePipe, NgFor, NgIf, NgStyle, CurrencyPipe, SafePipe],
  templateUrl: './Delivery.html',
  styleUrl: './Delivery.component.css'

})
export class DeliveryComponent implements AfterContentInit {

  selectedRow: any;
  record: any = {}


  constructor(private route: ActivatedRoute, public http: HttpClient, readonly geolocation$: GeolocationService, private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly domSanitizer: DomSanitizer, public router: Router, public tripService: TripService, public location: PlatformLocation,



  ) { }

  ngAfterContentInit(): void {
    //this.id = this.route.snapshot.paramMap.get('id');
    this.selectedRow = this.tripService.selectedRow
    this.record = this.tripService.record;
  }

  backToRecordList(): void {
    // var path = this.location.pathname.substr(1);
    // if (path.indexOf('/') > -1) {
    //   path = path.substring(0, path.indexOf('/'));
    // }
    // alert(path)
    // this.router.navigate(['/' + path], { relativeTo: this.route });
    this.location.back();

    
  }
}
