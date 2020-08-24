import { PassportStatic } from 'passport';
import { Strategy } from 'passport-local';

import User from '../../models/User';

export const localUser = (passport: PassportStatic) => {
    passport.use(new Strategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
            const exUser = await User.findOne({ where: { email } });
            if (exUser) {
                if (exUser.validPassword(password)) done(null, exUser); 
                else done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            } else {
                done(null, false, { message: '가입되지 않은 회원입니다.' });
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};
