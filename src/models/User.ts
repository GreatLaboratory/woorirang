import { Model, HasManyGetAssociationsMixin, Association } from 'sequelize';
import Post from './Post';
import Comment from './Comment';
import * as bcrypt from 'bcrypt-nodejs';

export default class User extends Model {
    public id!: number;
    public snsId?: string;
    public email!: string;
    public password!: string;
    public nickname!: string;
    public mbti!: string;

    validPassword (password: string) {
        return bcrypt.compareSync(password, this.password);
    }

    public getPosts!: HasManyGetAssociationsMixin<Post>;
    public getComments!: HasManyGetAssociationsMixin<Comment>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        posts: Association<User, Post>;
        comments: Association<User, Comment>;
    };
}
