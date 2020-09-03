import { Router } from 'express';
import { createCommentToPost, createCommentToTopic, deleteComment, likeComment, dislikeComment } from '../controllers/commentController';
import { verifyJwtToken } from './middleWares/authValidation';

class CommentRouter {
    public router: Router;

    constructor () {
        this.router = Router();
        this.routes();
    }

    private routes (): void {
        // 자유게시판 게시물 || 대댓글 달기
        this.router.post('/toPost/:postId', verifyJwtToken, createCommentToPost);
        
        // 논제게시판 게시물 || 대댓글 달기
        this.router.post('/toTopic/:topicId', verifyJwtToken, createCommentToTopic);
        
        // 댓글 삭제하기
        this.router.delete('/:commentId', verifyJwtToken, deleteComment);

        // 댓글 공감하기
        this.router.post('/like/:commentId', verifyJwtToken, likeComment);
        
        // 댓글 공감취소하기
        this.router.post('/dislike/:commentId', verifyJwtToken, dislikeComment);
    }
}

const commentRouter = new CommentRouter();
export default commentRouter.router;
