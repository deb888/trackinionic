import { Component } from '@angular/core';
import { NavController,Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController,private geolocation: Geolocation,public pt:Platform,public locationTracker: LocationTrackerProvider) {

  }
ionViewDidLoad(){
  this.pt.ready().then((res)=>{
    let watch = this.geolocation.watchPosition();
watch.subscribe((data) => {
 // data can be a set of coordinates, or an error (if an error occurred).
 // data.coords.latitude
 console.log(data)
 // data.coords.longitude
});

  },(err)=>{

  })
  
}
start(){
  this.locationTracker.startTracking();
}

stop(){
  this.locationTracker.stopTracking();
}


}
