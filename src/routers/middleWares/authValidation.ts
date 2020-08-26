import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';

import User from '../../models/User';
import { JWT_SECRET } from '../../config/secret';

// jwt 검증 로직
export const verifyJwtToken  = async (req: Request, res: Response, next: NextFunction)=> {
    const token: string | undefined = req.get('Authorization');
    try {
        if (token && token.split(' ')[0] === 'Bearer') {
            const realToken: string = token.split(' ')[1];
            jwt.verify(realToken, JWT_SECRET, async (error: JsonWebTokenError | NotBeforeError | TokenExpiredError | null, decoded: any) => {
                if (error) return res.status(400).json({ message: '유효하지않거나 만료된 토큰입니다.' });
                try {
                    const user: User | null = await User.findByPk(decoded.userId);
                    if (!user) return res.status(404).json({ message: 'token에 해당하는 유저가 없습니다' });
                    if (user) {
                        req.user = user;
                        next();
                    }
                } catch (err) {
                    console.log(err);
                    next(err);
                }
            });
        } else {
            res.status(401).send('UnAuthorized');
        }
    } catch (err) {
        console.log(err);
        next(err);
    }
};
