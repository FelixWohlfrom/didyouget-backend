class EnvReader {
    get(envVar: string, defaultValue?: string): string {
        if (process.env[envVar] || defaultValue) {
            return process.env[envVar] ?? defaultValue ?? "";
        }
        throw new Error("Please define a value for environment variable " + envVar);
    }
}

const envReader = new EnvReader();

export default {
    DB_NAME: envReader.get("DB_NAME"),
    DB_USER: envReader.get("DB_USER"),
    DB_PASS: envReader.get("DB_PASS"),
    DB_HOST: envReader.get("DB_HOST"),
    DB_PORT: parseInt(envReader.get("DB_PORT", "3306")),
};
