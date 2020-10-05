import { Model } from 'sequelize';

export default class Test extends Model {
    public id!: number;
    public title!: string;
    readonly url!: string;
}
