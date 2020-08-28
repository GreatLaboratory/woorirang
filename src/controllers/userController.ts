import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import axios, { AxiosRequestConfig } from 'axios';

import User, { MBTI } from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';
import { JWT_SECRET } from '../config/secret';

// 이메일형식 체크
const isValidEmail = (email: string): boolean => {
    const regex = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    return regex.test(email);
};

// 이메일과 비밀번호 존재 여부 및 이메일형식 체크
const checkEmailPw = (email: string, password: string) => {
    if (!email) {
        return { mesesage: '이메일을 넣어주세요.' };
    }
    if (!password) {
        return { mesesage: '비밀번호를 넣어주세요.' };
    }
    if (!isValidEmail(email)) {
        return { mesesage: '이메일 양식에 맞게 넣어주세요.' };
    }
};

// mbti 체크
const isValidMbti = (mbti: string): boolean => {
    return Object.values(MBTI).includes(mbti);
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
        const { email } = userInfo.data.kakao_account;
        const exUser: User | null = await User.findOne({ where: { email, snsId: userInfo.data.id } });
        if (exUser) {
            req.user = exUser;
            next();
        } else {
            const newUser: User = await User.create({ 
                snsId: userInfo.data.id,
                email,
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

// POST -> 회원가입
export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, mbti, nickname } = req.body;
    const error = checkEmailPw(email, password);
    if (error) return res.status(400).json(error);
    if (!mbti || !isValidMbti(mbti)) return res.status(409).json({ message: '유효한 mbti타입이 아닙니다.' });
    try {
        const user: User | null = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({ message: '이미 가입된 이메일 입니다.' });
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
    const userId: number = user.id;
    const { id, email, nickname, mbti, createdAt, updatedAt } = user;
    try {
        // 이런 식으로 해당 객체를 db에 저장시키는 save()함수가 잘 작동된다.
        // user.email = 'this is updated email!!';
        // await user.save();
        
        // 이런 식으로 해당 객체를 db에서 삭제시키는 destroy()함수가 잘 작동된다.
        // await user.destroy();

        // 이런 식으로 숫자형 타입의 필드를 더한 후 저장시킬 수 있음.
        // await user.increment('age', { by: 2 });

        const postNum: number = await Post.count({ where: { userId } });
        const commentNum: number = await Comment.count({ where: { userId } });
        res.status(200).json({ id, email, nickname, mbti, createdAt, updatedAt, postNum, commentNum });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// PUT -> 현재 로그인된 사용자 정보 수정하기
export const updateUser  = async (req: Request, res: Response, next: NextFunction)=> {
    const { email } = req.body;
    if (!isValidEmail(email)) return res.status(400).json({ mesesage: '이메일 양식에 맞게 넣어주세요.' });

    const user: User = req.user as User;
    const userId: number = user.id;
    try {
        const updateUser: [number, User[]] = await User.update({ email }, { where: { id: userId } });
        if (updateUser[0]) {
            res.status(200).json({ message: '성공적으로 변경이 완료되었습니다.' });
        } else {
            res.status(404).json({ message: '해당하는 토큰값의 사용자가 존재하지 않습니다.' });
        }
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

// GET -> 내가 쓴 댓글 목록 조회
export const selectUserComment  = async (req: Request, res: Response, next: NextFunction)=> {
    const user: User = req.user as User;
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 10;
    const page: number | undefined = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    try {
        const commentList: Comment[] = await user.getComments({ 
            limit, 
            offset: limit * (page - 1 ),
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ message: '성공적으로 조회되었습니다.', data: commentList });
    } catch (err) {
        console.log(err);
        next(err);
    }
};
