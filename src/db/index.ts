import { Sequelize } from "sequelize";
import dbConfig from "./config";

export const databaseConnection = new Sequelize(
    dbConfig.DB_NAME,
    dbConfig.DB_USER,
    dbConfig.DB_PASS,
    {
        host: dbConfig.DB_HOST,
        port: dbConfig.DB_PORT,
        dialect: "mariadb",
        define: {
            timestamps: false
        }
    }
);
