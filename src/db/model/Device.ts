import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    ForeignKey
} from "sequelize";

import { databaseConnection } from "../index";

/**
 * Describes a device
 */
class Device extends Model<
    InferAttributes<Device>,
    InferCreationAttributes<Device>
> {
    declare name: string;
    declare token: string;
    declare loggedin: boolean;

    declare userId: ForeignKey<number>;
}

Device.init(
    {
        name: {
            type: DataTypes.STRING,
            defaultValue: "",
            allowNull: false
        },
        token: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        loggedin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    },
    {
        sequelize: databaseConnection,
        timestamps: true,
        createdAt: "firstSeen",
        updatedAt: "lastSeen",
        modelName: "device"
    }
);

export { Device };
