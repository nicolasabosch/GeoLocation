import { Routes } from '@angular/router';
import {GeoLocationComponent} from './geo-location/geo-location.component'
import GeolocationPage from './ngGeo/geolocation-page.component';
import { TripComponent } from './trip/trip.component';
import { FormsModule } from '@angular/forms';


export const routes: Routes = [

    { path: '', component: GeoLocationComponent },
    {path: ':id', component: TripComponent}


];
