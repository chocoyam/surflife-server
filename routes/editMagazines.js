/*
 * 매거진을 위한 라우팅 함수 정의
 */

var imgUpload = require('./s3/imgUpload');
var mongoose = require('mongoose');

//1.매거진 쓰기
var addMagazine = async function(req, res){

    console.log('editMagazines 모듈의 addMagazine 호출.');

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    var title = req.body.title;
    var u_id = req.body.u_id;
    var photos = req.files;
    var texts = req.body.texts;
    var thumb;
    //var video = req.body.video;

    console.log('요청 파라미터 : ' + ', ' + title + ', ' + 
               u_id + ', ' + photos + ', ' + texts);

    try{
        //업로드 url 받기
        var urls = await imgUpload.upload(photos, 'magazines');
        if(urls.length != 0)
            thumb = urls[0];
        
        var magazine = new database.Magazines({
            title : title,
            u_id : parseInt(u_id),
            thumbnail : thumb,
            texts : texts,
            photos : urls,
            //video : video
        });

        let results = await magazine.addMagazine();
        if(!results) throw new Error('addMagazine 에러 발생 ');

        var msg = {
            msg : "success",
            data : {
                m_id : results._id,
            }
        }
        res.json(msg);
        console.log('addMagazine성공', '포스팅 글을 생성했습니다. : ' + results._id);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'addMagazine Error'});
        return;
    }
};




//2.매거진 삭제
var removeMagazine = async function(req, res){
    console.log('editMagazines 모듈의 removeMagazine 호출.');

    var m_id = req.params.m_id;
    console.log('요청 파라미터 : ' + m_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Magazines.removeMagazine(m_id);

        var msg = {
            msg : "success",
            data : {
                m_id : m_id,
                results : results
            }
        }
        res.json(msg);
        console.log("매거진 삭제 성공");
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'removeMagazine Error'});
        return;
    }
};




//3.매거진 수정
var updateMagazine = async function(req, res){
    console.log('editMagazines 모듈의 updateMagazine 호출.');

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});
    
    var m_id = req.params.m_id;
    var title = req.body.title;
    var photos = req.files;
    var texts = req.body.texts;
    var thumb;
    //var video = req.body.video;

    console.log('요청 파라미터 : '+ m_id  + ', ' + title + ', ' + 
                 photos + ', ' + texts);

    try{
        //업로드 url 받기
        var urls = await imgUpload.upload(photos, 'magazines');

        var results;
        if(urls.length < 1){
            results = await database.Magazines.updateMagazine(m_id, title, texts);
            if(!results) throw new Error('updateMagazine 에러 발생 ');
        }
        else{
            thumb = urls[0];
            results = await database.Magazines.updateMagazineAll(m_id, title, thumb, texts, urls);
            if(!results) throw new Error('updateMagazineAll 에러 발생 ');
        }

        var msg = {
            msg : "success",
            data : {
                m_id : m_id,
                results : results
            }
        }
        console.log(results);

        res.json(msg);
        console.log('updateMagazine성공', '포스팅 글을 수정했습니다. : ');
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'updateMagazine Error'});
        return;
    }
};


//4.좋아요 추가
var addLike = async function(req, res){
    console.log('editMagazines 모듈의 addLike 호출.');

    var m_id = req.params.m_id;
    var u_id = req.params.u_id;
    console.log('요청 파라미터 : ' + m_id + ', ' + u_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Magazines.addLike(m_id, u_id);

        var msg = {
            msg : "success",
            data : {
                m_id : m_id,
                u_id : u_id,
                results : results
            }
        }
        res.json(msg);
        console.log("좋아요 추가 성공");

        //알림 보내기
        let writerId = await database.Magazines.getWriterId(m_id); //글쓴이 _id 얻기
        writerId = writerId[0].u_id;

        let uname = await database.Users.getUname(u_id); //좋아요한 유저의 닉네임 얻기
        uname = uname[0].uname;

        var alarm = {
            content : uname+"님이 회원님의 게시물을 좋아합니다."
        };

        let addAlarmRes = await database.Users.addAlarm(writerId, alarm);
        console.log(writerId + "에게 좋아요 알림 추가 성공");

        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'addLike Error'});
        return;
    }
};


//5.좋아요 취소
var removeLike = async function(req, res){
    console.log('editMagazines 모듈의 removeLike 호출.');

    var m_id = req.params.m_id;
    var u_id = req.params.u_id;
    console.log('요청 파라미터 : ' + m_id + ', ' + u_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Magazines.removeLike(m_id, u_id);

        var msg = {
            msg : "success",
            data : {
                m_id : m_id,
                u_id : u_id,
                results : results
            }
        }
        res.json(msg);
        console.log("좋아요 취소 성공");
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'removeLike Error'});
        return;
    }
};


//6.댓글쓰기
var addComment = async function(req ,res){
     console.log('editMagazines 모듈의 addComment 호출.');

    var m_id = req.params.m_id;
    var u_id = req.body.u_id;
    var content = req.body.content;
    console.log('요청 파라미터 : ' + m_id + ', ' + u_id + ', ' + content);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});
        
    try{
        var comment = {
            u_id : u_id,
            content : content
        };

        let results = await database.Magazines.addComment(m_id, comment);

        var msg = {
            msg : "success",
            data : {
                m_id : m_id,
                results : results
            }
        }
        res.json(msg);
        console.log("댓글 쓰기 성공");

        //알림 보내기
        let writerId = await database.Magazines.getWriterId(m_id); //글쓴이 _id 얻기
        writerId = writerId[0].u_id;

        let uname = await database.Users.getUname(u_id); //댓글 단 유저의 닉네임 얻기
        uname = uname[0].uname;

        var alarm = {
            content : uname+"님이 회원님의 게시물에 댓글을 남겼습니다."
        };

        let addAlarmRes = await database.Users.addAlarm(writerId, alarm);
        console.log(writerId + "에게 댓글 알림 추가 성공 : ");

        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'addComment Error'});
        return;
    }
};


//7.댓글삭제
var removeComment = async function(req, res){
    console.log('editMagazines 모듈의 removeComment 호출.');

    var m_id = req.params.m_id;
    var c_id = req.params.c_id;
    console.log('요청 파라미터 : ' + m_id + ', ' + c_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});
        
    try{
        let results = await database.Magazines.removeComment(m_id, c_id);

        var msg = {
            msg : "success",
            data : {
                m_id : m_id,
                results : results
            }
        }
        res.json(msg);
        console.log("댓글 삭제 성공");
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'removeComment Error'});
        return;
    }
};


//8.댓글수정
var updateComment = async function(req, res){
    console.log('editMagazines 모듈의 updateComment 호출.');

    var m_id = req.params.m_id;
    var c_id = req.params.c_id;
    var content = req.body.content;
    console.log('요청 파라미터 : ' + m_id + ', ' + c_id + ', ' + content);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});
        
    try{
        let results = await database.Magazines.updateComment(m_id, c_id, content);

        var msg = {
            msg : "success",
            data : {
                m_id : m_id,
                c_id : c_id,
                results : results
            }
        }
        res.json(msg);
        console.log("댓글 수정 성공");
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'updateComment Error'});
        return;
    }
};

module.exports.addMagazine = addMagazine;
module.exports.removeMagazine = removeMagazine;
module.exports.updateMagazine = updateMagazine;
module.exports.addLike = addLike;
module.exports.removeLike = removeLike;
module.exports.addComment = addComment;
module.exports.removeComment = removeComment;
module.exports.updateComment = updateComment;