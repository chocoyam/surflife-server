/*
 * 자유게시판 GET방식을 위한 
 * 라우팅 함수 정의
 */

/*
 * <자유게시판 리스트>
 * 1.자유게시판 전체목록
 * 2.자유게시판 카테고리별 목록
 * 3.자유게시판 검색 결과 목록
 * 4.유저가 작성한 자유게시판 목록
 * 5.유저가 스크랩한 자유게시판 목록
 * 6.유저가 댓글 달은 자유게시판 목록
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
};

var listBoards = async function(req, res){
    console.log('showBoards 모듈 안의 listBoards 호출.');

    var index = req.params.index;
    //쿼리스트링 받기
    var category = req.query.category;
    var key = req.query.key;
    var writer_u_id = req.query.writer_u_id;
    var arrScrap = req.query.arrScrap;
    var comment_u_id = req.query.comment_u_id;

    //db연결
    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    //응답 메세지
    var boards = {};

    try{
        //카테고리별 목록
        if(category != undefined){ 
            console.log('요청 쿼리 : category-' + category);

            let results = await database.Boards.listByCategory(index, category);
            if(!results) throw new Error('listByCategory 에러 발생 ');

            //자유게시판 글에 댓글 리스트 2개만 추가하기 
            var num = [];
            for(var i = 0; i<results.length; i++){
                var b_id = results[i]._id;
                let comments = await database.Boards.listComments(b_id);
                if(!comments) throw new Error('listComments 에러 발생 ');

                results[i].comments = [];
                num[i] = comments[0].comments.length;
               
                if(num[i] != 0){
                    if(num[i] == 1){
                        results[i].comments.push(comments[0].comments[0]);
                    }
                    else{
                        var sortedRes = comments[0].comments;
                        sortedRes.sortOn();
                        results[i].comments.push(sortedRes[sortedRes.length-2]);
                        results[i].comments.push(sortedRes[sortedRes.length-1]);
                    }
                }
            };

            boards = {
                msg : "success",
                total : results.length,
                index : index,
                query : category,
                numComments : num,
                data : results
            };
            res.json(boards);
            return;
        }

        //자유게시판 검색 결과 목록
        else if(key != undefined){
            console.log('요청 쿼리 : key-' + key);

            let results = await database.Boards.listBySearch(index, key);
            if(!results) throw new Error('listBySearch 에러 발생 ');

            //자유게시판 글에 댓글 리스트 2개만 추가하기 
            var num = [];
            for(var i = 0; i<results.length; i++){
                var b_id = results[i]._id;
                let comments = await database.Boards.listComments(b_id);
                if(!comments) throw new Error('listComments 에러 발생 ');

                results[i].comments = [];
                num[i] = comments[0].comments.length;
               
                if(num[i] != 0){
                    if(num[i] == 1){
                        results[i].comments.push(comments[0].comments[0]);
                    }
                    else{
                        var sortedRes = comments[0].comments;
                        sortedRes.sortOn();
                        results[i].comments.push(sortedRes[sortedRes.length-2]);
                        results[i].comments.push(sortedRes[sortedRes.length-1]);
                    }
                }
            };

            boards = {
                msg : "success",
                total : results.length,
                index : index,
                query : key,
                numComments : num,
                data : results
            };
            res.json(boards);
            return;
        }

        //유저가 작성한 게시글 목록
        else if(writer_u_id != undefined){ 
            console.log('요청 쿼리 : writer_u_id-' + writer_u_id);

            let results = await database.Boards.listByWriter(index, writer_u_id);
            if(!results) throw new Error('listByWriter 에러 발생 ');

            boards = {
                msg : "success",
                total : results.length,
                index : index,
                query : writer_u_id,
                data : results
                };
            res.json(boards);
            return;
        }

        //유저가 스크랩한 게시글 목록
        else if(arrScrap != undefined){ 
            console.log('요청 쿼리 : arrScrap-' + arrScrap);

            let results = await database.Boards.listByScrap(index, arrScrap);
            if(!results) throw new Error('listByScrap 에러 발생 ');
            
            boards = {
                msg : "success",
                total : results.length,
                index : index,
                query : arrScrap,
                data : results
            };
            res.json(boards);
            return;
        }

        //유저가 댓글 달은 게시글 목록
        else if(comment_u_id != undefined){ 
            console.log('요청 쿼리 : comment_u_id-' + comment_u_id);

            let list = await database.Boards.tmpListComments(index);
            if(!list) throw new Error('tmpListComments 에러 발생 ');

            var b_id;
            var results = [];
            var result;
            for(var i=0; i<list.length; i++)
                for(var j=0; j<list[i].comments.length; j++){
                    if((list[i].comments[j].u_id)==comment_u_id){
                        b_id = list[i]._id;
                        result = await database.Boards.listByComment(b_id);
                        if(!result) throw new Error('listByComment 에러 발생 ');

                        results.push({
                            '_id' : result[0]._id,
                            'photo' : result[0].photo,
                            'text' : result[0].text,
                            'comment' : list[i].comments[j] 
                        });
                    }
                };

            boards = {
                msg : "success",
                total : results.length,
                index : index,
                query : comment_u_id,
                data : results
            };
            res.json(boards);
            return;
        }

        //전체 리스트 출력
        else{   
            console.log('요청 쿼리 없음');

            let results = await database.Boards.listAllBoards(index);
            if(!results) throw new Error('listAllBoards 에러 발생 ');

            //자유게시판 글에 댓글 리스트 2개만 추가하기 
            var num = [];
            for(var i = 0; i<results.length; i++){
                var b_id = results[i]._id;
                let comments = await database.Boards.listComments(b_id);
                if(!comments) throw new Error('listComments 에러 발생 ');

                results[i].comments = [];
                num[i] = comments[0].comments.length;
               
                if(num[i] != 0){
                    if(num[i] == 1){
                        results[i].comments.push(comments[0].comments[0]);
                    }
                    else{
                        var sortedRes = comments[0].comments;
                        sortedRes.sortOn();
                        results[i].comments.push(sortedRes[sortedRes.length-2]);
                        results[i].comments.push(sortedRes[sortedRes.length-1]);
                    }
                }
            };

            boards = {
                msg : "success",
                total : results.length,
                index : index,
                query : "no",
                numComments : num,
                data : results
            };
            res.json(boards);
            return;
        }
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'listBoards Error'});
        return;
    }
};

/*
 * <유저가 댓글달은 매거진&자유게시판 리스트>
 */
var userCommentsList = async function(req, res){
    console.log('showBoards 모듈 안의 listBoards 호출.');

    var index = req.params.index;
    var u_id = req.params.u_id;
    var perPage = 50;

    //db연결
    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        //자유게시판에서 가져오기
        let listB = await database.Boards.tmpListComments(index);
        if(!listB) throw new Error('tmpListComments 에러 발생 ');

        var b_id;
        var results = [];
        var resultB;
        for(var i=0; i<listB.length; i++)
            for(var j=0; j<listB[i].comments.length; j++){
                if((listB[i].comments[j].u_id)==u_id){
                    b_id = listB[i]._id;
                    resultB = await database.Boards.listByComment(b_id);
                    if(!resultB) throw new Error('listByComment 에러 발생 ');

                    results.push({
                        'type':'커뮤니티',
                        '_id' : resultB[0]._id,
                        'photo' : resultB[0].photo,
                        'title' : resultB[0].text,
                        'sortingDate' : listB[i].comments[j].sortingDate,
                        'comment' : listB[i].comments[j] 
                    });
                }
            };

        //매거진에서 가져오기
        let listM = await database.Magazines.tmpListComments(index);
        if(!listM) throw new Error('tmpListComments 에러 발생 ');

        var m_id;
        var resultM;
        for(var i=0; i<listM.length; i++){
            for(var j=0; j<listM[i].comments.length; j++){
                if((listM[i].comments[j].u_id)==u_id){
                    //arrId.push(list[i]._id);
                    m_id = listM[i]._id;
                    resultM = await database.Magazines.listByComment(m_id);
                    if(!resultM) throw new Error('listByComment 에러 발생 ');

                    results.push({
                        'type':'매거진',
                        '_id' : resultM[0]._id,
                        'photo' : resultM[0].thumbnail,
                        'title' : resultM[0].title,
                        'sortingDate' : listM[i].comments[j].sortingDate,
                        'comment' : listM[i].comments[j] 
                    });
                }
            }
        };

        results.sortOn();

        var data = results.slice(index*perPage, index*perPage+perPage);
        data.reverse();

        msg = {
            msg : "success",
            total : results.length,
            index : index,
            query : u_id,
            data : data
        };
        res.json(msg);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'userCommentsList Error'});
        return;
    }
};



/*
 * <유저가 스크랩한 매거진&자유게시판 리스트>
 */
var userScrapsList = async function(req, res){
    console.log('showBoards 모듈 안의 userScrapsList 호출.');

    var index = req.params.index;
    var perPage = 50;
    var scrapListM = req.body.scrapListM;
    var scrapListB = req.body.scrapListB;

    //db연결
    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        //자유게시판에서 가져오기
        let resultsB = await database.Boards.listByScrap(index, scrapListB);
        if(!resultsB) throw new Error('Boards에서 listByScrap 에러 발생 ');

        var results = [];
        for(var i=0; i<resultsB.length; i++){
            results.push({
                    'type':'커뮤니티',
                    '_id':resultsB[i]._id,
                    "category":resultsB[i].category,
                    'title':resultsB[i].text,
                    "photo":resultsB[i].photo,
                    "sortingDate":resultsB[i].sortingDate
                });
        }
        
        //매거진에서 가져오기
        let resultsM = await database.Magazines.listByScrap(index, scrapListM);
        if(!resultsM) throw new Error('Magazines에서 listByScrap 에러 발생 ');

        for(var i=0; i<resultsM.length; i++){
            results.push({
                    'type':'매거진',
                    '_id':resultsM[i]._id,
                    "u_id":resultsM[i].u_id,
                    'title':resultsM[i].title,
                    "photo":resultsM[i].thumbnail,
                    "sortingDate":resultsM[i].sortingDate
                });
        }

        results.sortOn();

        results = results.slice(index*perPage, index*perPage+perPage);

        msg = {
            msg : "success",
            total : results.length,
            index : index,
            scrapListM : scrapListM,
            scrapListB : scrapListB,
            data : results
        };
        res.json(msg);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'userScrapsList Error'});
        return;
    }
};


/*
 *<게시판 상세보기>
 */
var detailBoard = async function(req, res){
    console.log("showBoards 모듈 안의 detailBoard 호출.");

    var b_id = req.params.b_id;
    console.log('요청 파라미터 : ' + b_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Boards.detailBoard(b_id);
        if(!results) throw new Error('detailBoard 에러 발생 ');

        let comments = await database.Boards.listComments(b_id);
        if(!comments) throw new Error('listComments 에러 발생 ');

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

        var board = {
            msg : "success",
            total : results.length,
            query : b_id,
            numComments : num,
            data : results
        };
        res.json(board);
        return;
    }
    catch(err){
        console.error(err.stack);
        res.status(400).json({msg : 'detailBoard Error'});
        return;
    }
};


/*
 * <자유게시판 댓글 리스트>
 */
var listComments = async function(req, res){
    console.log('showBoards 모듈 안의 listComments 호출.');

    var b_id = req.params.b_id;
    console.log('요청 파라미터 : ' + b_id);

    var database = req.app.get('database');
    if (!database.db)
        res.status(500).json({msg : '데이터베이스 연결 실패'});

    try{
        let results = await database.Boards.listComments(b_id);
        if(!results) throw new Error('listComments 에러 발생 ');

        var comments = {
            msg : "success",
            total : results.length,
            query : b_id,
            data : results
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

module.exports.listBoards = listBoards;
module.exports.userCommentsList = userCommentsList;
module.exports.userScrapsList = userScrapsList;
module.exports.detailBoard = detailBoard;
module.exports.listComments = listComments;