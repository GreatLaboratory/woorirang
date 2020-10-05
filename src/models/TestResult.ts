import { Model } from 'sequelize';

export default class TestResult extends Model {
    public id!: number;
    public userId!: number;
    public testId!: number;
    public resultText!: string;
}
