import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';

import User from '../models/User';
import Post, { PostType } from '../models/Post';
import LikePost from '../models/LikePost';
import Comment from '../models/Comment';
import Image from '../models/Image';
import LikeComment from '../models/LikeComment';
import sequelize from 'sequelize';

// POST -> 게시물 생성하기
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const userId: number = user.id;
    const { title, content, type, isAnonymous } = req.body;
    const files: any = req.files;
    try {
        const newPost: Post = await Post.create({
            userId,
            title,
            content,
            type,
            isAnonymous,
        });
        const thisPost: Post | null = await Post.findByPk(newPost.id, { 
            include: [{ 
                model: User, 
                attributes: ['mbti', 'nickname']
            }]
        });
        files.forEach(async (file: any) => await Image.create({ postId: newPost.id, url: file.location }));
        res.status(201).json({ meesage: '성공적으로 게시물이 등록되었습니다.', data: thisPost });
    } catch (err) {
        console.log(err);
        next(err);
    }
};


// PUT -> 게시물 수정하기
export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const userId: number = user.id;
    const { title, content, removeImageIdList } = req.body;
    const { postId } = req.params;
    const files: any = req.files;
    try {
        const post: Post | null = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ message: '해당하는 postId의 게시물이 존재하지 않습니다.' });
        if (post.userId !== userId) return res.status(409).json({ message: '수정권한이 없습니다.' });
        post.title = title;
        post.content = content;
        await post.save();
        removeImageIdList.forEach(async (imageId: string) => await Image.destroy({ where: { id: parseInt(imageId), postId } }));
        files.forEach(async (file: any) => await Image.create({ postId, url: file.location }));
        res.status(201).json({ meesage: '성공적으로 게시물이 수정되었습니다.', data: post });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// DELETE -> 게시물 삭제하기
export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const userId: number = user.id;
    const { postId } = req.params;
    try {
        const post: Post | null = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ message: '해당하는 postId의 게시물이 존재하지 않습니다.' });
        if (post.userId !== userId) return res.status(409).json({ message: '삭제권한이 없습니다.' });
        await Post.destroy({ where: { id: postId } });
        await Image.destroy({ where: { postId } });

        const commentList: Comment[] = await post.getComments();
        commentList.forEach(async (comment: Comment) => {
            const likeCommentList: LikeComment[] = await LikeComment.findAll({ where: { commentId: comment.id }});
            likeCommentList.forEach(async (likeComment: LikeComment) => {
                await likeComment.destroy();
            });
            await comment.destroy();
        });

        const likePostList: LikePost[] = await LikePost.findAll({ where: { postId: post.id }});
        likePostList.forEach(async (likePost: LikePost) => {
            await likePost.destroy();
        });

        res.status(201).json({ meesage: '성공적으로 게시물이 삭제되었습니다.', data: post });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 모든 게시물 목록 조회하기
export const selectPostList = async (req: Request, res: Response, next: NextFunction) => {
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 10;
    const page: number | undefined = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    try {
        // mbti와 keyword가 동시에 넘어올 경우
        if (req.query.keyword && req.query.mbti) {
            const keyword: string = req.query.keyword.toString();
            const mbti: string = req.query.mbti.toString();
            const { count, rows } = await Post.findAndCountAll({ 
                attributes: {
                    include: [[sequelize.literal(`(
                        SELECT COUNT(*)
                            FROM Comments AS comment
                            WHERE
                                comment.postId = Post.id
                    )`), 'commentNum2']]
                },
                limit, 
                offset: limit * (page - 1 ),
                where: {
                    type: PostType.Free,
                    [Op.or]: [
                        { title: { [Op.like]: '%' + keyword + '%' }},
                        { content: { [Op.like]: '%' + keyword + '%' }},
                    ]
                },
                include: [{ 
                    model: User, 
                    attributes: ['nickname', 'mbti'],
                    where: { mbti },
                }, {
                    model: Image,
                    attributes: ['url']
                }],
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json({ meesage: '성공적으로 게시물이 조회되었습니다.', count, data: rows });

        // mbti만 넘어올 경우
        } else if (req.query.mbti && !req.query.keyword) { 
            const mbti: string = req.query.mbti.toString();
            const { count, rows } = await Post.findAndCountAll({ 
                attributes: {
                    include: [[sequelize.literal(`(
                        SELECT COUNT(*)
                            FROM Comments AS comment
                            WHERE
                                comment.postId = Post.id
                    )`), 'commentNum2']]
                },
                limit, 
                offset: limit * (page - 1 ), 
                include: [{ 
                    model: User, 
                    attributes: ['nickname', 'mbti'],
                    where: { mbti }
                }, {
                    model: Image,
                    attributes: ['url']
                }],
                where: { type: PostType.Free },
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json({ meesage: '성공적으로 게시물이 조회되었습니다.', count, data: rows });
        
        // keyword만 넘어올 경우
        } else if (!req.query.mbti && req.query.keyword) { 
            const keyword: string = req.query.keyword.toString();
            const { count, rows } = await Post.findAndCountAll({ 
                attributes: {
                    include: [[sequelize.literal(`(
                        SELECT COUNT(*)
                            FROM Comments AS comment
                            WHERE
                                comment.postId = Post.id
                    )`), 'commentNum2']]
                },
                limit, 
                offset: limit * (page - 1 ), 
                include: [{ 
                    model: User, 
                    attributes: ['nickname', 'mbti'],
                }, {
                    model: Image,
                    attributes: ['url']
                }],
                where: {
                    type: PostType.Free,
                    [Op.or]: [
                        { title: { [Op.like]: '%' + keyword + '%' }},
                        { content: { [Op.like]: '%' + keyword + '%' }},
                    ]
                },
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json({ meesage: '성공적으로 게시물이 조회되었습니다.', count, data: rows });

        // req.query에 limit, page만 있을 경우
        } else { 
            const { count, rows } = await Post.findAndCountAll({ 
                attributes: {
                    include: [[sequelize.literal(`(
                        SELECT COUNT(*)
                            FROM Comments AS comment
                            WHERE
                                comment.postId = Post.id
                    )`), 'commentNum2']]
                },
                limit, 
                offset: limit * (page - 1 ),
                include: [{ 
                    model: User, 
                    attributes: ['nickname', 'mbti'],
                }, {
                    model: Image,
                    attributes: ['url']
                }],
                where: { type: PostType.Free },
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json({ meesage: '성공적으로 게시물이 조회되었습니다.', count, data: rows });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 자유게시판에서 TOP3 게시물 조회하기
export const selectTopThreePostList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postList: Post[] = await Post.findAll({
            where: {
                type: PostType.Free
            },
            include: [{
                model: User,
                attributes: ['nickname', 'mbti']
            }, {
                model: Image,
                attributes: ['url']
            }],
            limit: 3,
            order: [['likes', 'DESC']]
        });
        res.status(200).json({ meesage: '성공적으로 게시물이 조회되었습니다.', data: postList });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 특정 게시물 조회하기
export const selectPost = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const userId: number = user.id;
    const { postId } = req.params;
    try {
        const post: Post | null = await Post.findByPk(postId, {
            include: [{
                model: Image,
                attributes: ['id', 'url']
            }, {
                model: User,
                attributes: ['id', 'nickname', 'mbti']
            }]
        });
        if (post) {
            if (post.userId !== userId) {
                post.views++;
                await post.save();
            }
            const commentNum: number = (await post.getComments()).length;
            const likePost: LikePost | null = await LikePost.findOne({ where: { postId, userId } });
            const isLiked: boolean = !!likePost;
            res.status(200).json({ meesage: '성공적으로 게시물이 조회되었습니다.', data: { isLiked, post: { ...post.toJSON(), commentNum } } }); 
        } else {
            res.status(404).json({ message: '해당하는 postId의 게시물이 존재하지 않습니다.' });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};


// GET -> 특정 게시물의 댓글목록 조회하기
export const getPostCommentList = async (req: Request, res: Response, next: NextFunction) => {
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 10;
    const page: number | undefined = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    const { postId } = req.params;
    try {
        const post: Post | null = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ message: '해당하는 postId의 게시물이 존재하지 않습니다.' });

        const commentList: Comment[] = await post.getComments({
            where: { 
                commentId: null 
            },
            include: [{
                model: Comment,
                separate: true,
                order: [['createdAt', 'DESC']],
            }],
            limit, 
            offset: limit * (page - 1 ),
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({ meesage: '성공적으로 게시물의 댓글목록이 조회되었습니다.', data: commentList }); 
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 게시물 좋아요
export const likePost = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const userId: number = user.id;
    const { postId } = req.params;
    try {
        const post: Post | null = await Post.findByPk(postId);
        if (post) {
            if (post.userId === userId) return res.status(409).json({ message: '자신이 쓴 게시물엔 공감할 수 없습니다.' });
            const result: LikePost | null = await LikePost.findOne({ where: { postId, userId } });
            if (!result) {
                post.likes++;
                await post.save();
                await LikePost.create({ postId, userId });
                res.status(201).json({ message: '성공적으로 해당 게시물에 공감하였습니다.' });
            } else {
                res.status(400).json({ message: '이미 공감을 누른 게시물입니다.' });
            }
        } else {
            res.status(404).json({ message: '해당하는 postId의 게시물이 존재하지 않습니다.' });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 게시물 좋아요 취소
export const dislikePost = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const userId: number = user.id;
    const { postId } = req.params;
    try {
        const post: Post | null = await Post.findByPk(postId);
        if (post) {
            if (post.userId === userId) return res.status(409).json({ message: '자신이 쓴 게시물엔 공감취소할 수 없습니다.' });
            const result: LikePost | null = await LikePost.findOne({ where: { postId, userId } });
            if (!result) {
                res.status(400).json({ message: '아직 공감을 하지 않은 게시물입니다.' });
            } else {
                post.likes--;
                await post.save();
                await LikePost.destroy({ where: { postId, userId } });
                res.status(201).json({ message: '성공적으로 해당 게시물 공감을 취소했습니다.' });
            }
        } else {
            res.status(404).json({ message: '해당하는 postId의 게시물이 존재하지 않습니다.' });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};
