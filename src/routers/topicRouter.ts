import { Router } from 'express';
import { verifyJwtToken } from './middleWares/authValidation';
import { getCurrentTopic, getTopicById, getTopicCandidateList, getTopicCommentList, getTopicHistoryList, createTopicByAdmin } from '../controllers/topicController';
import { postUploader } from './middleWares/uploader';

class TopicRouter {
    public router: Router;

    constructor () {
        this.router = Router();
        this.routes();
    }

    private routes (): void {
        // 관리자가 토픽 게시하기
        this.router.post('/', postUploader.array('images', 10), createTopicByAdmin);

        // 현재 너희랑에 올라가있는 토픽 조회하기
        this.router.get('/current', getCurrentTopic);

        // 역대 너희랑 토픽들 목록 조회하기
        this.router.get('/history', getTopicHistoryList);
        
        // 이건어때에서 전체 게시물 조회하기
        this.router.get('/list', verifyJwtToken, getTopicCandidateList);

        // 특정 토픽 조회하기
        this.router.get('/:topicId', getTopicById);

        // 토픽의 댓글목록 조회하기
        this.router.get('/commentList/:topicId', verifyJwtToken, getTopicCommentList);
    }
}

const topicRouter = new TopicRouter();
export default topicRouter.router;
