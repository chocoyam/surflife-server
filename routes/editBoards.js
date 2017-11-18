/*
 * 자유게시판 리스트를 위한 
 * 라우팅 함수 정의
 */

var imgUpload = require('./s3/imgUpload');

//1.게시글 추가 
var addBoard = async function(req, res){
    console.log('editBoards 모듈의 addBoard 호출');

	var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    var u_id = req.body.u_id;
    var category = req.body.category;
    //var video = req.body.video;
    var photo = req.files;
    var text = req.body.text;
    console.log('요청 파라미터 : ' + category + ', ' + u_id + ', ' + 
                   photo + ', ' + text);

    try{
        var urls = await imgUpload.upload(photo, 'boards');

        var board = new database.Boards({
            u_id : u_id,
            category : category,
            photo : urls,
            text : text,
            //video : video,
        });

        let results = await board.addBoard();
        if(!results) throw new Error('addBoard 에러 발생 ');

        var msg = {
            msg : "success",
            data : {
                b_id : results._id,
            }
        }
        res.json(msg);
        console.log('addBoard 성공', '포스팅 글을 생성했습니다. : ');
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'addBoard Error'});
        return;
    }
};


//2.게시글 삭제
var removeBoard = async function(req, res){
    console.log('editBoards 모듈의 removeBoard 호출.');

    var b_id = req.params.b_id;
    console.log('요청 파라미터 : ' + b_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Boards.removeBoard(b_id);

        var msg = {
            msg : "success",
            data : {
                b_id : b_id,
                results : results
            }
        }
        res.json(msg);
        console.log("게시글 삭제 성공");
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'removeBoard 에러 발생'});
        return;
    }
};


//게시글 수정
var updateBoard = async function(req, res){
    console.log('editBoards 모듈의 updateBoard 호출.');

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});
    
    var b_id = req.params.b_id;
    var category = req.body.category;
    var photo = req.files;
    var text = req.body.text;
    //var video = req.body.video;

    console.log('요청 파라미터 : '+ b_id + ' ' + category + ', ' + 
                 photo + ', ' + text);

    try{
        //업로드 url 받기
        var urls = await imgUpload.upload(photo, 'boards');

        var results;
        if(urls.length < 1){
            results = await database.Boards.updateBoard(b_id, category, text);
            if(!results) throw new Error('updateBoard 에러 발생 ');
        }
        else{
            thumb = urls[0];
            results = await database.Boards.updateBoardAll(b_id, category, photo, text);
            if(!results) throw new Error('updateBoardAll 에러 발생 ');
        }

        var msg = {
            msg : "success",
            data : {
                b_id : b_id,
                results : results
            }
        }
        console.log(results);

        res.json(msg);
        console.log('updateBoard성공', '포스팅 글을 수정했습니다. : ');
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'updateBoard Error'});
        return;
    }
};


//좋아요 추가
var addLike = async function(req, res){
    console.log('editBoards 모듈의 addLike 호출.');

    var b_id = req.params.b_id;
    var u_id = req.params.u_id;
    console.log('요청 파라미터 : ' + b_id + ', ' + u_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Boards.addLike(b_id, u_id);

        var msg = {
            msg : "success",
            data : {
                b_id : b_id,
                u_id : u_id,
                results : results
            }
        }
        res.json(msg);
        console.log("좋아요 추가 성공");
        
        //알림 보내기
        let writerId = await database.Boards.getWriterId(b_id); //글쓴이 _id 얻기
        writerId = writerId[0].u_id;

        var alarm = {
            content : "님이 회원님의 게시물을 좋아합니다.",
            fromId : u_id
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


//좋아요 취소
var removeLike = async function(req, res){
    console.log('editBoards 모듈의 removeLike 호출.');

    var b_id = req.params.b_id;
    var u_id = req.params.u_id;
    console.log('요청 파라미터 : ' + b_id + ', ' + u_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Boards.removeLike(b_id, u_id);

        var msg = {
            msg : "success",
            data : {
                b_id : b_id,
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


//댓글 쓰기
var addComment = async function(req ,res){
     console.log('editBoards 모듈의 addComment 호출.');

    var b_id = req.params.b_id;
    var u_id = req.body.u_id;
    var content = req.body.content;
    console.log('요청 파라미터 : ' + b_id + ', ' + u_id + ', ' + content);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});
        
    try{
        var comment = {
            u_id : u_id,
            content : content
        };

        let results = await database.Boards.addComment(b_id, comment);

        var msg = {
            msg : "success",
            data : {
                b_id : b_id,
                results : results
            }
        }
        res.json(msg);
        console.log("댓글 쓰기 성공");

        //알림 보내기
        let writerId = await database.Boards.getWriterId(b_id); //글쓴이 _id 얻기
        writerId = writerId[0].u_id;

        var alarm = {
            content : "님이 회원님의 게시물에 댓글을 남겼습니다.",
            fromId : u_id
        };

        let addAlarmRes = await database.Users.addAlarm(writerId, alarm);
        console.log(writerId + "에게 댓글 알림 추가 성공");

        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'addComment Error'});
        return;
    }
};


//댓글 삭제
var removeComment = async function(req, res){
    console.log('editBoards 모듈의 removeComment 호출.');

    var b_id = req.params.b_id;
    var c_id = req.params.c_id;
    console.log('요청 파라미터 : ' + b_id + ', ' + c_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});
        
    try{
        let results = await database.Boards.removeComment(b_id, c_id);

        var msg = {
            msg : "success",
            data : {
                b_id : b_id,
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


//댓글 수정
var updateComment = async function(req, res){
    console.log('editMagazines 모듈의 updateComment 호출.');
};

module.exports.addBoard = addBoard;
module.exports.removeBoard = removeBoard;
module.exports.updateBoard = updateBoard;
module.exports.addLike = addLike;
module.exports.removeLike = removeLike;
module.exports.addComment = addComment;
module.exports.removeComment = removeComment;
module.exports.updateComment = updateComment;
