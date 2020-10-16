import { Router } from 'express';
import { createWorldCup, deleteWorldCup, getBestWorldCup, getTotalWorldCupResult, getUserMbtiWorldCupResult, getUserWorldCupResult, getWorldCupById, getWorldCupList, saveWorldCupResult } from '../controllers/worldCupController';
import { verifyJwtToken } from './middleWares/authValidation';
import { worldCupUploader } from './middleWares/uploader';

class WorldCupRouter {
    public router: Router;

    constructor () {
        this.router = Router();
        this.routes();
    }

    private routes (): void {
        // 월드컵 등록
        this.router.post('/', verifyJwtToken, worldCupUploader.array('images', 32), createWorldCup);
        
        // 특정 월드컵에 대한 사용자의 결과 저장
        this.router.post('/result', verifyJwtToken, saveWorldCupResult);
        
        // 월드컵 리스트 조회
        this.router.get('/list', getWorldCupList);
        
        // 베스트 월드컵 조회
        this.router.get('/best', getBestWorldCup);
        
        // 특정 월드컵 조회
        this.router.get('/:worldCupId', verifyJwtToken, getWorldCupById);
        
        // 특정 월드컵 자신의 결과 조회
        this.router.get('/myResult/:worldCupId', verifyJwtToken, getUserWorldCupResult);
        
        // 특정 월드컵 자신의 mbti결과 조회
        this.router.get('/myMbtiResult/:worldCupId', verifyJwtToken, getUserMbtiWorldCupResult);
        
        // 특정 월드컵 전체 통계 결과 조회
        this.router.get('/totalResult/:worldCupId', getTotalWorldCupResult);
        
        // 월드컵 삭제
        this.router.delete('/', verifyJwtToken, deleteWorldCup);
    }
}

const worldCupRouter = new WorldCupRouter();
export default worldCupRouter.router;
