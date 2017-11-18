/**
 * FAQ 스키마 정의 모듈
 */

var SchemaObj = {};

SchemaObj.createSchema = function(mongoose) {

    //FAQ 스키마
    var FaqsSchema = mongoose.Schema({
        title : {type:String, 'default':""},
        content : {type:String, 'default':""},
        date : {type:String, 'default':new Date().toFormat('YYYY.MM.DD HH24:MI:SS')},
    });

    //FAQ 스키마에 인스턴스 메소드 추가
    FaqsSchema.methods = {
        //faq 추가
        addFaq : function(){
            return new Promise((resolve, reject) => {
                var results = this.save();
                resolve(results);
            });
        }
    }


    //FAQ 스키마에 스태틱 메소드 추가
    FaqsSchema.statics = {
        //faq 목록 보기
        listFaqs : function(){
            return new Promise((resolve, reject) => {
                var results = this.find({}, {'date':0});
                resolve(results);
            });
        },

        //faq 삭제 하기
        removeFaq : function(f_id){
            return new Promise((resolve, reject) => {
                var results = this.remove({'_id':f_id});
                resolve(results);
            });
        }
    }

    console.log('FaqsSchema 정의함.');

    return FaqsSchema;
};

//module.exports에 FaqsSchema 객체 직접 할당
module.exports = SchemaObj;