/*
 * 공지사항 리스트를 위한 
 * 라우팅 함수 정의
 */

//공지사항 추가
var addNotice = async function(req, res){
    console.log('notices 모듈의 addNotice 호출.');

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    var title = req.body.title;
    var content = req.body.content;

    console.log('요청 파라미터 : ' + title);

    try{
        var notice = new database.Notices({
            title : title,
            content : content
        });

        let results = await notice.addNotice();
        if(!results) throw new Error('addNotice 에러 발생 ');

        var msg = {
            msg : "success",
            data : {
                n_id : results._id,
            }
        }
        res.json(msg);
        console.log('addNotice', '공지사항 글을 생성했습니다. : ');
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'addNotice Error'});
        return;
    }
};


//공지사항 리스트 보기
var listNotices = async function(req, res){
    console.log('notices 모듈의 listNotices 호출.');

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Notices.listNotices();
        if(!results) throw new Error('listNotices 에러 발생 ');

        var msg = {
            msg : "success",
            total : results.length,
            data : results
        };
        res.json(msg);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'listNotices Error'});
        return;
    }
};


//공지사항 삭제
var removeNotice = async function(req, res){
    console.log('notices 모듈의 removeNotice 호출.');

    var n_id = req.params.n_id;
    console.log('요청 파라미터 : ' + n_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Notices.removeNotice(n_id);

        var msg = {
            msg : "success",
            data : {
                n_id : n_id,
                results : results
            }
        }
        res.json(msg);
        console.log("공지사항 삭제 성공");
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'removeNotice Error'});
        return;
    }
};

module.exports.addNotice = addNotice;
module.exports.listNotices = listNotices;
module.exports.removeNotice = removeNotice;