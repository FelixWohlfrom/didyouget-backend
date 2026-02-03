import { DatabaseType } from "typeorm";
import { envHandler } from "../utils/envHandler";

export function getConfig() {
    return {
        DB_NAME: envHandler.get("DB_NAME", "data/database.sqlite"),
        DB_USER: envHandler.get("DB_USER"),
        DB_PASS: envHandler.get("DB_PASS"),
        DB_HOST: envHandler.get("DB_HOST", "localhost"),
        DB_PORT: Number.parseInt(envHandler.get("DB_PORT", "3306")),
        DB_TYPE: envHandler.get("DB_TYPE", "better-sqlite3") as DatabaseType,
        SYNCHRONIZE: Boolean(envHandler.get("SYNCHRONIZE", "false"))
    };
}
