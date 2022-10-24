import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    ForeignKey
} from "sequelize";

import { databaseConnection } from "../index";

/**
 * Describes a shopping list
 */
class ShoppingList extends Model<
    InferAttributes<ShoppingList>,
    InferCreationAttributes<ShoppingList>
> {
    declare name: string;

    declare owner: ForeignKey<number>;
}

ShoppingList.init(
    {
        name: {
            type: DataTypes.STRING,
            defaultValue: "",
            allowNull: false
        }
    },
    {
        sequelize: databaseConnection,
        timestamps: false,
        modelName: "list"
    }
);

export { ShoppingList };
