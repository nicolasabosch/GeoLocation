import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, NgFor, NgIf, PlatformLocation } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { TripService } from '../TripService/trip.service';
import { FilterPipe } from '../pipes/filter.pipe';
import { OrderByPipe } from '../pipes/order-by.pipe';

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

  }

  isTripStarted(): boolean {
    if (this.tripService.record == null) {
      return false;
    }

    return (
      this.tripService.record.TripEvent.filter(function (e: any) {
        return e.EventID == 'StartTrip';
      }).length > 0
    );
  }

  isTripclosed(): boolean {

    if (this.tripService.record == null) {
      return false;
    }

    return (
      this.tripService.record.TripEvent.filter(function (e: any) {
        return e.EventID == 'FinishTrip';
      }).length > 0
    );
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

}
