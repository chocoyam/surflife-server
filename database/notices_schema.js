/*
 * 공지사항 스키마 정의 모듈
 */

require('date-utils');

var SchemaObj = {};

SchemaObj.createSchema = function(mongoose) {

    //공지사항 스키마
    var NoticesSchema = mongoose.Schema({
        title : {type:String, 'default':""},
        date : {type:String, 'default':new Date().toFormat('YYYY.MM.DD')},
        content : {type:String, 'default':""}
    });

    //공지사항 스키마에 인스턴스 메소드 추가
    NoticesSchema.methods = {
        //공지사항 추가
        addNotice : function(){
            return new Promise((resolve, reject) => {
                var results = this.save();
                resolve(results);
            });
        }
    }

    //공지사항 스키마에 스태틱 메소드 추가
    NoticesSchema.statics = {
        //공지사항 목록 보기
        listNotices : function(){
            return new Promise((resolve, reject) => {
                var results = this.find();
                resolve(results);
            });
        },

        //공지사항 삭제 하기
        removeNotice : function(n_id){
            return new Promise((resolve, reject) => {
                var results = this.remove({'_id':n_id});
                resolve(results);
            });
        }

    }


    console.log('NoticesSchema 정의함.');

    return NoticesSchema;
};

//module.exports에 NoticesSchema 객체 직접 할당
module.exports = SchemaObj;