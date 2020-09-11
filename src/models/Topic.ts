import { Model, HasManyGetAssociationsMixin, Association } from 'sequelize';
import Comment from './Comment';

export default class Topic extends Model {
    public id!: number;
    public userId!: number;
    public title!: string;
    public commentNum!: number;
    public isAnonymous!: boolean;

    public getComments!: HasManyGetAssociationsMixin<Comment>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        comments: Association<Topic, Comment>;
    };
}
