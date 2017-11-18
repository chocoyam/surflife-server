/*
 * 매거진 스키마 정의 모듈
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

    //매거진 스키마
    var MagazinesSchema = mongoose.Schema({
        title : {type:String, 'default':""},
        u_id : {type:Number, ref:'Users'},
        date : {type:String, 'default':new moment().tz("Asia/Seoul").format('YYYY.MM.DD')},
        sortingDate : {type:Date, 'default':Date.now},
        thumbnail : {type:String, 'default':""},
        texts:{type:Array, 'default':[]},
        photos:{type:Array, 'default':[]},
        //video:{type:String, 'default':""}
        likes : {type:Array, 'default':[]},
        comments : {type:[comments], 'default':[]}
    });

    MagazinesSchema.plugin(autoIncrement.plugin, 'Magazines');

    // comments.plugin(autoIncrement.plugin,
    // {
    //     model: 'Magazines',
    //     field : 'c_id',
    //     startAt : 0,
    //     incrementBy : 1
    // }
    // );


    //매거진 스키마에 인스턴스 메소드 추가
    MagazinesSchema.methods = {
      
        //매거진 쓰기
        addMagazine : function(){
            return new Promise((resolve, reject) => {
                var results = this.save();
                resolve(results);
            });
        }
    }


    //매거진 스키마에 스태틱 메소드 추가
    MagazinesSchema.statics = {
    
        //매거진 전체 목록
        listAllMagazines : function(index){
            return new Promise((resolve, reject) => {
                var results = this.find({}, {'title':1, 'u_id':1, 'thumbnail':1})
                                  .populate('u_id', 'uname')
                                  .sort({'sortingDate':-1})
                                  .skip(index*perPage)
                                  .limit(perPage);
                resolve(results);
            });
        },

        //매거진 상세보기
        detailMagazine : function(m_id){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id':m_id}, {'comments':0, 'sortingDate':0})
                                  .populate('u_id', 'uname photo')
                resolve(results);
            });
        },

        //매거진 검색 결과 목록
        listBySearch : function(index, key){
            return new Promise((resolve, reject) => {
                var results = this.find({'title' : {"$regex":key, "$options":"ix"}},
                                        {'title':1, 'u_id':1, 'thumbnail':1})
                                  .populate('u_id', 'uname')
                                  .sort({'sortingDate':-1})
                                  .skip(index*perPage)
                                  .limit(perPage);
                resolve(results);
            });
        },

        //유저가 작성한 매거진 목록
        listByWriter : function(index, u_id){
            return new Promise((resolve, reject) => {
                var results =  this.find({'u_id':u_id}, {'title':1, 'u_id':1, 'thumbnail':1})
                                   .populate('u_id', 'uname')
                                   .sort({'sortingDate':-1})
                                   .skip(index*perPage)
                                   .limit(perPage);
                resolve(results);
            });
        },

        //유저가 스크랩한 매거진 목록
        listByScrap : function(index, arrId){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id':arrId}, {'title':1, 'u_id':1, 'thumbnail':1, 'sortingDate':1})
                                  .populate('u_id', 'uname')
                                  .sort({'sortingDate':-1});
                                  //.skip(index*perPage)
                                  //.limit(perPage);
                resolve(results);
            });
        },
    
        //유저가 댓글 달은 매거진 목록
        listByComment : function(m_id){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id':m_id}, {'title':1,'thumbnail':1})
                                  .populate('u_id', 'uname');
                                  //.skip(index*perPage)
                                  //.limit(perPage);
                resolve(results);
            });
        },
            tmpListComments : function(){
                return new Promise((resolve, reject) => {
                    var results = this.find({}, {'comments':1, '_id':1})
                                      .sort({'sortingDate':-1});
                    resolve(results);
                });
            },
        
        //댓글 목록보기
        listComments : function(m_id){
            return new Promise((resolve, reject) => {
                var results =  this.find({'_id':m_id}, {'comments':1, '_id':0})
                                   .populate('comments.u_id', 'uname photo');
                resolve(results);
            });
        },

        //매거진 삭제
        removeMagazine : function(m_id){
            return new Promise((resolve, reject) => {
                var results = this.remove({'_id':m_id}, function(err, result){
                         resolve(results);
                });
            });
        },

        //매거진 모두 수정
        updateMagazineAll : function(m_id, title, thumb, texts, photos){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id' : m_id}, 
                                          {'$set':
                                            { 
                                            'title':title,
                                            'thumbnail':thumb,
                                            'texts':texts,
                                            'photos':photos
                                            }
                                          });
                resolve(results);
            });
        },

        //매거진 사진 빼고 수정
        updateMagazine : function(m_id, title, texts){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id' : m_id}, 
                                          {'$set':
                                            { 
                                            'title':title,
                                            'texts':texts
                                            }
                                          });
                resolve(results);
            });
        },

        //좋아요 추가
        addLike : function(m_id, u_id){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id':m_id}, 
                                          {'$push':{'likes':u_id}});
                resolve(results);
            });
        },

        //좋아요 취소
        removeLike : function(m_id, u_id){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id':m_id},
                                          {'$pull':{'likes':u_id}});
                resolve(results);
            })
        },

        //댓글 쓰기
        addComment : function(m_id, comment){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id':m_id},
                                          {'$push':{'comments':comment}});
                resolve(results);
            })
        },

        //댓글 삭제
        removeComment : function(m_id, c_id){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id':m_id},
                                          {'$pull':{'comments':{'_id':c_id}}});
                resolve(results);
            })
        },

        //댓글 수정
        updateComment : function(m_id, c_id, content){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id':m_id}, 
                                          {'comments':{'content':content}},
                                          {});
                resolve(results);
            })
        },

        //글쓴이 _id 찾기
        getWriterId : function(m_id){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id':m_id}, {'u_id':1, '_id':0});
                resolve(results);
            })
        }
       
    }

    console.log('MagazinesSchema 정의함.');
    return MagazinesSchema;
};

module.exports = SchemaObj;