import { Router } from 'express';
import { signUp, passportJwtLogin, passportLocalLogin, login, currentUser, updateUser, selectUserPost, selectUserComment, kakao, kakaoValidate } from '../controllers/userController';
import { verifyJwtToken } from './middleWares/authValidation';

class UserRouter {
    public router: Router;

    constructor () {
        this.router = Router();
        this.routes();
    }

    private routes (): void {
        // 회원가입하기
        this.router.post('/signUp', signUp);
        
        // 로그인하기
        this.router.post('/', passportLocalLogin, login);
        
        // 카카오 인증
        this.router.get('/kakaoValidate', kakaoValidate);

        // 카카오톡 로그인하기
        this.router.post('/kakaoLogin', kakao, login);
        
        // 로그인된 사용자 정보 확인하기
        this.router.get('/current', passportJwtLogin, currentUser);
        
        // 로그인된 사용자 정보 수정하기
        this.router.put('/', verifyJwtToken, updateUser);
        
        // 사용자가 등록한 게시물 목록 조회하기
        this.router.get('/postList', verifyJwtToken, selectUserPost);
        
        // 사용자가 등록한 게시물 목록 조회하기
        this.router.get('/commentList', verifyJwtToken, selectUserComment);
    }
}

const userRouter = new UserRouter();
export default userRouter.router;
