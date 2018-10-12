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
  //@ViewChild('searchBar') searchBar: Searchbar;

  map: any;
  locTracking: Subscription;
  loc: Location = new Location();
  locOld: Location = new Location();
  timer: TimerSchedule = new TimerSchedule();
  
  isMapOk: boolean = false;
  isLocOK: boolean = false;
  isShowHeader: boolean = false;
  isShowSearch: boolean = false;
  isShowRoute: boolean = false;
  isShowCenter: boolean = false;
  isShowFooter: boolean = true;

  searchOrigin: string = "";
  searchDestination: string = "";

  className: string = "icon-center icon-blue";
  
  searchString: string = '';
  countTimer: number = 0;

  locfound = {
    lat: 16,
    lon: 108,
    address: "da nang viet nam"
  };

  originLocation = {
    lat: 16,
    lon: 108,
    address: "da nang viet nam"
  };

  destinationLocation = {
    lat: 16,
    lon: 108,
    address: "da nang viet nam"
  };

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
    //this.timer.startTimer();

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

    latLng = new google.maps.LatLng(16.05, 108.2);

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
    this.showCurrentLocation();

    loading.dismiss();
  }



  showCurrentLocation() {
    this.getLocation();
    this.map.setCenter(latLng);
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
    //dua ban do ve vi tri trung tam
    //this.map.setCenter(latLng);
  }

  //mo cua so tim kiem
  showSearchbar() {
    this.isShowHeader = !this.isShowHeader;
    this.isShowSearch = !this.isShowSearch;
  }

  
  //tim kiem route
  showRoutebar() {
    this.isShowRoute = !this.isShowRoute;
  }

  searchEnterOrigin() {
    if (this.searchOrigin != '' && this.searchDestination != '') {
      this.searchRoute(this.searchOrigin, this.searchDestination);
    }
  }

  searchEnterDestination() {
    if (this.searchOrigin != '' && this.searchDestination != '') {
      this.searchRoute(this.searchOrigin, this.searchDestination);
    }
  }


  searchRoute(origin: string, destination: string) {
    this.apiService.getRouteApiNative(origin, destination)
      .then(points => {
        console.log(points)
        this.toastCtrl.create({
          message: "api route data: " + JSON.stringify(points),
          duration: 10000,
          position: 'middle'
        }).present();

        //reset thong tin tim kiem lai vi tim thay ket qua
        this.searchOrigin = '';
        this.searchDestination = '';
        this.isShowRoute = false;
        //
      }
      )
      //err= {"_body":{"isTrusted":true},"status":0,"ok":false,"statusText":"","headers":{},"type":3,"url":null}
      .catch(err => {
        console.log("Loi request route: " + JSON.stringify(err))
        //console.log(JSON.stringify(err))
        this.toastCtrl.create({
          message: "Err API route: " + JSON.stringify(err),
          duration: 5000,
          position: 'bottom'
        }).present();
      }
      )
  }


  mapDragend(f:number) {
    if (this.map.getCenter()) { 
      this.locfound.lat = this.map.getCenter().lat();
      this.locfound.lon = this.map.getCenter().lng();
      this.locfound.address = "searching...";
      console.log("Center: "+ this.locfound.lat + "," + this.locfound.lon);
      

      this.originLocation.lat = this.map.getCenter().lat();
      this.originLocation.lon = this.map.getCenter().lng()
      //thuc hien goi ham lay dia chi 

      this.apiService.getAddressFromlatlng(this.originLocation.lat + "," + this.originLocation.lon)
        .then(address => {
          console.log("Funtion: " + f);
          
          this.locfound.address = address;
          if (f==1) {
            this.searchOrigin = address;
          }
          if (f==2) {
            this.searchDestination = address
          }
          
        })
        .catch(err => {
          this.toastCtrl.create({
            message: "Err API route: " + JSON.stringify(err),
            duration: 5000,
            position: 'bottom'
          }).present();
        })
        ;
    }

  }

  showCenterMode(f: number) {
    //this.isShowFooter = true;
     //them su kien keo tha ban do de lay dia chi trung tam ban do
    if (this.isMapOk)
     google.maps.event.addListener(this.map, 'dragend', () => this.mapDragend(f));

    if (f == 1) {
      //tim theo diem dau
      this.toastCtrl.create({
        message: "Di chuyển bản đồ tới vị trí điểm bắt đầu",
        duration: 3000,
        position: 'bottom'
      }).present();
      //class mau xanh
      this.className = "icon-center icon-blue";
      this.isShowCenter = true;

    }
    if (f == 2) {
      //tim theo diem cuoi
      
      this.toastCtrl.create({
        message: "Di chuyển bản đồ tới vị trí điểm đến",
        duration: 3000,
        position: 'bottom'
      }).present();
      //class mau do
      this.className = "icon-center icon-red";
      this.isShowCenter = true;
    }
  }

  showSearchMode(f: number) {
    if (f == 1) {
      //hien thi o tim kiem diem den
      //ghi nhan diem dau da tim thay
      //gan marker cho diem dau va diem cuoi
      //xoa listener de lan sau tim tiep
      google.maps.event.clearListeners(this.map, 'dragend');

      //
      this.toastCtrl.create({
        message: "Nhập địa chỉ điểm đến hoặc tìm trên bản đồ",
        duration: 1000,
        position: 'middle'
      }).present();
      this.isShowRoute = true;
      this.isShowCenter = false;
    }
    if (f == 2) {
      //tim kiem duong di 
      //gan marker cho diem cuoi
      //xoa listener de lan sau tim tiep
      google.maps.event.clearListeners(this.map, 'dragend');
      // truong hop khong su dung keo tha thi sao?

      this.toastCtrl.create({
        message: "Đang tìm kiếm đường đi",
        duration: 1000,
        position: 'middle'
      }).present();
      this.isShowCenter = false;
    }
  }


  // tim kiem theo dia chi bang cach bam phim enter
  searchEnter(f: number) {
    
    this.apiService.getlatlngFromAddress(f==1?this.searchOrigin:this.searchDestination)
      .then(apiJson => {
        this.locfound.lat = apiJson.results[0].geometry.location.lat
        this.locfound.lon = apiJson.results[0].geometry.location.lng
        this.locfound.address = apiJson.results[0].formatted_address

        //console.log(JSON.stringify(apiJson))
        /* this.toastCtrl.create({
          message: "Toa do tim thay la: " + apiJson,
          duration: 5000,
          position: 'middle'
        }).present(); */

        //di chuyen ban do den vi tri tim thay
        //gan ghim vi tri diem dau hoac diem cuoi vao do
        
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

  }


}
