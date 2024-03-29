import { PassportStatic } from 'passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';

import User from '../../models/User';
import { JWT_SECRET } from '../secret';

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
};

export const jwtUser = (passport: PassportStatic): void => {
    passport.use(new Strategy(options, async (jwtPayload: any, done) =>{
        try {
            const user: User | null = await User.findByPk(jwtPayload.userId);
            if (user) return done(null, user);
            else return done(null, false);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }));
};
