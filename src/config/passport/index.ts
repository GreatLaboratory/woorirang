import { PassportStatic } from 'passport';

import { localUser } from './localUserStrategy';
import { jwtUser } from './jwtStrategy';
import User from '../../models/User';

export const passportConfig = (passport: PassportStatic) => {
    localUser(passport);
    jwtUser(passport);

    passport.serializeUser((user: User, done) => {
        console.log('-------------serialize');
        done(null, user.id);
    });
    
    passport.deserializeUser(async (id: string | number | Buffer | undefined, done) => {
        try {
            const user: User | null = await User.findByPk(id);
            if (user) {
                console.log('-------------deserialize');
                done(null, user);
            } else {
                console.log('해당하는 primary key의 사용자가 존재하지 않습니다.');
            }
        } catch (err) {
            console.log(err);
        }
    });
};
