import { envReader } from "../utils/envReader";

export default {
    DB_NAME: envReader.get("DB_NAME"),
    DB_USER: envReader.get("DB_USER"),
    DB_PASS: envReader.get("DB_PASS"),
    DB_HOST: envReader.get("DB_HOST"),
    DB_PORT: parseInt(envReader.get("DB_PORT", "3306"))
};
