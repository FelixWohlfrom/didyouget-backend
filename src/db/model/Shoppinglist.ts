import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    ForeignKey,
    NonAttribute
} from "sequelize";

import { databaseConnection } from "../index";
import { ListItem } from "./ListItem";

/**
 * Describes a shopping list
 */
class ShoppingList extends Model<
    InferAttributes<ShoppingList>,
    InferCreationAttributes<ShoppingList>
> {
    declare name: string;

    declare owner: ForeignKey<number>;

    declare listItems: NonAttribute<ListItem[]>;
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

ShoppingList.hasMany(ListItem, { foreignKey: "listId" });

export { ShoppingList };
