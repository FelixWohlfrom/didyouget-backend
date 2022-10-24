import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    ForeignKey,
    CreationOptional
} from "sequelize";

import { databaseConnection } from "../index";
import { ShoppingList } from "./Shoppinglist";

/**
 * Describes an item of a shopping list
 */
class ListItem extends Model<
    InferAttributes<ListItem>,
    InferCreationAttributes<ListItem>
> {
    // id can be undefined during creation when using `autoIncrement`
    declare id: CreationOptional<number>;

    declare value: string;
    declare bought: CreationOptional<boolean>;

    declare listId: ForeignKey<number>;
}

ListItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING,
            defaultValue: "",
            allowNull: false
        },
        bought: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    },
    {
        sequelize: databaseConnection,
        timestamps: false,
        modelName: "listItem"
    }
);

ListItem.belongsTo(ShoppingList, { as: "listId" });

export { ListItem };
