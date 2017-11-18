/*
 * 서핑스팟 스키마 정의 모듈
 */

var SchemaObj = {};

SchemaObj.createSchema = function(mongoose, autoIncrement) {

    //서핑스팟 스키마
    var SpotsSchema = mongoose.Schema({
        spotName : {type:String},
        addr : {type:String},
        coordinates : {type:String},
        spotImage : {type:String, 'default':""},
        config : {type:Object, 'default':{}},
        data : {type:Object, 'default':""}
    });

    SpotsSchema.plugin(autoIncrement.plugin, {
        model: 'Spots',
        field : '_id',
        startAt : 0,
        incrementBy : 1
    });


    //서핑스팟 스키마에 인스턴스 메소드 추가       
    SpotsSchema.methods = {
        //서핑스팟 추가
        addSpot : function(){
            return new Promise((resolve, reject) => {
                var results = this.save();
                resolve(results);
            });
        }
    }


    //서핑스팟 스키마에 스태틱 메소드 추가
    SpotsSchema.statics = {
        //스팟 위도 경도 얻기
        getCoordinates : function(){
            return new Promise((resolve, reject) => {
                var results = this.find({}, {'coordinates':1});
                resolve(results);
            });
        },

        //스팟 환경 정보 저장
        saveSpotData : function(s_id, config, data){
             return new Promise((resolve, reject) => {
                var results = this.update({'_id':s_id},
                                          {'config':config, 'data':data});
                resolve(results);
            });
        },

         //서핑스팟 환경정보 상세 보기
        detailSpot : function(s_id){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id':s_id}, 
                                        {'spotName':1, 'data':1, 'addr':1, 'spotImage':1});
                resolve(results);
            });
        },

        //스팟 환경정보 목록 보기
        listSpots : function(){
            return new Promise((resolve, reject) => {
                var results = this.find({}, {'spotName':1, 'addr':1, 'data':1});
                resolve(results);
            });
        },

        //스팟 검색 결과 목록 보기
        searchSpots : function(key){
            return new Promise((resolve, reject) => {
                var results = this.find({$or:[{'spotName': {"$regex":key, "$options":"ix"}},
                                               {'addr':{"$regex":key, "$options":"ix"}}]}, 
                                         {'spotName':1, 'addr':1});
                resolve(results);
            });
        },

        //즐겨찾기한 스팟 목록 보기
        bookmarkSpots : function(arrBookmark){
            return new Promise((resolve, reject) => {
                var results = this.find({'_id' : arrBookmark}, {'spotName':1, 'addr':1, 'data':1});
                resolve(results);
            });
        }
    }

    console.log('SpotsSchema 정의함.');
    return SpotsSchema;
};

//module.exports에 SpotsSchema 객체 직접 할당
module.exports = SchemaObj;