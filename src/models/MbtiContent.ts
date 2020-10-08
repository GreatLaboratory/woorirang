import { Model } from 'sequelize';

export default class MbtiContent extends Model {
    public id!: number;
    public imageUrl!: string;
    public url!: string;
}
