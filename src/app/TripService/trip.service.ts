import { AnimateTimings } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { catchError, Observable, take, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  selectedRow: any={};
  record: any = {}
  //baseUrl: string = "https://szc3r859-5004.brs.devtunnels.ms/";
  baseUrl: string = environment.webAPIUrl;
  eventList: any = []
  saleDeliveryOnTripStatusList: any=[]
  saleDeliveryRejectReasonList: any=[]


  constructor(
    public http: HttpClient,
    private readonly domSanitizer: DomSanitizer,
    readonly geolocation$: GeolocationService
  ) { }

  getTrip(tripID: any): Observable<any> {
    return this.http.get(this.baseUrl + "Api/Trip/" + tripID)
  }
  getSaleDeliveryRejectReasonList(): Observable<any> {
    return this.http.get(this.baseUrl + "Api/SaleDeliveryRejectReason")
  }

  getSaleDeliveryOnTripStatusList(): Observable<any> {
    return this.http.get(this.baseUrl + "Api/SaleDeliveryOnTripStatus")
  }

  getEventList(): Observable<any> {
    return this.http.get(this.baseUrl + "Api/Event")
  }

  public async uploadFileToURL(file: any) {
    let uploadURL = this.baseUrl + "api/File";
    const headers = new HttpHeaders({ 'ngsw-bypass': '' });
    const formData: FormData = new FormData();

    var resizedFile: any = await this.ImageResizeAsync(file)
    formData.append('file', resizedFile, file.name);
    return this.http.post<any>(uploadURL, formData,
      {
        reportProgress: true,
        observe: 'events',
        headers: headers
      }).pipe(
        tap(event => {



        }
        ))

  }
  async ImageResizeAsync(file: any) {
    var size = 1000

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    var bitmap = await createImageBitmap(file);

    const width = bitmap.width;
    const height = bitmap.height;

    const ratio = Math.min(size / width, size / height)
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.drawImage(bitmap, 0, 0, width * ratio, height * ratio)

    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob: any) {
        blob.name = file.name;
        blob.filename = file.FileName;
        resolve(blob)
      }, 'image/jpeg', 1)
    })
  }


  getUrl(position: any): SafeResourceUrl {
    const longitude = position.coords.longitude;
    const latitude = position.coords.latitude;
    return this.domSanitizer.bypassSecurityTrustResourceUrl(
      `//www.openstreetmap.org/export/embed.html?bbox=${longitude -
      0.005},${latitude - 0.005},${longitude + 0.005},${latitude +
      0.005}&marker=${position.coords.latitude},${position.coords.longitude
      }&layer=mapnik`,
    );
  }

  getLocation(): any {
    return this.geolocation$.pipe(take(1));
  }


  public handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);   
      return throwError(() => new Error('Something bad happened; please try again later.'));
    };
  }

  addTripEvent(tripEvent: any): any {
    const headers = new HttpHeaders({ 'ngsw-bypass': '' });
    
    this.http.post<any>(this.baseUrl + "Api/TripEvent", tripEvent, {}).subscribe((data: any) => {
      console.log(this.record);
      tripEvent.TripEventID = data.TripEventID;
      tripEvent.CreatedOn = data.CreatedOn;
      this.record.TripEvent.push(tripEvent);

    }, (err: any) => console.log(err));

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
      } catch (e) {}
    });

    return filtered;
  }

}

