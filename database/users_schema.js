/*
 * 유저 스키마 정의 모듈
 */

require('date-utils');

var SchemaObj = {};

SchemaObj.createSchema = function(mongoose, autoIncrement) {

    var alarms = mongoose.Schema({
        content : {type:String, 'default':""},
        date : {type:String, 'default':new Date().toFormat('YYYY.MM.DD')},
        sortingDate : {type:Date, 'default':Date.now},
        fromId : {type:Number, ref:'Users'}
    });

    //유저 스키마
    var UsersSchema = mongoose.Schema({
        isEditor : {type:Boolean, 'default':false},
        token : {type:String, 'default':""},
        uname : {type:String, 'default':""},
        photo : {type:String, 'default':""},
        alarms : {type:[alarms], 'default':[]}
    });

    UsersSchema.plugin(autoIncrement.plugin, 'Users');

    // alarms.plugin(autoIncrement.plugin, {
    //     model: 'Users',
    //     field : '_id',
    //     startAt : 0,
    //     incrementBy : 1
    // });

    //유저 스키마에 인스턴스 메소드 추가
    UsersSchema.methods = {
        //사용자 추가
        addUser : function(){
            return new Promise((resolve, reject) => {
                var results = this.save();
                resolve(results);
            });
        }
    }


    //유저 스키마에 스태틱 메소드 추가
    UsersSchema.statics = {

        //사용자 정보 보기
        detailUser : function(u_id){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id':u_id}, {'alarms':0});
                resolve(results);
            });
        },

        //사용자 삭제
        removeUser : function(u_id){
            return new Promise((resolve, reject) => {
                var results = this.remove({'_id':u_id});
                resolve(results);
            });
        },

        //사용자 정보 수정
        updateUser : function(u_id, uname, photo){
             return new Promise((resolve, reject) => {
                var results = this.update({'_id' : u_id}, 
                                          {'$set':
                                            {
                                            'uname':uname, 
                                            'photo':photo
                                            }
                                          });
                resolve(results);
            });
        },

        //사용자 닉네임만 수정
        updateUname : function(u_id, uname){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id' : u_id}, 
                                          {'$set':{'uname':uname}});
                resolve(results);
            });
        },

        //알림 목록 리스트
        listAlarms : function(u_id){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id':u_id}, {'alarms':1, '_id':0})
                                  .populate('alarms.fromId', 'uname');
                resolve(results);
            });
        },

        //알림 목록 삭제
        removeAlarm : function(u_id, a_id){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id':u_id}, 
                                          {'$pull':{'alarms':{'_id':a_id}}});
                resolve(results);
            });
        },
        
        //알림 목록 추가
        addAlarm : function(writerId, alarm){
            return new Promise((resolve, reject) => {
                var results = this.update({'_id':writerId}, 
                                          {'$push':{'alarms':alarm}});
                resolve(results);
            });
        }

        
    }

    console.log('UsersSchema 정의함.');

    return UsersSchema;
};

//module.exports에 UsersSchema 객체 직접 할당
module.exports = SchemaObj;