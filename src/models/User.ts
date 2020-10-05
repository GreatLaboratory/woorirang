import { Model, HasManyGetAssociationsMixin, Association } from 'sequelize';
import Post from './Post';
import Comment from './Comment';
import TestResult from './TestResult';
import * as bcrypt from 'bcrypt-nodejs';

export const MBTI =  {
    ISTJ : 'istj',
    ISFJ : 'isfj',
    INFJ : 'infj',
    INTJ : 'intj',
    ISTP : 'istp',
    ISFP : 'isfp',
    INFP : 'infp',
    INTP : 'intp',
    ESTP : 'estp',
    ESFP : 'esfp',
    ENFP : 'enfp',
    ENTP : 'entp',
    ESTJ : 'estj',
    ESFJ : 'esfj',
    ENFJ : 'enfj',
    ENTJ : 'entj',
};

export default class User extends Model {
    public id!: number;
    public snsId?: string;
    public email!: string;
    public password!: string;
    public nickname!: string;
    public mbti!: string;
    public fcmToken!: string;

    validPassword (password: string) {
        return bcrypt.compareSync(password, this.password);
    }

    public getPosts!: HasManyGetAssociationsMixin<Post>;
    public getComments!: HasManyGetAssociationsMixin<Comment>;
    public getTestResults!: HasManyGetAssociationsMixin<TestResult>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        posts: Association<User, Post>;
        comments: Association<User, Comment>;
        testResults: Association<User, TestResult>;
    };
}
