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
  listenerDrag: any;
  iconOrigin: any;
  iconDestionation: any;
  originMarker: any;
  destionationMarker: any;

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

  isOriginOK: boolean = false;
  isDestinationOK: boolean = false;


  searchOrigin: string = "";
  searchDestination: string = "";

  className: string = "icon-center icon-blue";

  searchString: string = '';
  countTimer: number = 0;

  locfound = {
    lat: 0,
    lon: 0,
    address: ""
  };

  originLocation = {
    lat: 0,
    lon: 0,
    address: ""
  };

  destinationLocation = {
    lat: 0,
    lon: 0,
    address: ""
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
    this.map = null;
    this.listenerDrag = null;
    this.iconOrigin = null;
    this.iconDestionation = null;
    this.originMarker = null;
    this.destionationMarker = null;


    this.loc = new Location();
    this.locOld = new Location();
    this.timer = new TimerSchedule();

    this.isMapOk = false;
    this.isLocOK = false;
    this.isShowHeader = false;
    this.isShowSearch = false;
    this.isShowRoute = false;
    this.isShowCenter = false;
    this.isShowFooter = true;

    this.isOriginOK = false;
    this.isDestinationOK = false;

    this.className = "icon-center icon-blue";
    this.countTimer = 0;

    this.locfound = {
      lat: 0,
      lon: 0,
      address: ""
    };

    this.originLocation = {
      lat: 0,
      lon: 0,
      address: ""
    };

    this.destinationLocation = {
      lat: 0,
      lon: 0,
      address: ""
    };

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

    this.iconOrigin = new google.maps.MarkerImage('assets/imgs/origin-marker.png',
      null, /* size is determined at runtime */
      null, /* origin is 0,0 */
      null, /* anchor is bottom center of the scaled image */
      new google.maps.Size(32, 32)
    );

    this.iconDestionation = new google.maps.MarkerImage('assets/imgs/destination-marker.png',
      null, /* size is determined at runtime */
      null, /* origin is 0,0 */
      null, /* anchor is bottom center of the scaled image */
      new google.maps.Size(32, 32)
    );


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

    infoWindow = new google.maps.InfoWindow({ map: this.map, content: "..." });

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


  //tim kiem route hien thi ca diem dau va diem cuoi
  showRoutebar() {
    //this.isShowRoute = !this.isShowRoute;
  }



  showCenterMode(f: number) {
    //reset phien drag truoc do
    this.clearDrag();

    this.mapDragend(f); // xac dinh dia chi diem hien tai


    //them su kien keo tha ban do de lay dia chi trung tam ban do
    if (this.isMapOk) {
      this.listenerDrag = google.maps.event.addListener(this.map, 'dragend', () => this.mapDragend(f));
    }

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

  mapDragend(f: number) {
    if (this.map.getCenter()) {
      this.locfound.lat = this.map.getCenter().lat();
      this.locfound.lon = this.map.getCenter().lng();
      this.locfound.address = "searching...";
      console.log("Center: " + this.locfound.lat + "," + this.locfound.lon);

      if (f == 1) {
        this.originLocation.address = this.locfound.address;
        this.originLocation.lat = this.locfound.lat;
        this.originLocation.lon = this.locfound.lon;
        //nut tim kiem cua so con lai la false
        this.isOriginOK = false;
      }
      if (f == 2) {
        this.destinationLocation.address = this.locfound.address;
        this.destinationLocation.lat = this.locfound.lat;
        this.destinationLocation.lon = this.locfound.lon;
        this.isDestinationOK = false;
      }
      //thuc hien goi ham lay dia chi 

      this.apiService.getAddressFromlatlng(this.locfound.lat + "," + this.locfound.lon)
        .then(address => {
          console.log("Funtion: " + f);

          this.locfound.address = address;
          if (f == 1) {
            this.originLocation.address = this.locfound.address;
            this.isOriginOK = true;
            console.log("Origin: " + this.originLocation.address);
          }
          if (f == 2) {
            this.destinationLocation.address = this.locfound.address;
            this.isDestinationOK = true;
            console.log("Destination: " + this.destinationLocation.address);
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

  //khi bam nut enter hoac glob, hoac enter o tim kiem diem dau

  showSearchMode(f: number) {
    //xoa diem trung tam tim kiem
    this.clearDrag();

    if (f == 1) {
      //dong tac la bam nut enter: tim diem den
      //luc nay this.originLocation co toa do, dia chi, isOriginOK=true
      //truong hop co chinh sua dia chi diem dau bang tay thi isOriginOK=false
      let oLatlng= new google.maps.LatLng(this.originLocation.lat,
                                          this.originLocation.lon);

      this.map.setCenter(oLatlng);
      //thuc hien gan diem dau marker
      //truong hop bam nut nay lan nua? (nhieu lan) thi sao???

      if (this.originMarker) {
        //diem dau da tao truoc do
        //di chuyen den vi tri moi
        //console.log("da tao truoc do origin");
        this.originMarker.setPosition(oLatlng);

      } else {
        this.originMarker = new google.maps.Marker({
          map: this.map,
          icon: this.iconOrigin,
          position: oLatlng
        });
      }

      this.toastCtrl.create({
        message: "Nhập địa chỉ điểm đến hoặc tìm trên bản đồ",
        duration: 1000,
        position: 'middle'
      }).present();

      this.isShowRoute = true;

    }
    if (f == 2) {
      // truong hop tim kiem go enter co day du ket qua diem cuoi

      let dLatlng= new google.maps.LatLng(this.destinationLocation.lat,
        this.destinationLocation.lon);

      this.map.setCenter(dLatlng);

      //thuc hien gan marker diem cuoi
      if (this.destionationMarker) {
        //console.log("da tao truoc do destination");
        this.destionationMarker.setPosition(dLatlng);
      } else {
        this.destionationMarker = new google.maps.Marker({
          map: this.map,
          icon: this.iconDestionation,
          position: dLatlng
        });
      }

      this.toastCtrl.create({
        message: "Đang tìm kiếm đường đi",
        duration: 1000,
        position: 'middle'
      }).present();

      //goi chuc nang tim duong di 
      //ket qua ve duong di cho no
      this.searchRoute(
        this.originLocation.lat+","+this.originLocation.lon
        ,this.destinationLocation.lat+","+this.destinationLocation.lon);

    }
  }


  clearDrag() {
    if (this.listenerDrag) {
      //hien thi o tim kiem diem den
      //ghi nhan diem dau da tim thay
      //gan marker cho diem dau va diem cuoi
      //xoa listener de lan sau tim tiep
      this.isShowCenter = false;
      google.maps.event.clearListeners(this.map, 'dragend');
      this.listenerDrag = null; //reset de gan lai

    }
  }

  inputChange1(ev){
      console.log("gia tri goc: " + this.originLocation.address);
      console.log("cua so: " + ev.target.value);
  }

  inputChange2(ev){
    console.log("gia tri goc: " + this.destinationLocation.address);
    console.log("cua so: " + ev.target.value);
   }

   closeFooter(){
     this.isShowFooter=false;
   }

  // tim kiem theo dia chi bang cach bam phim enter
  //ket qua lay toa do theo dia chi do
  searchEnter(f: number) {
    console.log("enter funtion: " + f);

    if (f == 1) {
      //truong hop diem dau da tim thay bang chuc nang keo tha
      //thi khong can phai goi chuc nang tim toa do theo dia chi lam gi
      if (this.isOriginOK) {
        //ma goi luon chuc nang gan marker diem dau
        //va mo cua so tim kiem diem den
        this.showSearchMode(1);
      } else {
        //goi chuc nang tim kiem diem dau bang dia chi sang toa do
        this.searchAddress2Latlon(1);
      }

    }
    if (f == 2) {
      if (this.isDestinationOK) {
        //ma goi luon chuc nang gan marker diem cuoi
        //thuc hien tim kiem route
        this.showSearchMode(2);
      } else {
        //goi chuc nang tim kiem diem dau bang dia chi sang toa do
        this.searchAddress2Latlon(2);
      }
    }

  }

  //tim kiem dia chi sang toa do
  searchAddress2Latlon(f: number) {

    this.apiService.getlatlngFromAddress(f == 1 ? this.originLocation.address : this.destinationLocation.address)
      .then(apiJson => {
        this.locfound.lat = apiJson.results[0].geometry.location.lat
        this.locfound.lon = apiJson.results[0].geometry.location.lng
        this.locfound.address = apiJson.results[0].formatted_address
        if (f == 1) {
          this.originLocation.lat = this.locfound.lat;
          this.originLocation.lon = this.locfound.lon;
          this.originLocation.address = this.locfound.address;
          this.isOriginOK = true;
          //goi tiep tim kiem diem den
          this.showSearchMode(1);
        }
        if (f == 2) {
          this.destinationLocation.lat = this.locfound.lat;
          this.destinationLocation.lon = this.locfound.lon;
          this.destinationLocation.address = this.locfound.address;
          this.isDestinationOK = true;
          //goi tiep tim kiem duong di
          this.showSearchMode(2);
        }

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


  searchRoute(origin: string, destination: string) {
    //truong hop tim duong di khi co 2 diem duoc gan

    this.apiService.getRouteApiNative(origin, destination)
      .then(routeApi => {
        
        console.log(routeApi);
        //ve duong di tu diem dau den diem cuoi theo tung diem duoc tim thay
        //tra ve: khoang cach, so tien uoc luong
        //so luong diem duong di ...
         
        var flightPath = new google.maps.Polyline({
          path: routeApi.points,
          geodesic: true,
          strokeColor: '#00ff00',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        flightPath.setMap(this.map);

        this.toastCtrl.create({
          message: "api route point: " + JSON.stringify(routeApi.points.length),
          duration: 10000,
          position: 'middle'
        }).present();

        
      }
      )
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


}
