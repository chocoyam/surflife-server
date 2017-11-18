/*
 * FAQ 리스트를 위한 
 * 라우팅 함수 정의
 */

//FAQ 추가
var addFaq = async function(req, res){
    console.log('faqs 모듈의 addFaq 호출.');

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    var title = req.body.title;
    var content = req.body.content;

    console.log('요청 파라미터 : ' + title);

    try{
        var faq = new database.Faqs({
            title : title,
            content : content
        });

        let results = await faq.addFaq();
        if(!results) throw new Error('addFaq 에러 발생 ');

        var msg = {
            msg : "success",
            data : {
                f_id : results._id,
            }
        }
        res.json(msg);
        console.log('addFaq', 'addFaq 글을 생성했습니다. : ');
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'addFaq Error'});
        return;
    }
};


//공지사항 리스트 보기
var listFaqs = async function(req, res){
    console.log('faqs 모듈의 listFaqs 호출.');

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Faqs.listFaqs();
        if(!results) throw new Error('listFaqs 에러 발생 ');

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
        res.status(400).json({msg : 'listFaqs Error'});
        return;
    }
};


//공지사항 삭제
var removeFaq = async function(req, res){
    console.log('notices 모듈의 removeFaq 호출.');

    var f_id = req.params.f_id;
    console.log('요청 파라미터 : ' + f_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Notices.removeFaq(f_id);

        var msg = {
            msg : "success",
            data : {
                f_id : f_id,
                results : results
            }
        }
        res.json(msg);
        console.log("FAQ 삭제 성공");
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'removeFaq Error'});
        return;
    }
};

module.exports.addFaq = addFaq;
module.exports.listFaqs = listFaqs;
module.exports.removeFaq = removeFaq;
