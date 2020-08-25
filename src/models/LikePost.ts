import { Model } from 'sequelize';

export default class LikePost extends Model {
    public id!: number;
    public userId!: number;
    public postId!: number;
}
