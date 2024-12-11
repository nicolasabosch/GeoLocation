import { Component, OnInit, Input, AfterViewChecked, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe, DatePipe, TitleCasePipe, JsonPipe, formatDate, NgFor, NgIf, NgStyle } from '@angular/common';
import { FormsModule, NgModel} from '@angular/forms';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { SafePipe } from './../common';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { catchError, Observable, take, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [JsonPipe, FormsModule, DatePipe, NgFor, NgIf, NgStyle, CurrencyPipe, SafePipe],
  templateUrl: './Trip-crud.html',
  styleUrl: './trip.component.css'

})
export class TripComponent implements OnInit, AfterViewChecked {
  id: string
  baseUrl: string = "https://9q08dmvx-5004.brs.devtunnels.ms/";
  record: any={}
  selectedID: any;
  r:any;
  selectedRow:any;
  Latitud: any;
  Longitud: any;
  url: string = "";
  inputFile: HTMLInputElement | undefined;
  geolocation: GeolocationService;
  currentPositionUrl: SafeResourceUrl | null = null;
  error: GeolocationPositionError | null = null;
  fileID: string | null = null;

  constructor(private route: ActivatedRoute, public http: HttpClient, readonly geolocation$: GeolocationService,  private readonly changeDetectorRef: ChangeDetectorRef, private readonly domSanitizer: DomSanitizer,
  ) { 

    //this.geolocation=geolocation
    //geolocation.subscribe(position => this.getLocation(position))
  }
  ngAfterViewChecked(): void {
    }

  private getUrl(position: GeolocationPosition): SafeResourceUrl {
    const longitude = position.coords.longitude;
    const latitude = position.coords.latitude;

    return this.domSanitizer.bypassSecurityTrustResourceUrl(
        `//www.openstreetmap.org/export/embed.html?bbox=${longitude -
            0.005},${latitude - 0.005},${longitude + 0.005},${latitude +
            0.005}&marker=${position.coords.latitude},${
            position.coords.longitude
        }&layer=mapnik`,
    );
}

  viewLocation(): void {
    
    this.geolocation$.pipe(take(1)).subscribe(
        position => {
          console.log(position)
            this.currentPositionUrl = this.getUrl(position);
            this.changeDetectorRef.markForCheck();
            this.record.longitude = position.coords.longitude;
            this.record.latitude = position.coords.latitude;
            
            
        },
        error => {
            this.error = error;
            this.changeDetectorRef.markForCheck();
        },
    );
}


  getLocation(position: any): void {
    //this.geolocation=geolocation
    //geolocation.subscribe(position => this.getLocation(position))
    //console.log(position)
    var Latitud = position.coords.latitude
    var Longitud = position.coords.longitude
    //console.log(Longitud)
    //console.log(Latitud)
    this.record = position;
    this.record.url = "https://www.openstreetmap.org/export/embed.html?bbox=" + this.record.coords.longitude + "%2C" + this.record.coords.latitude + "&amp;layer=mapnik"
    

  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    console.log(this.id);
    this.http.get(this.baseUrl + "Api/Trip/" + this.id)
      .subscribe(data => { this.record = data }, function (a) {
        console.log(a);
        alert("error");
      })
    
  }

  viewRecord(r:any): void {
    this.selectedRow=r
    

  }
  backToRecordList() {
    this.selectedRow=null
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
    

    (await this.uploadFileToURL(files[0])).subscribe(
      (res: any) => {
        if (res.body) {
          res.body['Preview' + fieldName] = res.body.Preview;

          model[fieldName] = res.body.FileID;
          model.FileName = res.body.FileName;
          model['Preview' + fieldName] = res.body.Preview;
        }
        
      },
      (err: any) => console.log(err)
    );
  }

  
  public async uploadTripFile(){
    let uploadURL = this.baseUrl + "api/TripFile";
    const headers = new HttpHeaders({ 'ngsw-bypass': '' });
    const formData: FormData = new FormData();
    formData.append("TripID", this.selectedRow.TripID)
    formData.append("FileID", this.fileID)
    formData.append("SaleDeliveryID", this.selectedRow.SaleDeliveryID)
    formData.append("SourceID",this.selectedRow.SourceID)
    //const selectedData=this.http.get(this.baseUrl + "api/File")
    //formData.append("FileID",this.record.)
    const tripUpload= this.http.post<any>(uploadURL, formData,
      {
        reportProgress: true,
        observe: 'events',
        headers: headers
      })
      tripUpload.subscribe()
    return tripUpload

  }
  
  public async uploadFileToURL(file: any) {
    //alert("uploadfileurl")
    let uploadURL = this.baseUrl + "api/File";
    const headers = new HttpHeaders({ 'ngsw-bypass': '' });
    const formData: FormData = new FormData();
    console.log(this.record)

    formData.append("latitude", this.record.latitude)
    formData.append("longitude", this.record.longitude)
    
    var resizedFile: any = await this.ImageResizeAsync(file)
    formData.append('file', resizedFile, file.name);
    console.log("a")
    return this.http.post<any>(uploadURL, formData,
      {
        reportProgress: true,
        observe: 'events',
        headers: headers
      }).pipe(
        //tap(_ => { /* console.log(this.url + " OK") */ }),
        tap(event => {
          this.uploadTripFile()
       
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
}
