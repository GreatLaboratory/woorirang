import { Model } from 'sequelize';

export default class LikeComment extends Model {
    public id!: number;
    public userId!: number;
    public commentId!: number;
}
