//https://www.freakyjolly.com/http-global-loader-progress-bar-using-angular-interceptors/#.Xt7xFzozaMo

import { Injectable } from '@angular/core';
import {
  HttpResponse,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoaderService } from './loader.service';

/**
 * HTTP interceptor that handles loading state while making HTTP requests.
 * It intercepts HTTP requests, adds authorization headers and languageID to the request headers,
 * and keeps track of the loading state using a LoaderService.
 */
@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];


  /**
   * Constructor of LoaderInterceptor.
   * @param loaderService - The LoaderService to handle loading state.

   */
  constructor(private loaderService: LoaderService) {
  }

  /**
   * Removes a request from the requests array.
   * @param req - The HttpRequest to be removed.
   */
  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    this.loaderService.isLoading.next(this.requests.length > 0);
  }

  /**
   * Intercepts and handles HTTP requests.
   * @param req - The HttpRequest to be intercepted.
   * @param next - The HttpHandler to handle the request.
   * @returns - An Observable of the HttpEvent.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.requests.push(req);
    let authReq: HttpRequest<any>;
    authReq = req.clone({
        
        headers: req.headers.set("LanguageID", "ES")
      });
    //if (req.reportProgress) {return next.handle(req);}
    //console.log("No of requests--->" + this.requests.length);

    this.loaderService.isLoading.next(true);
    return Observable.create((observer: {
      next: (event: HttpEvent<any>) => void;
      error: (err: any) => void;
      complete: () => void;
    }) => {
      const subscription = next.handle(authReq || req)
      .subscribe(
        (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.removeRequest(req);
          observer.next(event);
        }
        },
        (err: any) => {
        //alert('error: ' + JSON.stringify(err.error));
        
        if(err.error.status=="409")
        {
          
          alert(err.error.message);

        }
        else
        {
          alert(JSON.stringify(err.error));
        }


        this.removeRequest(req);
        observer.error(err);
        },
        () => {
        this.removeRequest(req);
        observer.complete();
        });
      // remove request from queue when cancelled
      return () => {
      this.removeRequest(req);
      subscription.unsubscribe();
      };
    }) as Observable<HttpEvent<any>>;
  }
}
