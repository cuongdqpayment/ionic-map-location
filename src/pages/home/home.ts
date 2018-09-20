import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

declare var google;
let latLng;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;

  constructor(public navCtrl: NavController,
              public loadingCtrl: LoadingController) {

  }

  ionViewDidLoad() {
    this.resetMap();
  }
  resetMap() {
    // this.nav.setRoot(HomePage);
    this.loadMap();
    //reset cac bien khac
  }
  loadMap() {
    let loading = this.loadingCtrl.create({
      content: 'Loading Map...'
    });
    loading.present();

    latLng = new google.maps.LatLng(16.0584808, 108.2069579);
    let myStyles = [{
      featureType: "poi",
      elementType: "labels",
      stylers: [{
        visibility: "off"
      }]
    }, {
      featureType: "transit",
      elementType: "labels",
      stylers: [{
        visibility: "off"
      }]
    }];
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      styles: myStyles
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    loading.dismiss();
  }
}
