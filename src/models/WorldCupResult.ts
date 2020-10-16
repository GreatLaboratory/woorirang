import { Model } from 'sequelize';

export default class WorldCupResult extends Model {
    public id!: number;
    public userId!: number;
    public worldCupId!: number;
    public worldCupCandidateId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}
