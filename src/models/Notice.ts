import { Model } from 'sequelize';

export default class Notice extends Model {
    public id!: number;
    public userId!: number;
    public commenterId!: number;
    public postId?: number;
    public topicId?: number;
    public message!: string;
    public isChecked!: boolean;
    public isAnonymous!: boolean;
}
