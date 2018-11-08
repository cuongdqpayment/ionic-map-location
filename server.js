//su dung server cho heroku bao thu muc chay web la www
var express = require("express");
var app = express();

//su dung cac thanh phan
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(cors());
////////////////////////////

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "DELETE,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static("www"));
var port = process.env.PORT || 5000;
app.set('port',port);
app.listen(app.get('port'), function () {
    console.log('listening in http://cuongdqionic.herokuapp.com:' + port);
});