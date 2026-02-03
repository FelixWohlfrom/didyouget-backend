import { getDatabase, resetDatabase } from "../src/db";

describe("the database connection", () => {
    // Store the original environment to reset it later
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        resetDatabase();
        jest.resetModules(); // Most important - it clears the cache
        process.env = { ...ORIGINAL_ENV }; // Make a copy
    });

    afterAll(() => {
        resetDatabase();
        process.env = ORIGINAL_ENV; // Restore old environment
    });

    it("should connect to an sqlite database", async () => {
        process.env.DB_NAME = ":memory:";
        process.env.DB_TYPE = "better-sqlite3";
        process.env.SYNCHRONIZE = "";

        const database = await getDatabase();

        expect(database).toBeTruthy();
    });

    it("should raise an error if an unknown database type is given", async () => {
        process.env.DB_TYPE = "unknown_database";

        try {
            await getDatabase();
        } catch (error_) {
            expect((error_ as Error).message).toBe("Unknown database type");
            return;
        }
        fail("No error raised");
    });
});
