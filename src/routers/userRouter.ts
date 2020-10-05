import { Router } from 'express';
import { signUp, passportJwtLogin, passportLocalLogin, login, currentUser, updateUser, selectUserPost, selectUserCommentPost, kakao, kakaoValidate, resetPassword, getNoticeList, makeNoticeChecked, renewFcmToken, checkOverlapEmail, getTestResultList, createTestResult, updateTestResult } from '../controllers/userController';
import { verifyJwtToken } from './middleWares/authValidation';
import { testResultUploader } from './middleWares/uploader';

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
        this.router.get('/commentList', verifyJwtToken, selectUserCommentPost);
        
        // 비밀번호 재발급
        this.router.post('/resetPasswrod', verifyJwtToken, resetPassword);
        
        // 알림목록 조회
        this.router.get('/noticeList', verifyJwtToken, getNoticeList);
        
        // 알림 확인
        this.router.post('/makeNoticeChecked', makeNoticeChecked);
        
        // FCM Token 갱신
        this.router.post('/renewFcmToken', verifyJwtToken, renewFcmToken);

        // 이메일 중복 체크
        this.router.post('/checkOverlapEmail', checkOverlapEmail);
        
        // 사용자의 검사 유형 모아보기
        this.router.get('/getTestResultList', verifyJwtToken, getTestResultList);
        
        // 사용자의 검사 유형 결과 등록하기
        this.router.post('/createTestResult/:testId', verifyJwtToken, testResultUploader.array('images', 3), createTestResult);
        
        // 사용자의 검사 유형 결과 수정하기
        this.router.post('/updateTestResult/:testId', verifyJwtToken, testResultUploader.array('images', 3), updateTestResult);
    }
}

const userRouter = new UserRouter();
export default userRouter.router;
