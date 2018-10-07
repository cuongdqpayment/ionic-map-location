import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController, Searchbar, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Subscription } from 'rxjs/Subscription';
import { Location } from '../../models/location';
import { TimerSchedule } from '../../utils/cng-utils';

import { ApiService } from '../../services/map.service';


declare var google;
let latLng;
let infoWindow;
//let curMarker;
let curCircle;
let curCircleIcon;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('searchBar') searchBar: Searchbar;

  map: any;
  locTracking: Subscription;
  loc: Location = new Location();
  locOld: Location = new Location();
  timer: TimerSchedule = new TimerSchedule();
  isMapOk: boolean = false;
  isLocOK: boolean = false;
  isShowSearch: boolean = false;
  searchString: string = '';
  countTimer: number = 0;
  isShowRoute: boolean = false;
  searchOrigin:string='';
  searchDestination:string='';


  constructor(public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private gLoc: Geolocation,
    private apiService: ApiService) { }

  //khi component nay khoi tao xong  
  ngOnInit() {
    //khoi tao bo dinh thoi gian chay
    this.timer.interval = 15000;
    this.timer.fRun = () => {
      this.runTimer();
    };
    this.timer.startTimer();

    //kiem tra dich vu chay khong
    /* this.apiService.getWeatherApi(1905468)
    .then(apiJson=>console.log(JSON.stringify(apiJson)))
    .catch(err=>console.log(JSON.stringify(err)))
     */

    /* this.apiService.getAddressFromlatlng('16.0651894,108.2009439')
    .then(address=>console.log('Địa chỉ tìm thấy: '+address))
    .catch(err=>console.log("Loi nay: "+JSON.stringify(err))) */

  }

  runTimer() {
    if (this.isLocOK) {
      //neu no da chay vi tri ok thi dung lai
      //lay thoi gian toa do kiem tra neu tre qua thi gan 
      let timePass = this.loc.timestamp - this.locOld.timestamp;

      if (this.locOld.timestamp > 0 && timePass <= 0) {
        //qua thoi gian lay vi tri thiet bi
        console.log('vi tri qua cu: ' + this.loc.timestamp + ' ms');
        this.isLocOK = false;
      } else {
        //thoi gian dam bao, truyen du lieu ve va gan thoi gian
        console.log('gui du lieu vi tri: ' + timePass + ' ms');
        this.locOld.timestamp = this.loc.timestamp;
      }

    } else if (this.isMapOk) {
      //neu vi tri chua co thi cho ban do load xong
      this.getLocation();
      console.log('call: ' + this.countTimer++);
    }

  }

  //khi trang home đã đang load các div
  ionViewDidLoad() {
    this.resetMap();
  }

  //các hàm con
  resetMap() {
    //reset cac thanh phan tren ban do

    //lay vi tri hien tai cua nguoi dung


    // this.nav.setRoot(HomePage);
    this.loadMap();
    //reset cac bien khac
  }

  //load bảng đồ google map như web đã làm
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
      styles: myStyles/* ,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        mapTypeIds: ['roadmap', 'terrain', 'hybrid', 'satellite']
      } */
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    infoWindow = new google.maps.InfoWindow({ map: this.map, content: "..." });

    /* let mIcon = new google.maps.MarkerImage(
      'assets/imgs/blue-dot.png',
      null, / * size is determined at runtime * /
      null, / * origin is 0,0 * /
      null, / * anchor is bottom center of the scaled image * /
      new google.maps.Size(14, 14)
    ); */

    curCircleIcon = new google.maps.Circle({
      strokeColor: '#ff0000',
      strokeOpacity: 3,
      strokeWeight: 5,
      fillColor: '#296ce8',
      fillOpacity: 1,
      map: this.map,
      center: latLng,
      radius: 20
    });

    //danh dau vi tri hien tai
    /* curMarker = new google.maps.Marker({
      map: this.map,
      icon: mIcon,
      position: latLng
    }); */

    //danh dau vung hien tai sai so
    curCircle = new google.maps.Circle({
      strokeColor: '#caeaf9',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#caeaf9',
      fillOpacity: 0.35,
      map: this.map,
      center: latLng,
      radius: 50
    });

    this.isMapOk = true;

    //lay vi tri tracking
    this.getLocation();

    loading.dismiss();
  }

  //lấy vị trí hiện tại và theo dõi vị trí nếu có thay đổi
  getLocation() {
    //console.log("Lay toa do:");

    //stop tracking
    this.stopTracking();

    //lay toa do hien tai xem
    this.gLoc.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 7000
    }).then((pos) => {
      //console.log('Toa do lay duoc la: ' + resp.coords.latitude + ',' + resp.coords.longitude);
      //console.log(pos);
      this.loc.timestamp = pos.timestamp;
      if (pos.coords != null) {
        this.loc.lat = pos.coords.latitude;
        this.loc.lon = pos.coords.longitude;
        this.loc.speed = pos.coords.speed;
        this.loc.accuracy = pos.coords.accuracy;
        this.loc.altitude = pos.coords.altitude;
        this.loc.altitudeAccuracy = pos.coords.altitudeAccuracy;
        this.loc.heading = pos.coords.heading;
        this.isLocOK = true;
      }
    }).catch((err) => {
      this.isLocOK = false;
      console.log(err);
      //alert("Error code: " + err.code + " - " + err.message);
      const toast = this.toastCtrl.create({
        message: "Error code: " + err.code + " - " + err.message,
        duration: 5000,
        position: 'top'
      });
      toast.present();
    });


    //start tracking
    this.getTracking();

  }
  //Theo dõi thay đổi vị trí
  getTracking() {
    this.locTracking = this.gLoc.watchPosition({
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 3000
    })
      .subscribe((pos) => {
        //Vị trí thiết bị có sự thay đổi, pos là vị trí mới
        this.loc.timestamp = pos.timestamp;
        if (pos.coords != null) {
          this.loc.lat = pos.coords.latitude;
          this.loc.lon = pos.coords.longitude;
          this.loc.speed = pos.coords.speed;
          this.loc.accuracy = pos.coords.accuracy;
          this.loc.altitude = pos.coords.altitude;
          this.loc.altitudeAccuracy = pos.coords.altitudeAccuracy;
          this.loc.heading = pos.coords.heading;
          //sau khi co toa do moi thi ve vi tri tren bang do
          if (this.isMapOk) {
            this.showLocation();
          }
        }
      },
        err => {
          this.isLocOK = false;
          console.log(err)
          //alert("Loi: " + err.code + " - " + err.message)
          const toast = this.toastCtrl.create({
            message: "Loi subsriber: " + err.code + " - " + err.message,
            duration: 5000
          });
          toast.present();
        }
      )
  }

  stopTracking() {
    if (this.locTracking != null) this.locTracking.unsubscribe();
  }

  //chi ban do ve vi tri da lay duoc
  showLocation() {

    let loclatLng = { lat: this.loc.lat, lng: this.loc.lon };

    //curMarker.setPosition(loclatLng);
    curCircleIcon.setCenter(loclatLng);
    curCircle.setCenter(loclatLng);
    curCircle.setRadius(this.loc.accuracy);

    var infoWindowHTML = "Latitude: " + this.loc.lat
      + "<br>Longitude: " + this.loc.lon
      + "<br>timestamp: " + this.loc.timestamp
      + "<br>accuracy: " + this.loc.accuracy
      + "<br>speed: " + this.loc.speed
      ;

    infoWindow.setContent(infoWindowHTML);
    infoWindow.setPosition(loclatLng);

    //dua trung tam ban do ve vi tri tracking
    latLng = new google.maps.LatLng(this.loc.lat, this.loc.lon);
    this.map.setCenter(latLng);
  }

  //mo cua so tim kiem
  showSearchbar() {
    this.isShowSearch = !this.isShowSearch;
    if (this.isShowSearch) this.isShowRoute=false 
  }

  //thao tac tim kiem
  searchSelect(val) {this.searchString = val.target.value;}

  searchEnter() {
    //lay chuoi searchString alert ra
    //console.log(this.searchString);
    //xoa value cua search dong cua so search lai
    //ghi vao lich su tim kiem
    //thuc hien tim kiem 
    this.apiService.getlatlngFromAddress(this.searchString)
      .then(apiJson => {
        //console.log(JSON.stringify(apiJson))
        this.toastCtrl.create({
          message: "Toa do tim thay la: " + apiJson,
          duration: 5000,
          position: 'middle'
        }).present();
      }
      )
      .catch(err => {
        console.log(JSON.stringify(err))
        this.toastCtrl.create({
          message: "Err: " + JSON.stringify(err),
          duration: 5000,
          position: 'bottom'
        }).present();
      })

    this.searchBar.clearInput(null);
    this.searchString = '';
    //thuc hien tim kiem 

    //dong cua so tim kiem lai
    //this.showSearchbar();
    this.isShowSearch = false;
  }

  //tim kiem route
  showRoutebar() {
    this.isShowRoute = !this.isShowRoute;
    if (this.isShowRoute) this.isShowSearch=false 
  }

  searchSelectOrigin(val) {this.searchOrigin = val.target.value;}
  searchSelectDestination(val) {this.searchDestination = val.target.value;}

  searchEnterOrigin() {
    if (this.searchOrigin!=''&&this.searchDestination!=''){
      this.searchRoute(this.searchOrigin,this.searchDestination);
    }
  }

  searchEnterDestination() {
    if (this.searchOrigin!=''&&this.searchDestination!=''){
      this.searchRoute(this.searchOrigin,this.searchDestination);
    }
  }


  searchRoute(origin: string, destination: string)  {
    this.apiService.getRouteApi(origin, destination)
      .then(points => {
        console.log(points)
        this.toastCtrl.create({
          message: "Duong di tim thay la: " + JSON.stringify(points),
          duration: 10000,
          position: 'middle'
        }).present();

        //reset thong tin tim kiem lai vi tim thay ket qua
        this.searchOrigin = '';
        this.searchDestination='';
        this.isShowRoute=false;
        //
      }
      )
      //err= {"_body":{"isTrusted":true},"status":0,"ok":false,"statusText":"","headers":{},"type":3,"url":null}
      .catch(err => 
        {
          console.log("Loi request route: ok=" + err.ok + ", isTrusted=" + err._body.isTrusted)
          //console.log(JSON.stringify(err))
          this.toastCtrl.create({
            message: "Err: " + JSON.stringify(err),
            duration: 5000,
            position: 'bottom'
          }).present();
        }
        )
  }
}
