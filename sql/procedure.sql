DELIMITER $$
DROP PROCEDURE  IF EXISTS go_to_topic;
 
CREATE PROCEDURE go_to_topic()
 
BEGIN
	/* 이건 어때의 likes가 가장 높은 Post DB는 삭제되고 해당 내용으로 너희랑의 Topic DB으로 생성 */
    INSERT INTO woorirang_dev.Topics (userId, title, isAnonymous, createdAt, updatedAt) 
	VALUES ((SELECT userId FROM woorirang_dev.Posts WHERE type='topic' ORDER BY likes DESC LIMIT 1),
			(SELECT title FROM woorirang_dev.Posts WHERE type='topic' ORDER BY likes DESC LIMIT 1),
			(SELECT isAnonymous FROM woorirang_dev.Posts WHERE type='topic' ORDER BY likes DESC LIMIT 1),
            now(),
            now());
            
	UPDATE woorirang_dev.Images 
		SET topicId = (SELECT id FROM woorirang_dev.Topics WHERE title = (SELECT title FROM woorirang_dev.Posts WHERE type='topic' ORDER BY likes DESC LIMIT 1)) 
		WHERE postId = (SELECT id FROM woorirang_dev.Posts WHERE type='topic' ORDER BY likes DESC LIMIT 1);
        
	UPDATE woorirang_dev.Images 
		SET postId = null 
		WHERE postId = (SELECT id FROM woorirang_dev.Posts WHERE type='topic' ORDER BY likes DESC LIMIT 1);
        
	DELETE FROM woorirang_dev.Posts WHERE type='topic' ORDER BY likes DESC LIMIT 1;
END $$
 
DELIMITER ;
