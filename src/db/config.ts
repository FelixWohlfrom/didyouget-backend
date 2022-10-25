import { envHandler } from "../utils/envHandler";

export default {
    DB_NAME: envHandler.get("DB_NAME"),
    DB_USER: envHandler.get("DB_USER"),
    DB_PASS: envHandler.get("DB_PASS"),
    DB_HOST: envHandler.get("DB_HOST", "localhost"),
    DB_PORT: parseInt(envHandler.get("DB_PORT", "3306")),
    DB_DIALECT: envHandler.get("DB_DIALECT", "sqlite"),
    DB_STORAGE: envHandler.get("DB_STORAGE", "data/database.sqlite")
};
