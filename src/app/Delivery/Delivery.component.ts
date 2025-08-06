import { Component, ChangeDetectorRef, AfterContentInit, } from '@angular/core';
import { DatePipe, NgFor, NgIf, PlatformLocation, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication, SafeResourceUrl } from '@angular/platform-browser';
import { TripService } from '../TripService/trip.service';
import { FilterPipe } from '../pipes/filter.pipe';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { filterValueByArrayPipe } from '../pipes/filterValueByArray.pipe';
import { provideToastr, ToastrModule, ToastrService } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from '../app.component';
import { HttpClientModule } from '@angular/common/http';
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
  pendingSelectedRow: any = null;
  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    public tripService: TripService,
    public location: PlatformLocation,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

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
    return (
      this.tripService.record.TripEvent.filter(function (e: any) {
        return e.EventID == 'FinishTrip';
      }).length > 0
    );
  }

  /* SaleDeliveryOnTripStatusChanged(selectedRow: any): void {
    try {
      this.tripService.http.put(this.tripService.baseUrl + 'Api/Trip', selectedRow)
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
    } catch (error) {
      console.error('Error updating delivery status:', error);
      this.pendingSelectedRow = selectedRow;
    }
  } */

  ngAfterContentInit(): void {

  }

  backToRecordList(): void {
    this.tripService.selectedRow = null;
    this.location.back();
  }


}
