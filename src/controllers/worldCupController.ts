import { Request, Response, NextFunction } from 'express';

import User from '../models/User';
import WorldCup from '../models/WorldCup';
import WorldCupCandidate from '../models/WorldCupCandidate';
import WorldCupResult from '../models/WorldCupResult';
import sequelize from 'sequelize';

// POST -> 월드컵 등록
export const createWorldCup = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const { roundNum, title, description, candidateNameList } = req.body;
    const files: any = req.files;
    try {
        const newWorldCup: WorldCup = await WorldCup.create({
            userId: user.id,
            roundNum,
            title,
            description,
        });

        files.forEach(async (file: any, index: number) => {
            await WorldCupCandidate.create({ 
                worldCupId: newWorldCup.id,
                imageUrl: file.location,
                title: candidateNameList[index],
            });
        });

        res.status(201).json({ message: '정상적으로 월드컵이 등록되었습니다.', data: newWorldCup });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// POST -> 특정 월드컵에 대한 사용자의 결과 저장하기
export const saveWorldCupResult = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const { worldCupCandidateId, worldCupId } = req.body;
    try {
        const selectedCandidate: WorldCupCandidate | null = await WorldCupCandidate.findByPk(worldCupCandidateId);
        if (!selectedCandidate) return res.status(404).json({ message: '해당하는 월드컵 후보가 존재하지 않습니다.' });
        
        const exWorldCupResult: WorldCupResult | null = await WorldCupResult.findOne({ where: { userId: user.id, worldCupId } });
        if (exWorldCupResult) {
            exWorldCupResult.worldCupCandidateId = worldCupCandidateId;
            await exWorldCupResult.save();
            res.status(201).json({ message: '정상적으로 결과가 수정되었습니다.' });
        } else {
            await WorldCupResult.create({
                userId: user.id,
                worldCupId,
                worldCupCandidateId: selectedCandidate.id,
            });
            res.status(201).json({ message: '정상적으로 결과가 저장되었습니다.' });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 월드컵 리스트 조회하기
export const getWorldCupList = async (req: Request, res: Response, next: NextFunction) => {
    const limit: number | undefined = req.query.limit ? parseInt(req.query.limit.toString(), 10) : 10;
    const page: number | undefined = req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
    try {
        const result: WorldCup[] = await WorldCup.findAll({
            attributes: {
                include: [[sequelize.literal(`(
                    SELECT COUNT(*)
                        FROM WorldCupResults AS worldCupResult
                        WHERE
                            worldCupResult.worldCupId = WorldCup.id
                )`), 'joinNummmmm']]
            },
            include: [{
                model: User,
                attributes: ['nickname', 'mbti'],
            }, {
                model: WorldCupCandidate,
                attributes: { 
                    include: [[sequelize.literal(`(
                        SELECT COUNT(*)
                            FROM WorldCupResults AS worldCupResult
                            WHERE
                                worldCupResult.worldCupCandidateId = WorldCupCandidate.id
                    )`), 'voteNum']]
                },
                separate: true,
                limit: 3,
                order: [[sequelize.literal('voteNum'), 'DESC']]
            }],
            limit, 
            offset: limit * (page - 1 ),
            order: req.query.sort ? [[sequelize.literal('joinNummmmm'), 'DESC']] : [['createdAt', 'DESC']]
        });

        res.status(200).json({ message: '정상적으로 월드컵목록이 조회되었습니다.', data: result });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 가장 참여수가 많은 베스트 월드컵 정보 조회
export const getBestWorldCup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result: WorldCup[] = await WorldCup.findAll({
            attributes: {
                include: [[sequelize.literal(`(
                    SELECT COUNT(*)
                        FROM WorldCupResults AS worldCupResult
                        WHERE
                            worldCupResult.worldCupId = WorldCup.id
                )`), 'joinNummmmm']]
            },
            include: [{
                model: User,
                attributes: ['nickname', 'mbti'],
            }, {
                model: WorldCupCandidate,
                attributes: { 
                    include: [[sequelize.literal(`(
                        SELECT COUNT(*)
                            FROM WorldCupResults AS worldCupResult
                            WHERE
                                worldCupResult.worldCupCandidateId = WorldCupCandidate.id
                    )`), 'voteNum']]
                },
                separate: true,
                limit: 1,
                order: [[sequelize.literal('voteNum'), 'DESC']]
            }],
            limit: 1, 
            order: [[sequelize.literal('joinNummmmm'), 'DESC']]
        });

        res.status(200).json({ message: '정상적으로 월드컵목록이 조회되었습니다.', data: result[0] });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 특정 월드컵 조회
export const getWorldCupById = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const { worldCupId } = req.params;
    try {
        const isFirst: WorldCupResult | null = await WorldCupResult.findOne({ where: { userId: user.id, worldCupId } });
        const worldCup: WorldCup | null = await WorldCup.findByPk(worldCupId, {
            attributes: {
                include: [[sequelize.literal(`(
                    SELECT COUNT(*)
                        FROM WorldCupResults AS worldCupResult
                        WHERE
                            worldCupResult.worldCupId = WorldCup.id
                )`), 'joinNummmmm']]
            },
            include: [{
                model: WorldCupCandidate
            }, {
                model: User,
                attributes: ['nickname', 'mbti'],
            }]
        });
        if (!worldCup) return res.status(404).json({ message: '해당하는 월드컵이 존재하지 않습니다.' });
        res.status(200).json({ message: '정상적으로 월드컵목록이 조회되었습니다.', data: { ...worldCup.toJSON(), isFirst: !isFirst } });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 특정 월드컵 자신의 결과
export const getUserWorldCupResult = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const { worldCupId } = req.params;
    try {
        const worldCup: any = await WorldCup.findByPk(worldCupId, {
            attributes: {
                include: [[sequelize.literal(`(
                    SELECT COUNT(*)
                        FROM WorldCupResults AS worldCupResult
                        WHERE
                            worldCupResult.worldCupId = WorldCup.id
                )`), 'joinNummmmm']]
            },
        });
        if (!worldCup) return res.status(404).json({ message: '해당하는 월드컵이 존재하지 않습니다.' });

        const myResult: any = await WorldCupResult.findOne({ 
            where: { 
                userId: user.id, 
                worldCupId 
            },
            include: [{
                model: WorldCupCandidate
            }]
        }); 
        if (!myResult) return res.status(404).json({ message: '해당 월드컵에 아직 참여하지 않습니다.' });
        
        const candidateResultList: any = await WorldCupCandidate.findAll({
            where: {
                worldCupId,
            },
            attributes: { 
                include: [[sequelize.literal(`(
                    SELECT COUNT(*)
                        FROM WorldCupResults AS worldCupResult
                        WHERE
                            worldCupResult.worldCupCandidateId = WorldCupCandidate.id
                )`), 'voteNum']]
            },
            order: [[sequelize.literal('voteNum'), 'DESC']],
        });
        const rank: number = candidateResultList.findIndex((candidate: WorldCupCandidate) => candidate.id === myResult.WorldCupCandidate.id ) + 1;
        
        res.status(200).json({ 
            message: '정상적으로 결과가 조회되었습니다.', 
            data: { 
                ...myResult.toJSON(), 
                rank,
                ratio: Math.round(candidateResultList[rank - 1].toJSON().voteNum / worldCup.toJSON().joinNummmmm * 100)
            }
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 특정 월드컵 자신의 mbti결과 조회
export const getUserMbtiWorldCupResult = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const { worldCupId } = req.params;
    try {
        // 현재 결과를 보려는 월드컵 (참여수가 포함되어있음)
        const worldCup: any = await WorldCup.findByPk(worldCupId, {
            attributes: {
                include: [[sequelize.literal(`(
                    SELECT COUNT(*)
                        FROM WorldCupResults AS worldCupResult
                        WHERE
                            worldCupResult.worldCupId = WorldCup.id
                )`), 'joinNummmmm']]
            },
        });
        if (!worldCup) return res.status(404).json({ message: '해당하는 월드컵이 존재하지 않습니다.' });

        const candidateResultList: WorldCupCandidate[] = await WorldCupCandidate.findAll({
            where: {
                worldCupId,
            },
            include: [{
                model: WorldCupResult,
                attributes: ['id'],
                include: [{
                    model: User,
                    attributes: ['id', 'mbti'],
                    where: { mbti: user.mbti }
                }]
            }],
        });
        const result = candidateResultList.map((candidate: any) => ({ ...candidate.toJSON(), voteNum: candidate.WorldCupResults.length })).sort((a, b) => b.voteNum - a.voteNum);

        const totalCandidateResultList: any = await WorldCupCandidate.findAll({
            where: {
                worldCupId,
            },
            attributes: { 
                include: [[sequelize.literal(`(
                    SELECT COUNT(*)
                        FROM WorldCupResults AS worldCupResult
                        WHERE
                            worldCupResult.worldCupCandidateId = WorldCupCandidate.id
                )`), 'voteNum']]
            },
            order: [[sequelize.literal('voteNum'), 'DESC']],
        });
        const rank: number = totalCandidateResultList.findIndex((candidate: WorldCupCandidate) => candidate.id === result[0].id ) + 1;

        res.status(200).json({ 
            message: '정상적으로 결과가 조회되었습니다.', 
            data: { 
                ...result[0], // 사용자의 mbti와 같은 사용자들이 가장 많이 뽑은 후보
                rank,
                ratio: Math.round(totalCandidateResultList[rank - 1].toJSON().voteNum / worldCup.toJSON().joinNummmmm * 100)
            }
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// GET -> 특정 월드컵 전체 통계 결과 조회(+ mbti필터링)
export const getTotalWorldCupResult = async (req: Request, res: Response, next: NextFunction) => {
    const { worldCupId } = req.params;
    try {
        const worldCup: any = await WorldCup.findByPk(worldCupId, {
            attributes: {
                include: [[sequelize.literal(`(
                    SELECT COUNT(*)
                        FROM WorldCupResults AS worldCupResult
                        WHERE
                            worldCupResult.worldCupId = WorldCup.id
                )`), 'joinNummmmm']]
            },
        });
        if (!worldCup) return res.status(404).json({ message: '해당하는 월드컵이 존재하지 않습니다.' });

        if (req.query.mbti) {
            const mbti: string = req.query.mbti.toString();
            const mbtiCandidateList: WorldCupCandidate[] = await WorldCupCandidate.findAll({
                where: {
                    worldCupId,
                },
                include: [{
                    model: WorldCupResult,
                    attributes: ['id'],
                    include: [{
                        model: User,
                        attributes: ['id', 'mbti'],
                        where: { mbti }
                    }]
                }],
            });
            const temp = mbtiCandidateList.map((candidate: any) => ({ ...candidate.toJSON(), voteNum: candidate.WorldCupResults.length })).sort((a, b) => b.voteNum - a.voteNum);
            const totalMbtiVoteNum: number = temp.map(candidate => candidate.voteNum).reduce((acc, currentVal) => acc + currentVal);
            const result = temp.map((candidate: any) => ({ ...candidate, ratio: Math.round(candidate.voteNum / totalMbtiVoteNum * 100) }));
            res.status(200).json({ message: '정상적으로 월드컵 통계 결과가 조회되었습니다.', data: result });
        } else {
            const totalCandidateList: WorldCupCandidate[] = await WorldCupCandidate.findAll({
                where: {
                    worldCupId,
                },
                attributes: { 
                    include: [[sequelize.literal(`(
                        SELECT COUNT(*)
                            FROM WorldCupResults AS worldCupResult
                            WHERE
                                worldCupResult.worldCupCandidateId = WorldCupCandidate.id
                    )`), 'voteNum']]
                },
                order: [[sequelize.literal('voteNum'), 'DESC']],
            });
            const result = totalCandidateList.map((candidate: any) => ({ ...candidate.toJSON(), ratio: Math.round(candidate.toJSON().voteNum / worldCup.toJSON().joinNummmmm * 100) }));
            res.status(200).json({ message: '정상적으로 월드컵 통계 결과가 조회되었습니다.', data: result });
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// DELETE -> 월드컵 삭제
export const deleteWorldCup = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user as User;
    const { worldCupId } = req.params;
    try {
        const worldCup: WorldCup | null = await WorldCup.findByPk(worldCupId);
        if (!worldCup) return res.status(404).json({ message: '해당하는 아이디의 월드컵이 존재하지 않습니다.' });
        if (worldCup.userId !== user.id) return res.status(409).json({ message: '삭제 권한이 없습니다.' });

        const candidateList: WorldCupCandidate[] = await WorldCupCandidate.findAll({ where: { worldCupId } });
        const resultList: WorldCupResult[] = await WorldCupResult.findAll({ where: { worldCupId } });

        candidateList.forEach(async (candidate: WorldCupCandidate) => await candidate.destroy());
        resultList.forEach(async (result: WorldCupResult) => await result.destroy());

        await worldCup.destroy();
        res.status(204);
    } catch (err) {
        console.log(err);
        next(err);
    }
};
