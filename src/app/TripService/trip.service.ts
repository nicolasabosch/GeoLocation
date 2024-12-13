import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  selectedRow:any;
  record:any={}
  
  constructor() { }

}
