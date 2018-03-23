import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { NavController, IonicPage, NavParams, ToastController } from 'ionic-angular';

import 'rxjs/add/operator/filter';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';

/*
  Generated class for the LocationTrackerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationTrackerProvider {
  public watch: any;   
  public lat: number = 0;
  public lng: number = 0;
  messages = [];
  nickname = 'tracking start';
  message = '';
 
  constructor(public http: HttpClient,public backgroundGeolocation:BackgroundGeolocation,public toastCtrl:ToastController,private socket: Socket,public geolocation:Geolocation,public zone:NgZone) {
    console.log('Hello LocationTrackerProvider Provider');
    this.joinChat();
  }
  joinChat() {
    this.socket.connect();
    this.socket.emit('set-nickname', this.nickname);
    //this.navCtrl.push('ChatRoomPage', { nickname: this.nickname });
  }
  startTracking() {
 
    // Background Tracking
   
    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: true,
      interval: 2000
    };
   
    this.backgroundGeolocation.configure(config).subscribe((location) => {
   
      console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
   
      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;
        this.message=this.lat+'_'+this.lng;
        this.sendMessage();
      });
   
    }, (err) => {
   
      console.log(err);
   
    });
   
    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();
   
   
    // Foreground Tracking
   
  let options = {
    frequency: 3000,
    enableHighAccuracy: true
  };
   
  this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
   
    console.log(position);
   
    // Run update inside of Angular's zone
    this.zone.run(() => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
      this.message=this.lat+'_'+this.lng;
        this.sendMessage();
    });
   
  });
   
  }
  stopTracking() {
 
  console.log('stopTracking');
 
  this.backgroundGeolocation.finish();
  this.watch.unsubscribe();
 
}
sendMessage() {
  this.socket.emit('add-message', { text: this.message });
  this.message = '';
}

getMessages() {
  let observable = new Observable(observer => {
    this.socket.on('message', (data) => {
      observer.next(data);
    });
  })
  return observable;
}

getUsers() {
  let observable = new Observable(observer => {
    this.socket.on('users-changed', (data) => {
      observer.next(data);
    });
  });
  return observable;
}

ionViewWillLeave() {
  this.socket.disconnect();
}

showToast(msg) {
  let toast = this.toastCtrl.create({
    message: msg,
    duration: 2000
  });
  toast.present();
}
}
