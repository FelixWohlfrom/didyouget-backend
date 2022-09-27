import Sequelize from "sequelize";

import { databaseConnection } from "../index";

export const UserModel = databaseConnection.define("User", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
