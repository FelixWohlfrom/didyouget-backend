import { Dialect, Sequelize } from "sequelize";
import dbConfig from "./config";

export const databaseConnection = new Sequelize(
    dbConfig.DB_NAME,
    dbConfig.DB_USER,
    dbConfig.DB_PASS,
    {
        host: dbConfig.DB_HOST,
        port: dbConfig.DB_PORT,
        dialect: dbConfig.DB_DIALECT as Dialect,
        storage: dbConfig.DB_STORAGE, // This will only be used if the sqlite dialect is used
        define: {
            timestamps: false
        }
    }
);
