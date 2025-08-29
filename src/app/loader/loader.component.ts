// my-loader.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { LoaderService } from './loader.service';

/**
 * Component that displays application loading and progress. Its values are the same as those of LoaderService.
 * It shows a loading gif. And a message.
 */
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
  standalone: true,
})
export class LoaderComponent implements OnInit {
  /**
   * A boolean value indicating whether the application is currently loading. It is updated by the one in LoaderService.
   */
  loading: boolean = false;

  /**
   * A number between 0 and 100 indicating the current progress of the application's loading. It is updated by the one in LoaderService.
   */
  progress: number = 0;

  /**
   * Constructor of LoaderComponent.
   * @param loaderService - The LoaderService to handle loading state.
   */
    constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading.subscribe((v) => {
      this.loading = v;
    });

    this.loaderService.progress.subscribe((p) => {
      this.progress = p;
    });
  }

  /**@ignore*/ngOnInit() {}
}
