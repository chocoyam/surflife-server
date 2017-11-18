/*
 * 매거진 GET방식을 위한 
 * 라우팅 함수 정의
 */

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

/*
 * <매거진 리스트>
 * 1.매거진 전체목록
 * 2.매거진 검색 결과 목록
 * 3.유저가 작성한 매거진 목록
 * 4.유저가 스크랩한 매거진 목록
 * 5.유저가 댓글 달은 매거진 목록
 */
var listMagazines = async function(req, res){
    console.log('showMagazines 모듈 안의 listMagazines 호출.');
    
    var index = req.params.index;
    //쿼리스트링 받기
    var key = req.query.key;
    var writer_u_id = req.query.writer_u_id;
    var arrScrap = req.query.arrScrap;
    var comment_u_id = req.query.comment_u_id;

    //db연결
    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    //응답 메세지
    var msg = {};

    try{
        //매거진 검색 결과 목록
        if(key != undefined){
            console.log('요청 쿼리 : key-'+key);

            let results = await database.Magazines.listBySearch(index, key);
            if(!results) throw new Error('listBySearch 에러 발생 ');

            msg = {
                msg : "success",
                total : results.length,
                index : index,
                query : key,
                data : results
            };
            res.json(msg);
            return;
        }

        //유저가 작성한 매거진 목록
        else if(writer_u_id != undefined){
            console.log('요청 쿼리 : writer_u_id-' + writer_u_id);

            let results = await database.Magazines.listByWriter(index, writer_u_id);
            if(!results) throw new Error('listByWriter 에러 발생 ');

            msg = {
                msg : "success",
                total : results.length,
                index : index,
                query : writer_u_id,
                data : results
            };
            res.json(msg);
            return;
        }

        //유저가 스크랩한 매거진
        else if(arrScrap != undefined){ 
            console.log('요청 쿼리 : arrScrap-' + arrScrap);

            let results = await database.Magazines.listByScrap(index, arrScrap);
            if(!results) throw new Error('listByScrap 에러 발생 ');

            msg = {
                msg : "success",
                total : results.length,
                index : index,
                query : arrScrap,
                data : results
            };
            res.json(msg);
            return;
        }

        //유저가 댓글 달은 매거진
        else if(comment_u_id != undefined){ 
            console.log('요청 쿼리 : comment_u_id-' + comment_u_id);

            let list = await database.Magazines.tmpListComments(index);
            if(!list) throw new Error('tmpListComments 에러 발생 ');

            //var arrId = [];
            var m_id;
            //var comment;
            var results = [];
            var result;
            for(var i=0; i<list.length; i++){
                for(var j=0; j<list[i].comments.length; j++){
                    if((list[i].comments[j].u_id)==comment_u_id){
                        //arrId.push(list[i]._id);
                        m_id = list[i]._id;
                        result = await database.Magazines.listByComment(m_id);
                        if(!result) throw new Error('listByComment 에러 발생 ');

                        console.log('## : '+i+' '+result[0]._id);

                        results.push({
                            '_id' : result[0]._id,
                            'photo' : result[0].thumbnail,
                            'title' : result[0].title,
                            'comment' : list[i].comments[j] 
                        });
                    }
                }
            };

            msg = {
                msg : "success",
                total : results.length,
                index : index,
                query : comment_u_id,
                data : results
            };
            res.json(msg);
            return;
        }

        //전체 리스트 출력
        else{   
            console.log('요청 쿼리 없음');

            let results = await database.Magazines.listAllMagazines(index);
            if(!results) throw new Error('listAllMagazines 에러 발생 ');

            msg = {
                msg : "success",
                total : results.length,
                index : index,
                query : "no",
                data : results
            };
            res.json(msg);
            return;
        }
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'listMagazines Error'});
        return;
    }
}
    

/*
 *<매거진 상세보기>
 */
var detailMagazine = async function(req, res){
    console.log("showMagazines 모듈 안의 detailMaga 호출.");

    var m_id = req.params.m_id;
    console.log('요청 파라미터 : ' + m_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Magazines.detailMagazine(m_id);
        if(!results) throw new Error('detailMagazine 에러 발생 ');

        let comments = await database.Magazines.listComments(m_id);
        if(!comments) throw new Error('listComments 에러 발생 ');

        console.log(results);
        results[0].comments = [];
        var num = comments[0].comments.length;

        if(num != 0){
            if(num == 1){
                results[0].comments.push(comments[0].comments[0]);
            }
            else{
                var sortedRes = comments[0].comments;
                sortedRes.sortOn();
                results[0].comments.push(sortedRes[sortedRes.length-2]);
                results[0].comments.push(sortedRes[sortedRes.length-1]);
            }
        }

        var magazine = {
            msg : "success",
            total : results.length,
            query : m_id,
            numComments : num,
            data : results,
        };

       
        res.json(magazine);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'detailMagazine Error'});
        return;
    }
};


/*
 *<매거진 댓글 목록 보기>
 */
var listComments = async function(req, res){
    console.log("showMagazines 모듈 안의 listComments 호출.");

    var m_id = req.params.m_id;
    console.log('요청 파라미터 : ' + m_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Magazines.listComments(m_id);
        if(!results) throw new Error('listComments 에러 발생 ');

        var sortedRes = results[0].comments;
        console.log(sortedRes);
        sortedRes.sortOn();


        var comments = {
            msg : "success",
            total : results.length,
            param : m_id,
            data : sortedRes
        };
        res.json(comments);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'listComments Error'});
        return;
    }
};


module.exports.listMagazines = listMagazines;
module.exports.detailMagazine = detailMagazine;
module.exports.listComments = listComments;