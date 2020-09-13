import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'errorhandler';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { Sequelize } from 'sequelize';
import passport from 'passport';

import { init } from './models/index';
import { COOKIE_SECRET } from './config/secret';
import { passportConfig } from './config/passport';
import userRouter from './routers/userRouter';
import postRouter from './routers/postRouter';
import commentRouter from './routers/commentRouter';
import topicRouter from './routers/topicRouter';

class Server {
    // Express App 필드 선언
    private app: Application;

    // 생성자
    constructor () {
        this.app = express();
        this.connectDB();
        this.config();
        passportConfig(passport);
        this.routes();
    }

    // DB 연결
    private async connectDB (): Promise<void> {
        const sequelize: Sequelize = init();
        try {
            await sequelize.authenticate();
            await sequelize.sync();
            // await sequelize.sync({force: true});
            // This will run .sync() only if database name ends with '_test'
            // 이건 굉장히 파괴적인 옵션이라 test-dev서버에서 한번 데이터들 싹 갈아엎을 때 해야한다.
            // await sequelize.sync({ force: true, match: /_test$/ });
            console.log('DB 연결에 성공했습니다.');
        } catch (err) {
            console.log('DB 연결에 실패했습니다.');
            console.log(err);
            await sequelize.close();
        }
    }

    // 기본 서버 설정 및 미들웨어 
    private config (): void {
        this.app.use(morgan('dev'));
        this.app.use(helmet());
        this.app.use(hpp());
        this.app.use(cors({
            origin: true,
            credentials: true
        }));
        this.app.use(express.json({
            limit: '200mb'
        }));
        this.app.use(express.static('public'));
        this.app.use(express.urlencoded({
            extended: false, 
            limit: '200mb'
        }));
        this.app.use(cookieParser(COOKIE_SECRET));
        this.app.use(passport.initialize());
    }

    // 라우터
    private routes (): void {
        this.app.use('/api/user', userRouter);
        this.app.use('/api/post', postRouter);
        this.app.use('/api/comment', commentRouter);
        this.app.use('/api/topic', topicRouter);
    }

    // 서버 구동
    public start (): void {
        this.app.use(errorHandler());
        this.app.listen(3000, () => {
            console.log('####### App is running!! #######');
        });
        this.app.get('/health', (req: Request, res: Response) => {
            res.status(200).send();
        });
        this.app.get('/test', (req: Request, res: Response) => {
            res.status(200).json({ message: 'test success!!!333', today: new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) });
        });
    }
}

const server: Server = new Server();
server.start();
