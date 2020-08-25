import { Model, HasManyGetAssociationsMixin, Association } from 'sequelize';
import Comment from './Comment';

export default class Topic extends Model {
    public id!: number;
    public title!: string;
    public content!: string;
    public views!: number;
    public commentNum!: number;

    public getComments!: HasManyGetAssociationsMixin<Comment>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        comments: Association<Topic, Comment>;
    };
}
