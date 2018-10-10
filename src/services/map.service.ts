import { Http } from '@angular/http';
import { HTTP } from '@ionic-native/http';
import { Platform } from 'ionic-angular';

import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ApiService {
    GOOGLE_API_KEY = 'AIzaSyDBxMizhomgbDZ9ljbf9-mY_Omuo0heCig';
    WEATHER_API_KEY = '22bc862e9465e98d1c74b7351cab36ef';
    /* 
    urlLatLng ='https://maps.googleapis.com/maps/api/geocode/json?latlng=16.0652695,108.2010651&key=AIzaSyDBxMizhomgbDZ9ljbf9-mY_Omuo0heCig';
    urlAddress='https://maps.googleapis.com/maps/api/geocode/json?address=30%20be%20van%20dan,%20da%20nang&key=AIzaSyDBxMizhomgbDZ9ljbf9-mY_Omuo0heCig';
    urlRoute='https://maps.googleapis.com/maps/api/directions/json?origin=30%20Be%20van%20dan,%20da%20nang,%20viet%20nam&destination=263%20nguyen%20van%20linh,%20da%20nang&key=AIzaSyDBxMizhomgbDZ9ljbf9-mY_Omuo0heCig';
    urlWeather='https://api.openweathermap.org/data/2.5/weather?id=1905468&APPID=22bc862e9465e98d1c74b7351cab36ef&units=metric';
    */
    constructor(private http: Http,
        private http_native: HTTP,
        private platform: Platform) { }

    getAddressFromlatlng(latlng: string) {
        return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='
            + latlng
            + '&key=' + this.GOOGLE_API_KEY)
            .toPromise()
            .then(res => res.json())
            .then(apiJson => apiJson.results[0].formatted_address)

    }

    getlatlngFromAddress(address: string) {
        return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address='
            + address
            + '&key=' + this.GOOGLE_API_KEY)
            .toPromise()
            .then(res => res.json())
            //.then(apiJson=>console.log(JSON.stringify(apiJson)))
            /* .then(apiJson => apiJson.results[0].geometry.location.lat
                + ','
                + apiJson.results[0].geometry.location.lng) */
    }

    getWeatherApi(cityId: number) {
        return this.http.get('https://api.openweathermap.org/data/2.5/weather?id='
            + cityId
            + '&APPID=' + this.WEATHER_API_KEY
            + '&units=metric')
            .toPromise()
            .then(res => res.json())
        //.then(apiJson=>console.log(JSON.stringify(apiJson)))
    }


    getRouteApi(startPoint: string, endPoint: string) {
        //them header option de sua loi CORS
        //
        /*      let headers = new Headers();
             headers.append('Access-Control-Allow-Origin', '*');
             headers.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
             headers.append('Accept', 'application/json');
             headers.append('content-type', 'application/json');
             let options = new RequestOptions({ headers: headers, withCredentials: true });
      */
        return this.http.get(
            //'https://maps.googleapis.com/maps/api/directions/json?origin=Toronto&destination=Montreal&key=AIzaSyDBxMizhomgbDZ9ljbf9-mY_Omuo0heCig'
            'https://maps.googleapis.com/maps/api/directions/json?origin=' + startPoint
            + '&destination=' + endPoint
            + '&key=' + this.GOOGLE_API_KEY
            //, options
        )
            .toPromise()
            .then(res => res.json())
            .then(apiJson => this.decodePolyline(apiJson.routes[0].overview_polyline.points))

    }

    getRouteApiNative(startPoint: string, endPoint: string) {
        if (this.platform.is('ios') || this.platform.is('android')) {

            return this.http_native.get(
                'https://maps.googleapis.com/maps/api/directions/json?origin=' + startPoint
                + '&destination=' + endPoint
                + '&key=' + this.GOOGLE_API_KEY
                , {}, {'Content-Type': 'application/json'}
            )
                .then(res => res.data)
            /* console.log(res.status);
            console.log(res.data); // data received by server
            console.log(res.headers); */
            //.then(apiJson=>this.decodePolyline(apiJson.routes[0].overview_polyline.points))
        }
        else {
            return this.http.get(
                'https://maps.googleapis.com/maps/api/directions/json?origin=' + startPoint
                + '&destination=' + endPoint
                + '&key=' + this.GOOGLE_API_KEY
            )
                .toPromise()
                .then(res => res.json())
                .then(apiJson => this.decodePolyline(apiJson.routes[0].overview_polyline.points))

        }
    }

    //chuyen doi chuoi polyline thanh cac toa do diem
    // source: http://doublespringlabs.blogspot.com.br/2012/11/decoding-polylines-from-google-maps.html
    decodePolyline(encoded) {
        // array that holds the points
        var points = []
        var index = 0, len = encoded.length;
        var lat = 0, lng = 0;
        while (index < len) {
            var b, shift = 0, result = 0;
            do {
                b = encoded.charAt(index++).charCodeAt(0) - 63;//finds ascii                                                                                    //and substract it by 63
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);

            var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;
            shift = 0;
            result = 0;
            do {
                b = encoded.charAt(index++).charCodeAt(0) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;
            points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) })
        }
        return points
    }

}
