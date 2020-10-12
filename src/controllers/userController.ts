import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import axios, { AxiosRequestConfig } from 'axios';
import * as bcrypt from 'bcrypt-nodejs';
import nodemailer from 'nodemailer';

import User, { MBTI } from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';
import Image from '../models/Image';
import { JWT_SECRET, GMAIL_ID, GMAIL_PASSWORD } from '../config/secret';
import Topic from '../models/Topic';
import Notice from '../models/Notice';
import Test from '../models/Test';
import TestResult from '../models/TestResult';

// 이메일 형식 체크
const isValidEmail = (email: string): boolean => {
    const regex = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    return regex.test(email);
};

// 비밀번호 형식 체크
// 6-16자리 영문, 숫자, 특수문자 조합
const isValidPassword = (password: string): boolean => {
    const regex = new RegExp(
        /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{6,16}/
    );
    return regex.test(password);
};

// 이메일과 비밀번호 존재 여부 및 이메일형식 체크
const checkEmailPw = (email: string, password: string) => {
    if (!email) return { mesesage: '이메일을 넣어주세요.' };
    if (!password) return { mesesage: '비밀번호를 넣어주세요.' };
    if (!isValidEmail(email)) return { mesesage: '이메일 양식에 맞게 넣어주세요.' };
    if (!isValidPassword(password)) return { mesesage: '비밀번호는 6-16자리 영문, 숫자, 특수문자 조합이어야 합니다.' };
};

// mbti 체크
const isValidMbti = (mbti: string): boolean => {
    return Object.values(MBTI).includes(mbti);
};

// 랜덤 비밀번호 생성
const makeRandomPassword = (length: number): string => {
    let result: string = '';
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// POST -> passport 로그인
export const passportLocalLogin = passport.authenticate('local');

// jwt 검증하기
export const passportJwtLogin = passport.authenticate('jwt', { session: false });

// POST -> 로그인 이후 세션에 있는 사용자 정보 jwt 토큰으로 발급
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            res.status(409).json({ message: '세션에 사용자가 존재하지 않습니다.' });
        } else {
            const user = req.user as User;
            const token: string = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
            res
                .status(200)
                .json({ token: `Bearer ${token}` });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 카카오 회원 인증하기
export const kakaoValidate  = async (req: Request, res: Response, next: NextFunction)=> {
    const accessToken: string | undefined = req.get('AccessToken');
    if (!accessToken) return res.status(401).json({ message: '토큰을 넣어주세요.' });
    const header: AxiosRequestConfig = { headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    }};
    try {
        const userInfo = await axios.get('https://kapi.kakao.com/v2/user/me', header);
        const exUser: User | null = await User.findOne({ where: { email: userInfo.data.id } });
        if (exUser) res.status(200).json({ message: '이미 회원가입된 카카오 계정의 accessToekn입니다.' });
        else res.status(404).json({ message: '해당 accessToken으로 가입된 회원은 존재하지 않습니다.' });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 카카오톡 로그인하기
export const kakao  = async (req: Request, res: Response, next: NextFunction)=> {
    const { accessToken, nickname, mbti } = req.body;
    if (mbti && !isValidMbti(mbti)) return res.status(409).json({ message: '유효한 mbti타입이 아닙니다.' });
    const header: AxiosRequestConfig = { headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    }};
    try {
        const userInfo = await axios.get('https://kapi.kakao.com/v2/user/me', header);
        const exUser: User | null = await User.findOne({ where: { email: userInfo.data.id } });
        if (exUser) {
            req.user = exUser;
            next();
        } else {
            const userByNickname: User | null = await User.findOne({ where: { nickname } });
            if (userByNickname) return res.status(400).json({ message: '이미 가입된 닉네임 입니다.' });
            const newUser: User = await User.create({ 
                snsId: userInfo.data.id,
                email: userInfo.data.id,
                nickname,
                mbti,
            });
            req.user = newUser;
            next();
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 이메일 중복 확인
export const checkOverlapEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!isValidEmail(email)) return res.status(409).json({ mesesage: '이메일 양식에 맞게 넣어주세요.' });
    try {
        const userByEmail: User | null = await User.findOne({ where: { email } });
        if (userByEmail) return res.status(400).json({ message: '이미 가입된 이메일 입니다.' });
        else return res.status(200).json({ message: '사용가능한 이메일 입니다.' });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 회원가입
export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, mbti, nickname } = req.body;
    // const error = checkEmailPw(email, password);
    // if (error) return res.status(400).json(error);
    // if (!mbti || !isValidMbti(mbti)) return res.status(409).json({ message: '유효한 mbti타입이 아닙니다.' });
    try {
        const userByEmail: User | null = await User.findOne({ where: { email } });
        const userByNickname: User | null = await User.findOne({ where: { nickname } });
        if (userByEmail) return res.status(400).json({ message: '이미 가입된 이메일 입니다.' });
        if (userByNickname) return res.status(400).json({ message: '이미 가입된 닉네임 입니다.' });
        const createdUser: User = await User.create({ email, password, mbti, nickname });
        
        // sequelize로 만들어진 객체는 꼭 .toJSON()을 붙혀서 콘솔찍어야 잘 찍힌다.
        console.log(createdUser.toJSON());
        console.log(createdUser.email);
        return res.json({
            message: '가입에 성공하였습니다.',
            data: {
                id: createdUser.id,
                email: createdUser.email,
                mbti: createdUser.mbti,
                nickname: createdUser.nickname,
            },
        });
    } catch (err) {
        console.log(err);
        next();
    }
};

// GET -> 현재 로그인된 사용자 정보 조회하기
export const currentUser  = async (req: Request, res: Response, next: NextFunction)=> {
    const user: User = req.user as User;
    // const userId: number = user.id;
    // const { id, email, nickname, mbti, createdAt, updatedAt } = user;
    try {
        // 이런 식으로 해당 객체를 db에 저장시키는 save()함수가 잘 작동된다.
        // user.email = 'this is updated email!!';
        // await user.save();
        
        // 이런 식으로 해당 객체를 db에서 삭제시키는 destroy()함수가 잘 작동된다.
        // await user.destroy();

        // 이런 식으로 숫자형 타입의 필드를 더한 후 저장시킬 수 있음.
        // await user.increment('age', { by: 2 });

        // const postNum: number = await Post.count({ where: { userId } });
        // const commentNum: number = await Comment.count({ where: { userId } });
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// PUT -> 현재 로그인된 사용자 정보 수정하기
export const updateUser  = async (req: Request, res: Response, next: NextFunction)=> {
    const { nickname, mbti } = req.body;
    const user: User = req.user as User;
    try {
        const updateUser: [number, User[]] = await User.update({ nickname, mbti }, { where: { id: user.id } });
        if (updateUser[0]) {
            const commentList: Comment[] = await Comment.findAll({ where: { userId: user.id }});
            commentList.forEach(async (comment: Comment) => {
                comment.userNickName = nickname;
                comment.userMbti = mbti;
                await comment.save();
            });
            res.status(201).json({ message: '성공적으로 변경이 완료되었습니다.' });
        } else {
            res.status(404).json({ message: '해당하는 토큰값의 사용자가 존재하지 않습니다.' });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 사용자의 검사 유형 모아보기
export const getTestResultList = async (req: Request, res: Response, next: NextFunction)=> {
    const user: User = req.user as User;
    try {
        const result: TestResult[] = await user.getTestResults({
            include: [{
                model: Test
            }, {
                model: Image
            }]
        });
        res.status(200).json({ result });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 사용자의 검사 유형 결과 등록하기
export const createTestResult = async (req: Request, res: Response, next: NextFunction)=> {
    const user: User = req.user as User;
    const { testId } = req.params;
    const { resultText } = req.body;
    const files: any = req.files;
    try {
        const testResult: TestResult = await TestResult.create({
            userId: user.id,
            testId: parseInt(testId),
            resultText,
        });
        files.forEach(async (file: any) => await Image.create({ testResultId: testResult.id, url: file.location }));
        res.status(201).json({ meesage: '성공적으로 검사 유형 결과가 등록되었습니다.', data: testResult });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 사용자의 검사 유형 결과 수정하기
export const updateTestResult = async (req: Request, res: Response, next: NextFunction)=> {
    const user: User = req.user as User;
    const { testId } = req.params;
    const { resultText, removeImageIdList } = req.body;
    const files: any = req.files;
    try {
        const testResult: TestResult | null = await TestResult.findOne({ where: { userId: user.id, testId } });
        if (!testResult) return res.status(404).json({ meesage: '해당하는 테스트 아이디의 검사 결과가 존재하지 않습니다.' });

        testResult.resultText = resultText;
        await testResult.save();

        removeImageIdList.forEach(async (imageId: string) => await Image.destroy({ where: { id: parseInt(imageId), testResultId: testResult.id } }));
        files.forEach(async (file: any) => await Image.create({ testResultId: testResult.id, url: file.location }));

        res.status(201).json({ meesage: '성공적으로 검사 유형 결과가 수정되었습니다.' });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 사용자가 등록한 게시물 목록 조회하기
export const selectUserPost  = async (req: Request, res: Response, next: NextFunction)=> {
    const user: User = req.user as User;
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 10;
    const page: number | undefined = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    try {
        const postList: Post[] = await user.getPosts({ 
            include: [{ 
                model: Image,
                attributes: ['url'] 
            }],
            limit, 
            offset: limit * (page - 1 ),
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ message: '성공적으로 조회되었습니다.', data: postList });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 내가 댓글 쓴 게시물 목록 조회
export const selectUserCommentPost  = async (req: Request, res: Response, next: NextFunction)=> {
    const user: User = req.user as User;
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 10;
    const page: number | undefined = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    try {
        const currentTopic: Topic | null = await Topic.findOne({
            order: [['createdAt', 'DESC']],
            limit: 1
        });
        if (!currentTopic) return res.status(404).json({ message: '등록된 토픽이 존재하지 않습니다.' });
        const commentList: Comment[] = await user.getComments({ 
            include: [{
                model: Post,
                include: [{ 
                    model: Image,
                    attributes: ['url'] 
                }]
            }, {
                model: Topic,
                include: [{ 
                    model: Image,
                    attributes: ['url'] 
                }]
            }],
        });
        
        const temp1 = commentList.filter(comment => comment.postId !== null)
            .filter((value, index, array) => 
                array.findIndex((element) => element.postId === value.postId) === index);
        const temp2 = commentList.filter(comment => comment.topicId !== null)
            .filter((value, index, array) => 
                array.findIndex((element) => element.topicId === value.topicId) === index);
                
        const result = [...temp1, ...temp2].map((comment: any) => {
            return comment.Post
                ? { ...comment.Post.toJSON(), category: 'post' } 
                :             comment.Topic.id === currentTopic.id 
                    ? { ...comment.Topic.toJSON(), category: 'topic' } 
                    :                 { ...comment.Topic.toJSON(), category: 'prevTopic' };
        });
        result.sort((a, b) => b.createdAt - a.createdAt);
        const finalResult = result.slice((page - 1) * limit, page * limit);
        res.status(200).json({ message: '성공적으로 조회되었습니다.', data: finalResult });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 비밀번호 재발급
export const resetPassword  = async (req: Request, res: Response, next: NextFunction)=> {
    const user: User = req.user as User;
    const { email } = req.body;
    try {
        const newPassword: string = makeRandomPassword(6);
        const salt: string = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(newPassword, salt);
        // user.password = newPassword;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            // host를 gmail로 설정
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: GMAIL_ID, // generated ethereal user
                pass: GMAIL_PASSWORD, // generated ethereal password
            },
        });
        await transporter.sendMail({
            from: `"우리랑 팀" <${GMAIL_ID}>`, // sender address
            to: email, // list of receivers
            subject: '<우리랑> 비밀번호 재발급 ', // Subject line
            text: `재발급된 비밀번호는 ${newPassword} 입니다.`, // plain text body
        });
        
        await user.save();
        res.status(200).json({ message: '성공적으로 비밀번호가 재발급되었습니다.' });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 알림목록 조회
export const getNoticeList  = async (req: Request, res: Response, next: NextFunction)=> {
    const user: User = req.user as User;
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 10;
    const page: number | undefined = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    try {
        const { count, rows } = await Notice.findAndCountAll({
            where: {
                userId: user.id
            },
            include: [{
                model: User,
                attributes: ['nickname', 'mbti']
            }],
            limit, 
            offset: limit * (page - 1 ),
        });

        res.status(200).json({ meesage: '성공적으로 알림목록이 조회되었습니다.', count, data: rows });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 알림 확인
export const makeNoticeChecked  = async (req: Request, res: Response, next: NextFunction)=> {
    const { noticeId } = req.body;
    try {
        const notice = await Notice.findByPk(noticeId);
        if (!notice) return res.status(404).json({ message: '해당하는 아이디의 알림이 존재하지 않습니다.' });
        else {
            notice.isChecked = true;
            await notice.save();
            res.status(201).json({ message: '알림이 체크되었습니다.' });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> FCM Token 갱신
export const renewFcmToken  = async (req: Request, res: Response, next: NextFunction)=> {
    const user: User = req.user as User;
    const { fcmToken } = req.body;
    try {
        user.fcmToken = fcmToken;
        const result: User = await user.save();
        if (result) return res.status(201).json({ message: '성공적으로 토큰이 갱신되었습니다.' });
        else return res.status(404).json({ message: '토큰 갱신 과정에서 에러가 발생했습니다.' });
    } catch (err) {
        console.log(err);
        next(err);
    }
};
