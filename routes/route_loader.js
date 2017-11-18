/**
 * 라우팅 모듈을 로딩하여 설정
 * 
 * 라우팅 모듈 파일에 대한 정보는 config.js의 route_info 배열에 등록함
 *
 * @date 2017-05-25
 * @author Minsu
 * 
 */

var route_loader = {};

var config = require('../config/config');


route_loader.init = function(app, router) {
	console.log('route_loader.init 호출됨.');
	return initRoutes(app, router);
};



var multer  = require('multer')
var upload = multer({ dest: 'uploads/' });

// route_info에 정의된 라우팅 정보 처리
function initRoutes(app, router) {
	var infoLen = config.route_info.length;
	console.log('설정에 정의된 라우팅 모듈의 수 : %d', infoLen);
 
	for (var i = 0; i < infoLen; i++) {
		var curItem = config.route_info[i];
			
		// 모듈 파일에서 모듈 불러옴
		var curModule = require(curItem.file);
		console.log('%s 파일에서 모듈정보를 읽어옴.', curItem.file);
		
		//  라우팅 처리
		if (curItem.type == 'get'){
            router.route(curItem.path).get(curModule[curItem.method]);
		}
		else if (curItem.type == 'post') {
			if ( curItem.multipart) 
				router.route(curItem.path).post(upload.array(curItem.multipart, 10), curModule[curItem.method]);
			else 
				router.route(curItem.path).post(curModule[curItem.method]);
		}
		else if(curItem.type == 'put'){
			if ( curItem.multipart) 
				router.route(curItem.path).put(upload.array(curItem.multipart, 10), curModule[curItem.method]);
			else
				router.route(curItem.path).put(curModule[curItem.method]);
		}
		else if(curItem.type == 'delete'){
			router.route(curItem.path).delete(curModule[curItem.method]);
		}
		
		
		console.log('라우팅 모듈 [%s]이(가) 설정됨.', curItem.method);
	}

    // 라우터 객체 등록
    app.use('/', router);
}

module.exports = route_loader;

