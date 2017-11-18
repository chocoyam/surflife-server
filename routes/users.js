/*
 * 유저 리스트를 위한 
 * 라우팅 함수 정의
 */

var imgUpload = require('./s3/imgUpload');

Array.prototype.sortOn = function(){
    this.sort(function(a, b){
            var a1 = Date.parse(a.sortingDate);
            var b1 = Date.parse(b.sortingDate);
        if(a1 < b1){
            return -1;
        }else if(a1 > b1){
            return 1;
        }
        return 0;
    });
}


//1.사용자 계정 추가
var addUser = async function(req, res){
    console.log('users 모듈의 addUser 호출.');

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    var isEditor = req.body.isEditor;
    var token = req.body.token;
    var uname = req.body.uname;
    var photo = req.files;
    
    console.log('요청 파라미터 : ' + isEditor + ', ' + token + ', ' + 
               uname + ', ' + photo);

    try{
        //업로드 url 받기
        var urls = await imgUpload.upload(photo, 'users');
        
        var user = new database.Users({
            isEditor : isEditor,
            token : token,
            uname : uname,
            photo : urls,
            alarms : [{content:uname+'님 환영합니다! 즐거운 서프라이프 되세요.'}]
        });

        let results = await user.addUser();
        if(!results) throw new Error('addUser 에러 발생 ');

        var msg = {
            msg : "success",
            data : {
                u_id : results._id,
            }
        }
        res.json(msg);
        console.log('addUser성공', '유저 계정 추가');
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'addUser Error'});
        return;
    }
};


//2.사용자 계정 삭제
var removeUser = async function(req, res){
    console.log('users 모듈의 removeUser 호출.');

    var u_id = req.params.u_id;
    console.log('요청 파라미터 : ' + u_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Users.removeUser(u_id);

        var msg = {
            msg : "success",
            data : {
                u_id : u_id,
                results : results
            }
        }
        res.json(msg);
        console.log("유저 계정 삭제 성공");
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'removeUser Error'});
        return;
    }
};


//3.사용자 계정 정보 보기
var detailUser = async function(req, res){
    console.log("users 모듈의 detailUser 호출.");

    var u_id = req.params.u_id;
    console.log('요청 파라미터 : ' + u_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Users.detailUser(u_id);
        if(!results) throw new Error('detailUser 에러 발생 ');

        var user = {
            msg : "success",
            total : results.length,
            param : u_id,
            data : results
        };
        res.json(user);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'detailUser Error'});
        return;
    }
};


//4.사용자 계정 정보 수정
var updateUser = async function(req, res){
    console.log("users 모듈의 updateUser 호출.");

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});
    
    var u_id = req.params.u_id;
    var uname = req.body.uname;
    var photo = req.files;

    console.log('요청 파라미터 : '+ u_id + ' ' + uname + ', ' + 
                 photo);

    try{
        //업로드 url 받기
        var urls = await imgUpload.upload(photo, 'users');

        var results
        if(urls.length == 0){
            results = await database.Users.updateUname(u_id, uname);
            if(!results) throw new Error('updateUser 에러 발생 ');
        }
        else{
            results = await database.Users.updateUser(u_id, uname, urls);
            if(!results) throw new Error('updateUser 에러 발생 ');
        }

        var msg = {
            msg : "success",
            data : {
                u_id : u_id,
                results : results
            }
        }
        console.log(results);

        res.json(msg);
        console.log('updateUser성공', '유저 정보를 수정했습니다. : ');
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'updateUser Error'});
        return;
    }
};


//5.알림 목록 리스트
var listAlarms = async function(req, res){
    console.log("users 모듈의 listAlarms 호출.");

    var u_id = req.params.u_id;
    console.log('요청 파라미터 : ' + u_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Users.listAlarms(u_id);
        if(!results) throw new Error('listAlarms 에러 발생 ');

        console.log(results);

        var sortedRes = results[0].alarms;
        console.log(sortedRes);
        sortedRes.sortOn();

        //u_id와 content로 메세지 만들기
        var sendData = [];
        for(var i=0; i<sortedRes.length; i++){
            sendData.push({
                _id : sortedRes[i]._id,
                date : sortedRes[i].date,
                content : sortedRes[i].fromId.uname + sortedRes[i].content
            })
        }

        var user = {
            msg : "success",
            total : sortedRes.length,
            param : u_id,
            data : sendData
        };
        res.json(user);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'listAlarms Error'});
        return;
    }
};


//6.알림 목록 삭제
var removeAlarm = async function(req, res){
    console.log('users 모듈의 removeAlarm 호출.');

    var u_id = req.params.u_id;
    var a_id = req.params.a_id;
    console.log('요청 파라미터 : ' + u_id + ', ' + a_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Users.removeAlarm(u_id, a_id);

        var msg = {
            msg : "success",
            data : {
                u_id : u_id,
                a_id : a_id,
                results : results
            }
        }
        res.json(msg);
        console.log("알림 삭제 성공");
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'removeAlarm 에러 발생'});
        return;
    }
};



module.exports.addUser = addUser;
module.exports.removeUser = removeUser;
module.exports.detailUser = detailUser;
module.exports.updateUser = updateUser;
module.exports.listAlarms = listAlarms;
module.exports.removeAlarm = removeAlarm;