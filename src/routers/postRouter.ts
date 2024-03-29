import { Router } from 'express';
import { createPost, updatePost, deletePost, selectPostList, selectPost, likePost, dislikePost, selectTopThreePostList, getPostCommentList } from '../controllers/postController';
import { verifyJwtToken } from './middleWares/authValidation';
import { postUploader } from './middleWares/uploader';

class UserRouter {
    public router: Router;

    constructor () {
        this.router = Router();
        this.routes();
    }

    private routes (): void {
        // 게시물 등록하기
        this.router.post('/', verifyJwtToken, postUploader.array('images', 10), createPost);
        
        // 게시물 수정하기
        this.router.put('/:postId', verifyJwtToken, postUploader.array('images', 10), updatePost);
        
        // 게시물 삭제하기
        this.router.delete('/:postId', verifyJwtToken, deletePost);
        
        // 모든 게시물 목록 조회하기
        this.router.get('/list', selectPostList);
        
        // 자유게시판에서 TOP3 게시물 조회하기
        this.router.get('/bestTop3list', selectTopThreePostList);
        
        // 특정 게시물 조회하기
        this.router.get('/:postId', verifyJwtToken, selectPost);
        
        // 특정 게시물 조회하기
        this.router.get('/commentList/:postId', getPostCommentList);
        
        // 게시물 공감하기
        this.router.post('/like/:postId', verifyJwtToken, likePost);
        
        // 게시물 공감취소하기
        this.router.post('/dislike/:postId', verifyJwtToken, dislikePost);
    }
}

const userRouter = new UserRouter();
export default userRouter.router;
