/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ToastrService } from 'ngx-toastr';
import { LoaderInterceptor } from './app/loader/loader-interceptor.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';





bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));


  export class App {
    constructor(private toastr: ToastrService) {}
  
    
  }
  