/*
 * 설정
 */

var serverPort = 3000;
var dbUrl = 'mongodb://localhost:27017/testSURFLIFE';



module.exports = {
    server_port: serverPort,
	db_url: dbUrl,

	db_schemas: [
		{file:'./users_schema', collection:'Users', schemaName:'UsersSchema', modelName:'Users'}
        ,{file:'./magazines_schema', collection:'Magazines', schemaName:'MagazinesSchema', modelName:'Magazines'}
		,{file:'./boards_schema', collection:'Boards', schemaName:'BoardsSchema', modelName:'Boards'}
		,{file:'./spots_schema', collection:'Spots', schemaName:'SpotsSchema', modelName:'Spots'}
        ,{file:'./notices_schema', collection:'Notices', schemaName:'NoticesSchema', modelName:'Notices'}
        ,{file:'./faqs_schema', collection:'Faqs', schemaName:'FaqsSchema', modelName:'Faqs'}
	],
	
	route_info: [
		//자유게시판
		 {file:'./editBoards', path:'/boards', method:'addBoard', type:'post', multipart:'photo'}
		,{file:'./editBoards', path:'/board/:b_id', method:'removeBoard', type:'delete'}
		,{file:'./editBoards', path:'/board/:b_id', method:'updateBoard', type:'put', multipart:'photo'}
		,{file:'./editBoards', path:'/board/like/:b_id/:u_id', method:'addLike', type:'put'}
		,{file:'./editBoards', path:'/board/unlike/:b_id/:u_id', method:'removeLike', type:'put'}
		,{file:'./editBoards', path:'/board/comments/:b_id', method:'addComment', type:'post'}
		,{file:'./editBoards', path:'/board/comment/:b_id/:c_id', method:'removeComment', type:'delete'}
		,{file:'./editBoards', path:'/board/comment/:b_id/:c_id', method:'updateComment', type:'put'}

		,{file:'./showBoards', path:'/boards/:index', method:'listBoards', type:'get'}
		,{file:'./showBoards', path:'/board/:b_id', method:'detailBoard', type:'get'}
		,{file:'./showBoards', path:'/board/comments/:b_id', method:'listComments', type:'get'}
		
		,{file:'./showBoards', path:'/userComments/:index/:u_id', method:'userCommentsList', type:'get'}
		,{file:'./showBoards', path:'/userScraps/:index', method:'userScrapsList', type:'get'}

		//매거진
		,{file:'./editMagazines', path:'/magazines', method:'addMagazine', type:'post', multipart:'photos'}
		,{file:'./editMagazines', path:'/magazine/:m_id', method:'removeMagazine', type:'delete'}
		,{file:'./editMagazines', path:'/magazine/:m_id', method:'updateMagazine', type:'put', multipart:'photos'}
		,{file:'./editMagazines', path:'/magazine/like/:m_id/:u_id', method:'addLike', type:'put'}
		,{file:'./editMagazines', path:'/magazine/unlike/:m_id/:u_id', method:'removeLike', type:'put'}
		,{file:'./editMagazines', path:'/magazine/comments/:m_id', method:'addComment', type:'post'}
		,{file:'./editMagazines', path:'/magazine/comment/:m_id/:c_id', method:'removeComment', type:'delete'}
		,{file:'./editMagazines', path:'/magazine/comment/:m_id/:c_id', method:'updateComment', type:'put'}

		,{file:'./showMagazines', path:'/magazines/:index', method:'listMagazines', type:'get'}
		,{file:'./showMagazines', path:'/magazine/:m_id', method:'detailMagazine', type:'get'}
		,{file:'./showMagazines', path:'/magazine/comments/:m_id', method:'listComments', type:'get'}


		//사용자 계정
		,{file:'./users', path:'/users', method:'addUser', type:'post', multipart:'photo'}
		,{file:'./users', path:'/user/:u_id', method:'removeUser', type:'delete'}
		,{file:'./users', path:'/user/:u_id', method:'updateUser', type:'put', multipart:'photo'}
		,{file:'./users', path:'/user/alarm/:u_id/:a_id', method:'removeAlarm', type:'delete'}
	
		,{file:'./users', path:'/user/:u_id', method:'detailUser', type:'get'}
		,{file:'./users', path:'/user/alarms/:u_id', method:'listAlarms', type:'get'}


		//스팟 환경 정보
		,{file:'./spots', path:'/spots', method:'addSpot', type:'post'}
		,{file:'./spots', path:'/spots', method:'listSpots', type:'get'}
		,{file:'./spots', path:'/spots/savedata', method:'saveSpotData', type:'get'}
		,{file:'./spots', path:'/spots/bookmark', method:'listBookmarkSpots', type:'post'}
		,{file:'./spots', path:'/spot/:s_id', method:'detailSpot', type:'get'}


		//공지사항
		,{file:'./notices', path:'/notices', method:'addNotice', type:'post', multipart:'photos'}
		,{file:'./notices', path:'/notice/:n_id', method:'removeNotice', type:'delete'}

		,{file:'./notices', path:'/notices', method:'listNotices', type:'get'}


		//FAQ
		,{file:'./faqs', path:'/faqs', method:'addFaq', type:'post', multipart:'photos'}
		,{file:'./faqs', path:'/faq/:f_id', method:'removeFaq', type:'delete'}

		,{file:'./faqs', path:'/faqs', method:'listFaqs', type:'get'}
	]

    
}