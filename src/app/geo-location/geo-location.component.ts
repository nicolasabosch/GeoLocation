import { Component, OnInit, Input, AfterViewChecked, inject, ChangeDetectorRef,  } from '@angular/core';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, TitleCasePipe, JsonPipe } from '@angular/common';
import { NgIf } from '@angular/common';
import { SafePipe } from './../common';
import {DomSanitizer} from '@angular/platform-browser';

import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, Observable, take, tap, throwError } from 'rxjs';
@Component({
  selector: 'app-geo-location',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, JsonPipe, NgIf, SafePipe],
  templateUrl: './geo-location.component.html',
  styleUrl: './geo-location.component.css'
})

export class GeoLocationComponent implements AfterViewChecked {
  private readonly sanitizer = inject(DomSanitizer);
  record: any = {};
  Latitud: any;
  Longitud: any;
  url: string = "";
  baseUrl: string = "https://9q08dmvx-5004.brs.devtunnels.ms/";
  inputFile: HTMLInputElement | undefined;
  geolocation: GeolocationService
  constructor(public http: HttpClient, geolocation: GeolocationService, private readonly changeDetectorRef: ChangeDetectorRef,
  ) {

      this.geolocation=geolocation
      geolocation.subscribe(position => this.getLocation(position))
    

  }
  ngAfterViewChecked(): void {
    this.inputFile = <HTMLInputElement>document.getElementById('myFile');
    // this.inputFile.addEventListener('change', this.handleFiles);
    var canva = (<HTMLCanvasElement>document.getElementById('canvaid'));

  }

  getLocation(position: any): void {

    var Latitud = position.coords.latitude
    var Longitud = position.coords.longitude
    
    this.record = position;
    this.record.url = "https://www.openstreetmap.org/export/embed.html?bbox=" + this.record.coords.longitude + "%2C" + this.record.coords.latitude + "&amp;layer=mapnik"

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

  public async uploadFileToURL(file: any) {
    //alert("uploadfileurl")
    let uploadURL = this.baseUrl + "api/File";
    const headers = new HttpHeaders({ 'ngsw-bypass': '' });
    const formData: FormData = new FormData();

    formData.append("latitude", this.record.coords.latitude)
    formData.append("longitude", this.record.coords.longitude)
    
    var resizedFile: any = await this.ImageResizeAsync(file)
    formData.append('file', resizedFile, file.name);
    return this.http.post<any>(uploadURL, formData,
      {
        reportProgress: true,
        observe: 'events',
        headers: headers
      }).pipe(
        //tap(_ => { /* console.log(this.url + " OK") */ }),
        tap((resizedFile: any) => {
        }),
        catchError(this.handleError<any[]>('query', []))
      );

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
        blob.filename = file.name;
        resolve(blob)
      }, 'image/jpeg', 1)
    })
  }

  
  
}






