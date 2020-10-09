import { Request, Response, NextFunction } from 'express';

import User from '../models/User';
import Post, { PostType } from '../models/Post';
import Comment from '../models/Comment';
import Image from '../models/Image';
import Topic from '../models/Topic';
import LikeComment from '../models/LikeComment';

// POST -> 관리자가 토픽 게시하기
export const createTopicByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title } = req.body;
        const files: any = req.files;
        try {
            const newTopic: Topic = await Topic.create({
                title,
            });
            files.forEach(async (file: any) => await Image.create({ topicId: newTopic.id, url: file.location }));
            res.status(201).json({ meesage: '성공적으로 토픽이 등록되었습니다.', data: newTopic });
        } catch (err) {
            console.log(err);
            next(err);
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 현재 너희랑에 올라가있는 토픽 조회하기 → 토픽내용 + 베스트3댓글
export const getCurrentTopic = async (req: Request, res: Response, next: NextFunction) => {
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 4;
    try {
        const topic: Topic | null = await Topic.findOne({
            include: [{
                model: User,
                attributes: ['nickname', 'mbti', 'id']
            }, {
                model: Image
            }],
            order: [['createdAt', 'DESC']],
            limit: 1
        });
        if (!topic) res.status(404).json({ message: '등록된 토픽이 존재하지 않습니다.' });
        else {
            const commentList: Comment[] = await Comment.findAll({
                where: {
                    topicId: topic.id
                },
                include: [{
                    model: User,
                    attributes: ['nickname', 'mbti', 'id']
                }],
                limit,
                order: [['likes', 'DESC']]
            });
            res.status(200).json({ message: '성공적으로 토픽이 조회되었습니다.', data: { topic, commentList } });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 특정 토픽 조회하기 → 토픽내용 + 베스트3댓글
export const getTopicById = async (req: Request, res: Response, next: NextFunction) => {
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 4;
    const { topicId } = req.params;
    try {
        const topic: Topic | null = await Topic.findByPk(topicId, {
            include: [{
                model: User,
                attributes: ['nickname', 'mbti', 'id']
            }]
        });
        if (!topic) res.status(404).json({ message: '해당하는 아이디의 토픽이 존재하지 않습니다.' });
        else {
            const commentList: Comment[] = await Comment.findAll({
                where: {
                    topicId
                },
                include: [{
                    model: User,
                    attributes: ['nickname', 'mbti', 'id']
                }],
                limit,
                order: [['likes', 'DESC']]
            });
            res.status(200).json({ message: '성공적으로 토픽이 조회되었습니다.', data: { topic, commentList } });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 토픽의 댓글목록 조회하기 + mbti필터링
export const getTopicCommentList = async (req: Request, res: Response, next: NextFunction) => {
    const { topicId } = req.params;
    const user: User = req.user as User;
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 10;
    const page: number | undefined = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    try {
        if (req.query.mbti) {
            const mbti: string = req.query.mbti.toString();
            const rows = await Comment.findAll({ 
                limit, 
                offset: limit * (page - 1 ),
                where: {
                    topicId,
                    commentId: null,
                    userMbti: mbti,
                },
                include: [{ 
                    model: Comment,
                }],
                order: [['createdAt', 'DESC'], [Comment, 'createdAt', 'DESC']]
            });
            const result = [];
            for await (const comment of rows) {
                const realComment: any = comment;
                const like = await LikeComment.findOne({ where: { commentId: comment.id, userId: user.id } });
                if (realComment.Comments.length !== 0) {
                    const temp = [];
                    for await (const commentOfComment of realComment.Comments) {
                        const like2 = await LikeComment.findOne({ where: { commentId: commentOfComment.id, userId: user.id } });
                        temp.push({...commentOfComment.toJSON(), isLiked: !!like2});
                    }
                    // temp.sort((a, b) => b.createdAt - a.createdAt);
                    result.push({...realComment.toJSON(), Comments: temp, isLiked: !!like});
                    continue;
                }
                result.push({...realComment.toJSON(), isLiked: !!like});
                
            }

            res.status(200).json({ meesage: '성공적으로 댓글목록이 조회되었습니다.', data: result });
        } else {
            const rows = await Comment.findAll({ 
                limit, 
                offset: limit * (page - 1 ),
                where: {
                    topicId,
                    commentId: null,
                },
                include: [{ 
                    model: Comment,
                }],
                order: [['createdAt', 'DESC'], [Comment, 'createdAt', 'DESC']]
            });

            const result = [];
            for await (const comment of rows) { //  근데 이렇게 하면 똑같은 바깥에 있는 like 할당할 때의 쿼리문이 2번씩 됨. -> 낭비
                const realComment: any = comment;
                const like = await LikeComment.findOne({ where: { commentId: comment.id, userId: user.id } });
                if (realComment.Comments.length !== 0) {
                    const temp = [];
                    for await (const commentOfComment of realComment.Comments) {
                        const like2 = await LikeComment.findOne({ where: { commentId: commentOfComment.id, userId: user.id } });
                        temp.push({...commentOfComment.toJSON(), isLiked: !!like2});
                    }
                    // temp.sort((a, b) => b.createdAt - a.createdAt);
                    result.push({...realComment.toJSON(), Comments: temp, isLiked: !!like});
                    continue;
                }
                result.push({...realComment.toJSON(), isLiked: !!like});
                
            }

            res.status(200).json({ meesage: '성공적으로 댓글목록이 조회되었습니다.', data: result });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 역대 너희랑 토픽들 목록(명예의 전당) 조회하기 + 최신순/인기순 정렬
export const getTopicHistoryList = async (req: Request, res: Response, next: NextFunction) => {
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 10;
    const page: number | undefined = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    try {
        const { count, rows } = await Topic.findAndCountAll({ 
            limit, 
            offset: limit * (page - 1 ),
            include: [{ 
                model: User, 
                attributes: ['nickname', 'mbti', 'id'],
            }, {
                model: Image,
                attributes: ['url']
            }],
            order: [['createdAt', 'DESC']]
        });
        if (page === 1) rows.shift();
        if (req.query.sort) {
            rows.sort((a: Topic, b: Topic) => b.commentNum - a.commentNum );
            res.status(200).json({ meesage: '성공적으로 명예의 전당 게시물이 조회되었습니다.', count: count - 1, data: rows });
        } else {
            res.status(200).json({ meesage: '성공적으로 명예의 전당 게시물이 조회되었습니다.', count: count - 1, data: rows });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 이건어때에서 전체 게시물 조회하기 + mbti필터링
export const getTopicCandidateList = async (req: Request, res: Response, next: NextFunction) => {
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 10;
    const page: number | undefined = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    try {
        if (req.query.mbti) {
            const mbti: string = req.query.mbti.toString();
            const { count, rows } = await Post.findAndCountAll({ 
                limit, 
                offset: limit * (page - 1 ),
                where: {
                    type: PostType.Topic,
                },
                include: [{ 
                    model: User, 
                    attributes: ['nickname', 'mbti', 'id'],
                    where: { mbti },
                }, {
                    model: Image,
                    attributes: ['url']
                }],
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json({ meesage: '성공적으로 이건어때 게시물이 조회되었습니다.', count, data: rows });
        } else {
            if (req.query.sort) {
                const { count, rows } = await Post.findAndCountAll({ 
                    limit, 
                    offset: limit * (page - 1 ),
                    where: {
                        type: PostType.Topic,
                    },
                    include: [{ 
                        model: User, 
                        attributes: ['nickname', 'mbti', 'id'],
                    }, {
                        model: Image,
                        attributes: ['url']
                    }],
                    order: [['likes', 'DESC']]
                });
                res.status(200).json({ meesage: '성공적으로 이건어때 게시물이 조회되었습니다.', count, data: rows });
            } else {
                const { count, rows } = await Post.findAndCountAll({ 
                    limit, 
                    offset: limit * (page - 1 ),
                    where: {
                        type: PostType.Topic,
                    },
                    include: [{ 
                        model: User, 
                        attributes: ['nickname', 'mbti', 'id'],
                    }, {
                        model: Image,
                        attributes: ['url']
                    }],
                    order: [['createdAt', 'DESC']]
                });
                res.status(200).json({ meesage: '성공적으로 이건어때 게시물이 조회되었습니다.', count, data: rows });
            }
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};
