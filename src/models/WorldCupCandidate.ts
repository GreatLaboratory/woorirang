import { Model, HasManyGetAssociationsMixin, Association } from 'sequelize';
import WorldCupResult from './WorldCupResult';

export default class WorldCupCandidate extends Model {
    public id!: number;
    public worldCupId!: number;
    public title!: string;
    public imageUrl!: string;

    public getWorldCupResults!: HasManyGetAssociationsMixin<WorldCupResult>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static associations: {
        worldCupResults: Association<WorldCupCandidate, WorldCupResult>;
    };
}
