import { DataSource, DataSourceOptions } from "typeorm";
import dbConfig from "./config";
import { Device } from "./model/Device";
import { User } from "./model/User";
import { ShoppingList } from "./model/Shoppinglist";
import { ListItem } from "./model/ListItem";

let database: DataSource | null = null;

function getDataConfig(): DataSourceOptions {
    switch (dbConfig.DB_TYPE) {
        case "better-sqlite3":
            return {
                type: "better-sqlite3",
                database: dbConfig.DB_NAME,
                synchronize: dbConfig.SYNCHRONIZE,
                entities: [Device, User, ShoppingList, ListItem]
            };
        case "mysql":
            return {
                type: "mysql",
                host: dbConfig.DB_HOST,
                port: dbConfig.DB_PORT,
                database: dbConfig.DB_NAME,
                synchronize: dbConfig.SYNCHRONIZE,
                entities: [Device, User, ShoppingList, ListItem]
            };
    }

    throw new Error("Unknown database type");
}

async function initDatabaseConnection() {
    const database = new DataSource(getDataConfig());
    return database.initialize();
}

export async function getDatabase(): Promise<DataSource> {
    database ??= await initDatabaseConnection();
    return database;
}
