CREATE 
	EVENT ev_woorirang_make_topic
		ON SCHEDULE EVERY 1 MONTH STARTS '2020-10-16 09:00:00'
		ON COMPLETION PRESERVE ENABLE
		COMMENT '매월15일마다 이건어때에서 가장 좋아요를 많이 받은 게시물을 너희랑 게시물 토픽으로 이전한다.'
		DO
			call go_to_topic();
            
select * from information_schema.events;