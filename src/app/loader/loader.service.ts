import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * A service to manage the application loading and progress.
 */
@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  /** A boolean value indicating whether the application is currently loading. */
  public isLoading = new BehaviorSubject(false);
    /** A number between 0 and 100 indicating the current progress of the application's loading. */
  public progress = new BehaviorSubject(0);
  /** @ignore */
  constructor() { }
}
