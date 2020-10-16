import { Model, HasManyGetAssociationsMixin, Association } from 'sequelize';
import WorldCupCandidate from './WorldCupCandidate';

export default class WorldCup extends Model {
    public id!: number;
    public userId!: number;
    public roundNum!: string;
    public title!: string;
    public description!: string;
    public joinNum!: number;

    public getWorldCupCandidates!: HasManyGetAssociationsMixin<WorldCupCandidate>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        worldCupCandidates: Association<WorldCup, WorldCupCandidate>;
    };
}
