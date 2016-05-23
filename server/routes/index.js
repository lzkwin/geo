var express = require('express');
var router = express.Router();
var request = require('request-json');
var path = require('path');
var passport = require('passport');
var config = require('../config.js');
var moment = require('moment');

var serverUrl = config.serverUrl;
var appId = config.appId;
var appSecret = config.appSecret;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/login', passport.authenticate('local'), function(req, res, next) {
    res.send({
        status: 1
    });
});

var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.send({
            status: -1,
            message: '用户未登录'
        });
    }
};

router.get('/devices', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var data = {
        "actionName": "QueryDev",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{ "name": "userId", "value": req.user.id },
            { "name": "page", "value": "0" },
            { "name": "id", "value": "0" }
        ],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.get('/gps', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var paramsSet = [];
    req.query.devIds.forEach(function(id) {
        paramsSet.push({
            name: 'devId',
            value: id
        });
    });
    var data = {
        "actionName": "GPS",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": paramsSet,
        "status": 0,
        "timeStamp": 183727132
    }
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.get('/warnings/:id', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var data = {
        "actionName": "QueryHistoryAlarm",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": "userId",
            "value": req.user.id
        }, /*{
            "name": "devId",
            "value": req.params.id
        }, */{
            "compare": "%3E%3D",
            "name": "dt_alarm",
            "value": moment().add(-7, 'days').format('YYYY-MM-DD 00:00:00')
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.get('/tracks/:id', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var data = {
        "actionName": "HistoryGPS",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": "devId",
            "value": req.params.id
        }, {
            "name": "dt_start",
            "value": req.query.start
        }, {
            "name": "dt_end",
            "value": req.query.end
        }, {
            "name": "type",
            "value": "1"
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.post('/settings/:id/region', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var devId = req.params.devId;
    var option = req.params.option;
    var data = {
        "actionName": "DevCMD",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": "devId",
            "value": devId
        }, {
            "name": "cmd",
            "value": "311"
        }, {
            "name": "param",
            "value": "" //value=2000,W,114.030324,22.628117,G,114.035407,22.625361,0000
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.post('/settings', isAuthenticated, function(req, res, next) {
    var client = request.createClient(serverUrl);
    var devId = req.params.devId;
    var option = req.params.option;
    var cmd = {
        uploadFreq: '309', //60s
        geoMode: '310', //0:GPS, 1: station,2:GPS+station
        timeZone: '313', //timezone, (direction:0=east|1=west, hour, minute)
        led: '303', //0=off, 1=on
        alarm: '307', //value=10000010,0000;value=11000010,0000;value=11000010,0000;value=11000000,0000
        waken: '620', //0,value,0000,
        region: '311' //设置不规则围栏范围，value=4,W,114.032061,22.632336,114.034529,22.627815,114.031213,22.622872,114.027641,22.625621,G,114.037148,22.629585,114.03962,22.625069,114.036298,22.620117,114.032719,22.622858,0000
    }
    var data = {
        "actionName": "DevCMD",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": "devId",
            "value": devId
        }, {
            "name": "cmd",
            "value": "309"
        }, {
            "name": "param",
            "value": "90,0000"
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

router.post('/sms', function(req, res, next) {
    var client = request.createClient(serverUrl);
    var mobile = req.params.mobile;
    var data = {
        "actionName": "SMS",
        "appId": appId,
        "appSecret": appSecret,
        "paramsSet": [{
            "name": "mobile",
            "value": mobile
        }, {
            "name": "type",
            "value": 0
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});

//注册新用户
router.post('/users', function(req, res, next) {
    var client = request.createClient(serverUrl);
    var name = req.params.username;
    var password = req.params.password;
    var data = {
        "actionName": "AddUserEx",
        "appId": appId,
        "appSecret": appSecret,
        "entrySet": [{
            "addr": "",
            "devId": "",
            "mail": "",
            "mobilePhone": "",
            "name": name,
            "note": "",
            "phone": "",
            "pwd": password,
            "id": 0,
            "parentId": 0,
            "sex": 0,
            "userTypeId": 2
        }],
        "status": 0,
        "timeStamp": 183727132
    };
    client.post('WebAPI.ashx/?=', data,
        function(error, response, body) {
            console.log(error);
            res.send(body);
        }
    );
});


module.exports = router;
