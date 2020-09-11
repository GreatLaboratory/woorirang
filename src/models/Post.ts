import { Model, HasManyGetAssociationsMixin, Association } from 'sequelize';
import Comment from './Comment';

export const enum PostType {
    Free = 'free',
    Topic = 'topic',
}

export default class Post extends Model {
    public id!: number;
    public userId!: number;
    public title!: string;
    public content!: string;
    public likes!: number;
    public views!: number;
    public commentNum!: number;
    public type!: PostType;
    public isAnonymous!: boolean;

    public getComments!: HasManyGetAssociationsMixin<Comment>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        comments: Association<Post, Comment>;
    };
}
