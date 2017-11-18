/*
 * SURFLIFE
 */

// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http')
  , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');
  

//===== Passport 사용 =====//
var passport = require('passport');
var flash = require('connect-flash');


// 모듈로 분리한 설정 파일 불러오기
var config = require('./config/config');

// 모듈로 분리한 데이터베이스 파일 불러오기
var database = require('./database/database');

// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require('./routes/route_loader');



// 익스프레스 객체 생성
var app = express();


//////////////////////////

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())



// cookie-parser 설정
app.use(cookieParser());

///////////////////////////////////

//라우팅 정보를 읽어들여 라우팅 설정
var router = express.Router();
route_loader.init(app, router);

/////////////////////////////////////





//===== 서버 시작 =====//


//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on('uncaughtException', function (err) {
	console.log('uncaughtException 발생함 : ' + err);
	console.log('서버 프로세스 종료하지 않고 유지함.');
	
	console.log(err.stack);
});

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database.db) {
		database.db.close();
	}
});

// 시작된 서버 객체를 리턴받도록 합니다. 
//var server = http.createServer(app).listen(app.get('port'), function(){
var server = http.createServer(app).listen(3000, function(){
	console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

	// 데이터베이스 초기화
	database.init(app, config);

    //환경정보 데이터 받아오기
    var j =  schedule.scheduleJob('0 */1 * * * *', saveSpotData);
   
});


//3시간마다 환경정보 얻어오기
//스팟 환경 정보 사이트에서 가져오기
var request = require("async-request");
var schedule = require('node-schedule');

//var time = require('time');                     // Time
var logger = require('./config/logger');        // Winston Logger

var saveSpotData = async function(){
    try{
       
        //경도위도 얻기
        let coorRes = await database.Spots.getCoordinates();
        if(!coorRes) throw new Error('getCoordinates 에러 발생 ');

        var numSpots = coorRes.length;
        for(var i=0; i<numSpots; i++){
            //사이트에서 데이터 얻어오기
           
            var url = "http://api.worldweatheronline.com/premium/v1/marine.ashx?key=b753a7124bc84804bc801650172604&format=json&tide=yes&q="
                        +coorRes[i].coordinates;

            let data = await request(url);

            var config={ 
                'statusCode' : data.statusCode,
                'headers' : data.headers
            };
         
            //4일치 데이터 받아오기
            var body = JSON.parse(data.body);

//바디 검사해서 오류인지 보기
            logger.info(body);

            var weather = body.data.weather;
            var spotData = [];
            for(var j=0; j<4; j++){
                var hourly = [];
                for(var k=0; k<8; k++){
                    hourly.push({
                        'time':weather[j].hourly[k].time,
                        'swellDir16Point':weather[j].hourly[k].swellDir16Point,
                        'swellHeight_m':weather[j].hourly[k].swellHeight_m, //
                        'swellPeriod_secs':weather[j].hourly[k].swellPeriod_secs, //
                        'winddir16Point':weather[j].hourly[k].winddir16Point,
                        'windspeedKmph':weather[j].hourly[k].windspeedKmph,
                        'weatherCode':weather[j].hourly[k].weatherCode, //
                        'tempC':weather[j].hourly[k].tempC //
                    });
                }

                spotData.push({
                        'date':weather[j].date,
                        'tide_data':weather[j].tides[0].tide_data,
                        'hourly':hourly
                });
            }

            //데이터베이스에 data 저장
            let results = await database.Spots.saveSpotData(coorRes[i]._id, config, spotData);
            if(!results) throw new Error('saveSpotData 에러 발생 ');
       };
	   console.log('## '+new Date()+' 환경 정보 받아오기 성공!');
        return;
    }
    catch(err){
        console.error(err.stack);
        return;
    }
};




