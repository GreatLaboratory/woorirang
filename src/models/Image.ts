import { Model } from 'sequelize';

export default class Image extends Model {
    public id!: number;
    public topicId!: number;
    public postId!: number;
    public testResultId!: number;
    readonly url!: string;
}
