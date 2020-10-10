import { Router } from 'express';
import { getTopicHistoryImages, getCurrentTopicMain, getMbtiContentList, getPostTypeTopic, createMbtiContent } from '../controllers/mainController';
import { mbtiContentUploader } from './middleWares/uploader';

class MainRouter {
    public router: Router;

    constructor () {
        this.router = Router();
        this.routes();
    }

    private routes (): void {
        // 메인화면에서 현재 너희랑 정보 조회
        this.router.get('/currentTopic', getCurrentTopicMain);
        
        // 메인화면에서 명예의 전당 최근 4개 썸네일 조회
        this.router.get('/topicHistoryImages', getTopicHistoryImages);
        
        // TODO: 메인화면에서 이건어때
        this.router.get('/', getPostTypeTopic);
        
        // 메인화면에서mbti 관련 컨텐츠 리스트 조회
        this.router.get('/mbtiContentList', getMbtiContentList);
        
        // 메인화면에서mbti 관련 컨텐츠 등록
        this.router.post('/mbtiContent', mbtiContentUploader.single('image'), createMbtiContent);
    }
}

const mainRouter = new MainRouter();
export default mainRouter.router;
