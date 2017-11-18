/*
 * 서핑스팟을 위한 라우팅 함수 정의
 *
 * @author Minsu
 */

require('date-utils');
var request = require("async-request");

//서핑 스팟 추가
var addSpot = async function(req, res){
    console.log('spots 모듈 안에 있는 addSpot 호출.');

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    var spotName = req.body.spotName;
    var addr = req.body.addr;
    var coordinates = req.body.coordinates;
    console.log('요청 파라미터 : ' + spotName + ', ' + addr + ', ' + 
                   coordinates);

    try{
        var spot = new database.Spots({
            spotName : spotName,
            addr : addr,
            coordinates : coordinates,
        });

        let results = await spot.addSpot();
        if(!results) throw new Error('addSpot 에러 발생 ');

        var msg = {
            msg : "success",
            data : {
                s_id : results._id,
            }
        }
        res.json(msg);
        console.log('addSpot 성공', '서핑 스팟 추가');
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'addSpot Error'});
        return;
    }
};



//스팟 환경 정보 사이트에서 가져오기
var saveSpotData = async function(req, res){
    console.log('spots 모듈 안에 있는 getSpotData 호출.');

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        //경도위도 얻기
        let coorRes = await database.Spots.getCoordinates();
        if(!coorRes) throw new Error('getCoordinates 에러 발생 ');


        var successSpots = [];
        var numSpots = coorRes.length;

        console.log('## 스팟 개수 : '+numSpots);

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
                        'astronomy':weather[j].astronomy[0],
                        'tide_data':weather[j].tides[0].tide_data,
                        'hourly':hourly
                });
            }
            //데이터베이스에 data 저장
            let results = await database.Spots.saveSpotData(coorRes[i]._id, config, spotData);
            if(!results) throw new Error('saveSpotData 에러 발생 ');

            successSpots.push(coorRes[i]._id);
       };
        var msg = {
            msg : "success",
            data : {
                successSpots : successSpots
            }
        }
        res.json(msg);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'saveSpotData Error'});
        return;
    }
};


//서핑스팟 환경정보 목록 & 서핑스팟 검색 결과 목록
var listSpots = async function(req, res){
    console.log('spots 모듈 안에 있는 listSpots 호출.');

    var key = req.query.key;
    console.log('요청 파라미터 : ' + key);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        if(key != undefined){
            let results = await database.Spots.searchSpots(key);
            if(!results) throw new Error('searchSpots 에러 발생 ');

            var spots = {
                msg : "success",
                total : results.length,
                query : key,
                data : results
            };
            res.json(spots);
            return;
        }
       
        let results = await database.Spots.listSpots();
        if(!results) throw new Error('listSpots 에러 발생 ');
        

        //시간에 따라 hourly 데이터 인덱스 정하기
        var time = new Date().toFormat('HH24');
        var index;
        switch(true){
            case time<3 :
                console.log('<3');
                index=0;
                break;

            case time<6 :
                console.log('<6');
                index=1;
                break;

            case time<9 :
                console.log('<9');
                index=2;
                break;

            case time<12 :
                console.log('<12');
                index=3;
                break;

            case time<15 :
                console.log('<15');
                index=4;
                break;

            case time<18 :
                console.log('<18');
                index=5;
                break;

            case time<21 :
                console.log('<21');
                index=6;
                break;

            default :
                console.log('<24');
                index=7;
        }

        //hourly data 조합
        
        var sendData = [];
        for(var i=0; i<results.length; i++){
            var spotEnvData;
            spotEnvData = {
                swellHeight_m : results[i].data[0].hourly[index].swellHeight_m,
                swellPeriod_secs : results[i].data[0].hourly[index].swellPeriod_secs,
                weatherCode : results[i].data[0].hourly[index].weatherCode,
                tempC : results[i].data[0].hourly[index].tempC
            };

            sendData.push({
                _id : results[i]._id,
                spotName : results[i].spotName,
                addr : results[i].addr,
                envData : spotEnvData
            });
        }

        var spots = {
            msg : "success",
            total : sendData.length,
            data : sendData
        };
        res.json(spots);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'listSpots Error'});
        return;
    }
};



//즐겨찾기한 서핑스팟 목록
var listBookmarkSpots = async function(req, res){
    console.log('spots 모듈 안에 있는 listBookmarkSpots 호출.');

    var bookmarks = req.body.bookmarks;
    console.log('요청 파라미터 : ' + bookmarks);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Spots.bookmarkSpots(bookmarks);
        if(!results) throw new Error('bookmarkSpots 에러 발생 ');

        //시간에 따라 hourly 데이터 인덱스 정하기
        var time = new Date().toFormat('HH24');
        var index;
        switch(true){
            case time<3 :
                console.log('<3');
                index=0;
                break;

            case time<6 :
                console.log('<6');
                index=1;
                break;

            case time<9 :
                console.log('<9');
                index=2;
                break;

            case time<12 :
                console.log('<12');
                index=3;
                break;

            case time<15 :
                console.log('<15');
                index=4;
                break;

            case time<18 :
                console.log('<18');
                index=5;
                break;

            case time<21 :
                console.log('<21');
                index=6;
                break;

            default :
                console.log('<24');
                index=7;
        }

        //hourly data 조합
        var sendData = [];
        for(var i=0; i<results.length; i++){
            var spotEnvData;
            spotEnvData = {
                swellHeight_m : results[i].data[0].hourly[index].swellHeight_m,
                swellPeriod_secs : results[i].data[0].hourly[index].swellPeriod_secs,
                weatherCode : results[i].data[0].hourly[index].weatherCode,
                tempC : results[i].data[0].hourly[index].tempC
            };

            sendData.push({
                _id : results[i]._id,
                spotName : results[i].spotName,
                addr : results[i].addr,
                envData : spotEnvData
            });
        }

        var spots = {
            msg : "success",
            total : sendData.length,
            data : sendData
        };
        res.json(spots);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'listBookmarkSpots Error'});
        return;
    }
};




//서핑스팟 환경정보 상세 보기
var detailSpot = async function(req, res){
    console.log('spots 모듈 안에 있는 detailSpot 호출.');

    var s_id = req.params.s_id;
    console.log('요청 파라미터 : ' + s_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Spots.detailSpot(s_id);
        if(!results) throw new Error('detailSpot 에러 발생 ');

         //시간에 따라 hourly 데이터 인덱스 정하기
        var time = new Date().toFormat('HH24');
        var index;
        switch(true){
            case time<3 :
                console.log('<3');
                index=0;
                break;

            case time<6 :
                console.log('<6');
                index=1;
                break;

            case time<9 :
                console.log('<9');
                index=2;
                break;

            case time<12 :
                console.log('<12');
                index=3;
                break;

            case time<15 :
                console.log('<15');
                index=4;
                break;

            case time<18 :
                console.log('<18');
                index=5;
                break;

            case time<21 :
                console.log('<21');
                index=6;
                break;

            default :
                console.log('<24');
                index=7;
        }

        //hourly data 조합
     //   var sendData = [];
     //   for(var i=0; i<results.length; i++){
            var spotEnvData;
            spotEnvData = {
                swellDir16Point : results[0].data[0].hourly[index].swellDir16Point,
                swellHeight_m : results[0].data[0].hourly[index].swellHeight_m,
                swellPeriod_secs : results[0].data[0].hourly[index].swellPeriod_secs,
                winddir16Point : results[0].data[0].hourly[index].winddir16Point,
                windspeedKmph : results[0].data[0].hourly[index].windspeedKmph,
                weatherCode : results[0].data[0].hourly[index].weatherCode,
                tempC : results[0].data[0].hourly[index].tempC
            };

            // sendData.push({
            //     _id : results[i]._id,
            //     spotName : results[i].spotName,
            //     addr : results[i].addr,
            //     envData : spotEnvData
            // });
      //  }

        var spot = {
            msg : "success",
            total : results.length,
            param : s_id,
            spotId : results[0]._id,
            spotName : results[0].spotName,
            spotAddress : results[0].addr,
            data : results[0].data,
            nowData : spotEnvData,

        };
        res.json(spot);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'detailSpot Error'});
        return;
    }
};


module.exports.addSpot = addSpot;
module.exports.saveSpotData = saveSpotData;
module.exports.listSpots = listSpots;
module.exports.listBookmarkSpots = listBookmarkSpots;
module.exports.detailSpot = detailSpot;

