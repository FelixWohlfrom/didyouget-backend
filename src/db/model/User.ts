import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute
} from "sequelize";

import { databaseConnection } from "../index";
import { Device } from "./Device";
import { ShoppingList } from "./Shoppinglist";

/**
 * Describes a user
 */
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    // id can be undefined during creation when using `autoIncrement`
    declare id: CreationOptional<number>;

    declare username: string;
    declare password: string;

    declare devices: NonAttribute<Device[]>;
    declare shoppingLists: NonAttribute<ShoppingList[]>;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize: databaseConnection,
        timestamps: false,
        modelName: "user"
    }
);

User.hasMany(Device);
User.hasMany(ShoppingList, { foreignKey: "owner" });
ShoppingList.belongsToMany(User, { through: "sharedWith" });

export { User };
