import { Model, HasManyGetAssociationsMixin, Association } from 'sequelize';

export default class Comment extends Model {
    public id!: number;
    public userId!: number;
    public topicId!: number;
    public postId!: number;
    public commentId!: number;
    public content!: string;
    public likes!: number;
    public isAnonymous!: boolean;

    public getComments!: HasManyGetAssociationsMixin<Comment>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        comments: Association<Comment, Comment>;
    };
}
