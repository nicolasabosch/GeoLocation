import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject, SecurityContext} from '@angular/core';
import type {SafeResourceUrl} from '@angular/platform-browser';
import {DomSanitizer} from '@angular/platform-browser';
import {GeolocationService} from '@ng-web-apis/geolocation';
import {HighlightModule} from 'ngx-highlightjs';


@Component({
    standalone: true,
    selector: 'geolocation-page',
    imports: [CommonModule, HighlightModule,],
    templateUrl: './geolocation-page.component.html',
    styleUrls: ['./geolocation-page.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GeolocationPage {
    private readonly sanitizer = inject(DomSanitizer);

    protected watch = false;

    
    protected readonly geolocation$ = inject(GeolocationService);

    protected getUrl({coords}: GeolocationPosition): SafeResourceUrl {
        const {longitude, latitude} = coords;

        return (
            this.sanitizer.sanitize(
                SecurityContext.RESOURCE_URL,
                `//www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005},${
                    latitude - 0.005
                },${longitude + 0.005},${
                    latitude + 0.005
                }&marker=${latitude},${longitude}&layer=mapnik`,
            ) ?? ''
        );
    }
}
