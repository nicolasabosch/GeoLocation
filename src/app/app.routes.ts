import { Routes } from '@angular/router';
import { TripComponent } from './trip/trip.component';
import { FormsModule } from '@angular/forms';
import { DeliveryComponent } from './Delivery/Delivery.component';


export const routes: Routes = [

    {path: ':id', component: TripComponent},
    {path: ':id/:SaleDeliveryID', component: DeliveryComponent}

];



