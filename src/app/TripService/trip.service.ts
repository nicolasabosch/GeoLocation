import { AnimateTimings } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { catchError, Observable, take, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  selectedRow: any;
  record: any = {}
  baseUrl: string = "https://9q08dmvx-5004.brs.devtunnels.ms/";



  constructor(
    public http: HttpClient,
    private readonly domSanitizer: DomSanitizer,
    readonly geolocation$: GeolocationService
  ) { }

  getTrip(tripID: any): Observable<any> {
    return this.http.get(this.baseUrl + "Api/Trip/" + tripID)
  }

  public async uploadFileToURL(file: any) {
    //alert("uploadfileurl")
    let uploadURL = this.baseUrl + "api/File";
    const headers = new HttpHeaders({ 'ngsw-bypass': '' });
    const formData: FormData = new FormData();
    console.log(this.record)

    // formData.append("latitude", this.record.latitude)
    // formData.append("longitude", this.record.longitude)

    var resizedFile: any = await this.ImageResizeAsync(file)
    formData.append('file', resizedFile, file.name);
    return this.http.post<any>(uploadURL, formData,
      {
        reportProgress: true,
        observe: 'events',
        headers: headers
      }).pipe(
        //tap(_ => { /* console.log(this.url + " OK") */ }),
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
        //blob.filename = file.name;
        blob.filename = file.FileName;
        resolve(blob)
      }, 'image/jpeg', 1)
    })
  }


  getUrl(position: GeolocationPosition): SafeResourceUrl {
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

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption


      // Let the app keep running by returning an empty result.
      return throwError(() => new Error('Something bad happened; please try again later.'));
    };
  }

  addTripEvent(tripEvent: any): any {
    const headers = new HttpHeaders({ 'ngsw-bypass': '' });

    this.http.post<any>(this.baseUrl + "Api/TripEvent", tripEvent, {}).subscribe((data: any) => {
      tripEvent.TripEventID = data.TripEventID;
      tripEvent.CreatedOn = data.CreatedOn;
      this.record.TripEvent.push(tripEvent);

      // alert("grabo " + data.TripEventID)

    }, (err: any) => console.log(err));

  }

}

