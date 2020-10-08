import { Request, Response, NextFunction } from 'express';

import MbtiContent from '../models/MbtiContent';
import Image from '../models/Image';
import Topic from '../models/Topic';


// GET -> 메인화면에서 현재 너희랑 정보 조회
export const getCurrentTopicMain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const topic: Topic | null = await Topic.findOne({
            attributes: ['id', 'title', 'commentNum', 'createdAt'],
            include: [{
                model: Image,
                attributes: ['id', 'url']
            }],
            order: [['createdAt', 'DESC']],
            limit: 1
        });
        if (!topic) return res.status(404).json({ message: '등록된 토픽이 존재하지 않습니다.' });
        res.status(200).json(topic);
    } catch (err) {
        console.log(err);
        next(err);
    }
};


// GET -> 메인화면에서 명예의 전당 최근 4개 썸네일 조회
export const getTopicHistoryImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const topiocList: Topic[] = await Topic.findAll({ 
            attributes: ['id', 'title', 'createdAt'],
            include: [{
                model: Image,
                attributes: ['url']
            }],
            order: [['createdAt', 'DESC']],
            limit: 5, 
        });
        topiocList.shift();
        res.status(200).json(topiocList);
    } catch (err) {
        console.log(err);
        next(err);
    }
};


// GET -> TODO: 메인화면에서 이건어때
export const getPostTypeTopic = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json();
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 메인화면에서 mbti 관련 컨텐츠 리스트 조회
export const getMbtiContentList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mbtiContentList: MbtiContent[] = await MbtiContent.findAll();
        res.status(200).json(mbtiContentList);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 메인화면에서 mbti 관련 컨텐츠 등록
export const createMbtiContent = async (req: Request, res: Response, next: NextFunction) => {
    const { url } = req.body;
    const file: any = req.file;
    try {
        const data: MbtiContent = await MbtiContent.create({
            url,
            imageUrl: file.location,
        });
        res.status(200).json({ message: '성공적으로 등록되었습니다.', data });
    } catch (err) {
        console.log(err);
        next(err);
    }
};
