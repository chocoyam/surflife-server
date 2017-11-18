/**
 * 자유게시판 스키마 정의 모듈
 */

require('date-utils');
var moment = require('moment-timezone');

var SchemaObj = {};
var perPage = 50;

SchemaObj.createSchema = function(mongoose, autoIncrement) {
    var comments = mongoose.Schema({
        u_id : {type:Number, ref:'Users'},
        content : {type:String, 'default':""},
        date : {type:String, 'default':new moment().tz("Asia/Seoul").format('YYYY.MM.DD')},
        sortingDate : {type:Date, 'default':Date.now}
    });
    
    //자유게시판 스키마
    var BoardsSchema = mongoose.Schema({
        u_id : {type:Number, ref:'Users'},
        date : {type:String, 'default':new moment().tz("Asia/Seoul").format('YYYY.MM.DD')},
        sortingDate : {type:Date, 'default':Date.now},
        category : {type:String, 'default':'친목'}, //친목, 질문, 후기
        photo:{type:String, 'default':""},
        text:{type:String, 'default':""},
        //video:{type:String, 'default':""},
        likes : {type:Array, 'default':[]},
        comments : {type:[comments], 'default':[]}
    });

    BoardsSchema.plugin(autoIncrement.plugin, {
        model: 'Boards',
        field : '_id',
        startAt : 0,
        incrementBy : 1
    });

    //자유게시판 스키마에 인스턴스 메소드 추가
    BoardsSchema.methods = {

        //게시판 글 쓰기
        addBoard : function(){
            return new Promise((resolve, reject) => {
                var results = this.save();
                resolve(results);
            });
        }
        
    }


    //자유게시판 스키마에 스태틱 메소드 추가
    BoardsSchema.statics = {
        
        //자유게시판 전체 목록
        listAllBoards : function(index){
            return new Promise((resolve, reject) => {
                var results = this.find({}, {'comments':0, 'sortingDate':0})
                                  .populate('u_id', 'uname photo')
                                  .sort({'sortingDate':-1})
                                  .skip(index*perPage)
                                  .limit(perPage);
                resolve(results);
            });
        },

        //자유게시판 상세 보기
        detailBoard : function(b_id){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id':b_id}, {'comments':0, 'sortingDate':0})
                                  .populate('u_id', 'uname photo');
                resolve(results);
            });
        },

        //자유게시판 카테고리별 목록
        listByCategory : function(index, category){
            return new Promise((resolve, reject) => {
                var results =  this.find({'category' : category}, {'comments':0, 'sortingDate':0})
                                   .populate('u_id', 'uname photo')
                                   .sort({'sortingDate':-1})
                                   .skip(index*perPage)
                                   .limit(perPage);
                resolve(results);
            });
        },

        //자유게시판 검색 결과 목록
        listBySearch : function(index, key){
            return new Promise((resolve, reject) => {
                var results = this.find({'text' : {"$regex":key, "$options":"ix"}}, {'comments':0, 'sortingDate':0})
                                  .populate('u_id', 'uname photo')
                                  .sort({'sortingDate':-1})
                                  .skip(index*perPage)
                                  .limit(perPage);
                resolve(results);
            });
        },

        //유저가 작성한 게시글 목록
        listByWriter : function(index, u_id){
            return new Promise((resolve, reject) => {
                var results =  this.find({'u_id':u_id}, {'category':1, 'text':1, 'photo':1})
                                   .sort({'sortingDate':-1})
                                   .skip(index*perPage)
                                   .limit(perPage);
                resolve(results);
            });
        },

        //유저가 스크랩한 게시글 목록
        listByScrap : function(index, arrId){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id':arrId}, {'category':1, 'text':1, 'photo':1, 'sortingDate':1})
                                  .sort({'sortingDate':-1});
                                 // .skip(index*perPage)
                                 // .limit(perPage);
                resolve(results);
            });
        },

        //유저가 댓글 달은 게시글 목록
        listByComment : function(b_id){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id':b_id}, {'text':1, 'photo':1}) 
                resolve(results);
            });
        },
            tmpListComments : function(){
                return new Promise((resolve, reject) => {
                    var results = this.find({}, {comments:1, _id:1})
                                      .sort({'sortingDate':-1});
                                      
                    resolve(results);
                });
            },

        //댓글 목록 보기
        listComments : function(b_id){
            return new Promise((resolve, reject) => {
                var results =  this.find({'_id':b_id}, {comments:1, _id:0})
                                   .populate('comments.u_id', 'uname photo');
                resolve(results);
            });
        },

        //게시판 글 삭제
        removeBoard : function(b_id){
            return new Promise((resolve, reject) => {
                var results = this.remove({'_id':b_id}, function(err, result){
                         resolve(results);
                });
            });
        },

        //게시판 글 모두 수정
        updateBoardAll : function(b_id, category, photo, text){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id' : b_id}, 
                                          {'$set':
                                            {
                                            'category':category, 
                                            'photo':photo,
                                            'text':text
                                            }
                                          });
                resolve(results);
            });
        },

        //게시판 글 사진 빼고 수정
        updateBoard : function(b_id, category, text){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id' : b_id}, 
                                          {'$set':
                                            {
                                            'category':category, 
                                            'text':text
                                            }
                                          });
                resolve(results);
            });
        },

        //좋아요 추가
        addLike : function(b_id, u_id){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id':b_id}, 
                                          {'$push':{'likes':u_id}});
                resolve(results);
            });
        },

        //좋아요 취소
        removeLike : function(b_id, u_id){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id':b_id},
                                          {'$pull':{'likes':u_id}});
                resolve(results);
            })
        },

        //댓글 쓰기
        addComment : function(b_id, comment){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id':b_id},
                                          {'$push':{'comments':comment}});
                resolve(results);
            })
        },

        //댓글 삭제
        removeComment : function(b_id, c_id){
             return new Promise((resolve, reject) => {
                var results = this.update({'_id':b_id},
                                          {'$pull':{'comments':{'_id':c_id}}});
                resolve(results);
            })
        },

        //댓글 수정
        updateComment : function(b_id, c_id, content){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id':m_id, 'comments':{'_id':c_id}}, 
                                          {'comments':{'content':content}});
                resolve(results);
            })
        },

        //글쓴이 _id 찾기
        getWriterId : function(b_id){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id':b_id}, {'u_id':1, '_id':0});
                resolve(results);
            })
        }
    }

    console.log('BoardsSchema 정의함.');
    return BoardsSchema;
};

//module.exports에 BoardsSchema 객체 직접 할당
module.exports = SchemaObj;