import { Request, Response, NextFunction } from 'express';

import User from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';
import LikeComment from '../models/LikeComment';
import Topic from '../models/Topic';
import Notice from '../models/Notice';
import admin, { notificationOption } from '../config/firebase';

// POST -> 자유게시판 게시물 || 대댓글달기
// TODO: FIREBASE 푸쉬알림 제대로 가는지 확인
export const createCommentToPost = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const userId: number = user.id;
    const { postId } = req.params;
    const { commentId } = req.query;
    const { content, isAnonymous } = req.body;
    let comment: Comment;
    try {
        const post: Post | null = await Post.findByPk(postId);
        if (!post) return res.status(404).json({ meesage: '해당하는 아이디의 게시물이 존재하지 않습니다.' });
        
        const postUser: User | null = await User.findByPk(post.userId);
        if (!postUser) return res.status(404).json({ meesage: '게시물을 작성한 사용자가 존재하지 않습니다.' });

        const isMyComment: boolean = userId === post.userId;
        if (commentId) {
            const originalComment: Comment | null = await Comment.findByPk(parseInt(commentId.toString()));
            if (!originalComment) return res.status(404);
            
            const commentUser: User | null = await User.findByPk(originalComment.userId);
            if (!commentUser) return res.status(404);

            const registrationTokenOfCommentUser: string = commentUser.fcmToken;
            const messageToCommentUser = {
                data: {
                    title: '우리랑 대댓글 알림',
                    body: `${isAnonymous ? '익명' : user.nickname}님이 내 댓글에 댓글을 남기셨어요!`,
                }
            };
            
            comment = await Comment.create({ userId, postId: parseInt(postId), commentId: parseInt(commentId.toString()), content, isAnonymous, userNickName: user.nickname, userMbti: user.mbti });
            if (!isMyComment) await Notice.create({ userId: post.userId, commenterId: userId, topicId: null, postId, message: `${isAnonymous ? '익명' : user.nickname}님이 내 댓글에 댓글을 남기셨어요!`, isAnonymous });
            
            const isMyCommentOfComment: boolean = userId === commentUser.id;
            if (!isMyCommentOfComment) await admin.messaging().sendToDevice(registrationTokenOfCommentUser, messageToCommentUser, notificationOption);
        } else {
            comment = await Comment.create({ userId, postId: parseInt(postId), content, isAnonymous, userNickName: user.nickname, userMbti: user.mbti });
            if (!isMyComment) await Notice.create({ userId: post.userId, commenterId: userId, topicId: null, postId, message: `${isAnonymous ? '익명' : user.nickname}님이 내 글에 댓글을 남기셨어요!`, isAnonymous });
        }
        post.commentNum++;
        await post.save();
        
        const registrationTokenOfPostUser: string = postUser.fcmToken;
        const messageToPostUser = {
            data: {
                title: '우리랑 댓글 알림',
                body: `${isAnonymous ? '익명' : user.nickname}님이 내 글에 댓글을 남기셨어요!`,
            }
        };
        await admin.messaging().sendToDevice(registrationTokenOfPostUser, messageToPostUser, notificationOption);

        res.status(201).json({ messag: '성공적으로 댓글이 달렸습니다.', data: comment });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 논제게시판 게시물 || 대댓글달기
// TODO: Topic은 테스트해야함.
// TODO: FIREBASE 푸쉬알림 제대로 가는지 확인
export const createCommentToTopic = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const userId: number = user.id;
    const { topicId } = req.params;
    const { commentId } = req.query;
    const { content, isAnonymous } = req.body;
    let comment: Comment;
    try {
        const topic: Topic | null = await Topic.findByPk(topicId);
        if (!topic) return res.status(404).json({ meesage: '해당하는 아이디의 게시물이 존재하지 않습니다.' });
        
        const topicUser: User | null = await User.findByPk(topic.userId);
        if (!topicUser) return res.status(404).json({ meesage: '토픽을 작성한 사용자가 존재하지 않습니다.' });
        
        const isMyComment: boolean = userId === topic.userId;
        if (commentId) {
            const originalComment: Comment | null = await Comment.findByPk(parseInt(commentId.toString()));
            if (!originalComment) return res.status(404);
            
            const commentUser: User | null = await User.findByPk(originalComment.userId);
            if (!commentUser) return res.status(404);

            comment = await Comment.create({ userId, topicId: parseInt(topicId), commentId: parseInt(commentId.toString()), content, isAnonymous, userNickName: user.nickname, userMbti: user.mbti });
            if (!isMyComment) await Notice.create({ userId: topic.userId, commenterId: userId, topicId, postId: null, message: `${isAnonymous ? '익명' : user.nickname}님이 내 댓글에 댓글을 남기셨어요!`, isAnonymous });

            const registrationTokenOfCommentUser: string = commentUser.fcmToken;
            const messageToCommentUser = {
                data: {
                    title: '우리랑 대댓글 알림',
                    body: `${isAnonymous ? '익명' : user.nickname}님이 내 댓글에 댓글을 남기셨어요!`,
                }
            };
            const isMyCommentOfComment: boolean = userId === commentUser.id;
            if (!isMyCommentOfComment) await admin.messaging().sendToDevice(registrationTokenOfCommentUser, messageToCommentUser, notificationOption);
        } else {
            comment = await Comment.create({ userId, topicId: parseInt(topicId), content, isAnonymous, userNickName: user.nickname, userMbti: user.mbti });
            if (!isMyComment) await Notice.create({ userId: topic.userId, commenterId: userId, topicId, postId: null, message: `${isAnonymous ? '익명' : user.nickname}님이 내 글에 댓글을 남기셨어요!`, isAnonymous });
        }

        topic.commentNum++;
        await topic.save();

        res.status(201).json({ messag: '성공적으로 댓글이 달렸습니다.', data: comment });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// DELETE -> 댓글 삭제하기
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const userId: number = user.id;
    const { commentId } = req.params;
    try {
        const comment: Comment | null = await Comment.findByPk(commentId);
        if (!comment) return res.status(404).json({ message: '해당하는 commentId의 댓글이 존재하지 않습니다.' });
        if (comment.userId !== userId) return res.status(409).json({ message: '삭제권한이 없습니다.' });
        const commentOfComment: Comment[] = await comment.getComments();
        if (commentOfComment.length) { // 대댓글이 있을 때
            comment.content = '삭제된 댓글입니다.';
            await comment.save();
        } else { // 대댓글이 없을 때
            await comment.destroy();
        }
        const post: Post | null = await Post.findByPk(comment.postId);
        if (post) {
            post.commentNum--;
            await post.save();
        }
        res.status(201).json({ meesage: '성공적으로 댓글이 삭제되었습니다.', data: comment });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 댓글 좋아요
export const likeComment = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const userId: number = user.id;
    const { commentId } = req.params;
    try {
        const comment: Comment | null = await Comment.findByPk(commentId);
        if (comment) {
            if (comment.userId === userId) return res.status(409).json({ message: '자신이 쓴 댓글엔 공감할 수 없습니다.' });
            const result: LikeComment | null = await LikeComment.findOne({ where: { commentId, userId } });
            if (!result) {
                comment.likes++;
                await comment.save();
                await LikeComment.create({ commentId, userId });
                res.status(201).json({ message: '성공적으로 해당 댓글에 공감하였습니다.' });
            } else {
                res.status(400).json({ message: '이미 공감을 누른 댓글입니다.' });
            }
        } else {
            res.status(404).json({ message: '해당하는 commentId의 댓글이 존재하지 않습니다.' });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 댓글 좋아요 취소
export const dislikeComment = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const userId: number = user.id;
    const { commentId } = req.params;
    try {
        const comment: Comment | null = await Comment.findByPk(commentId);
        if (comment) {
            if (comment.userId === userId) return res.status(409).json({ message: '자신이 쓴 댓글엔 공감취소할 수 없습니다.' });
            const result: LikeComment | null = await LikeComment.findOne({ where: { commentId, userId } });
            if (!result) {
                res.status(400).json({ message: '아직 공감을 하지 않은 댓글입니다.' });
            } else {
                comment.likes--;
                await comment.save();
                await LikeComment.destroy({ where: { commentId, userId } });
                res.status(201).json({ message: '성공적으로 해당 댓글 공감을 취소했습니다.' });
            }
        } else {
            res.status(404).json({ message: '해당하는 commentId의 댓글이 존재하지 않습니다.' });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 자신이 쓴 댓글인지 여부 조회
export const isMyComment = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const { commentId } = req.params;
    try {
        const comment: Comment | null = await Comment.findByPk(commentId);
        if (!comment) return res.status(404).json({ message: '해당하는 commentId의 댓글이 존재하지 않습니다.' });

        res.status(200).json({ isMyComment: user.id === comment.userId });
    } catch (err) {
        console.log(err);
        next(err);
    }
};
