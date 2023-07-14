import { Dialect } from "sequelize";
import { databaseConnection } from "../../src/db";
import { User } from "../../src/db/model/User";
import {
    userData,
    authToken,
    setAuthToken,
    initServer,
    stopServer,
    login,
    runGraphQlQuery,
    registerUser
} from "./common";

// before the tests we spin up a new Apollo Server
beforeAll(async () => {
    await initServer();
});

// after the tests we'll stop the server
afterAll(async () => {
    await stopServer();
});

describe("an unauthorized user", () => {
    // Store the original environment to reset it later
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        setAuthToken(undefined);
        jest.resetModules(); // Most important - it clears the cache
        process.env = { ...ORIGINAL_ENV }; // Make a copy
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV; // Restore old environment
    });

    it("should not be able to login with an unknow user", async () => {
        const response = await runGraphQlQuery({
            query: `mutation login($userData: userInput!) {
                login(input: $userData) {
                    token
                    failureMessage
                }
            }`,
            variables: {
                userData: { username: "unknown", password: "unknown" }
            }
        });

        expect(response.body.data?.errors).toBeUndefined();
        expect(response.body.data?.login.token).toBeNull();
        expect(response.body.data?.login.failureMessage).toBe(
            "Invalid user or password."
        );
    });

    it("should be able to register a new user", async () => {
        const response = await runGraphQlQuery({
            query: `mutation registerUser($userData: userInput!) {
                register(input: $userData) {
                    success
                }
            }`,
            variables: { userData: userData[0] }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.register.success).toBeTruthy();
    });

    it("should not be able to register the same user again", async () => {
        const response = await runGraphQlQuery({
            query: `mutation registerUser($userData: userInput!) {
                register(input: $userData) {
                    success
                }
            }`,
            variables: { userData: userData[0] }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.register.success).toBe(false);
    });

    it("should be able to register a second user if explicitly enabled by admin", async () => {
        process.env.ALLOW_REGISTRATION = "true";

        const response = await runGraphQlQuery({
            query: `mutation registerUser($userData: userInput!) {
                register(input: $userData) {
                    success
                }
            }`,
            variables: { userData: userData[1] }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.register.success).toBeTruthy();
    });

    it("should not be able to register if disabled by admin", async () => {
        process.env.ALLOW_REGISTRATION = "false";

        const response = await runGraphQlQuery({
            query: `mutation registerUser($userData: userInput!) {
                register(input: $userData) {
                    success
                    failureMessage
                }
            }`,
            variables: { userData: userData[0] }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.register.success).toBe(false);
        expect(response.body.data?.register.failureMessage).toBe(
            "User registration is disabled by administrator."
        );
    });

    it("should login successfully", async () => {
        await login();
        expect(authToken).toBeTruthy();
    });

    it("should not be able to query a single user", async () => {
        const response = await runGraphQlQuery({
            query: `query User {
                user(id: 1) {
                    id
                    username
                }
            }`
        });
        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });

    it("should get unauthorised message while checking login status", async () => {
        const response = await runGraphQlQuery({
            query: `query IsLoggedIn {
                isLoggedIn {
                    success
                }
            }`
        });
        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });

    it("should not be able to query all users", async () => {
        const response = await runGraphQlQuery({
            query: `query Users {
                users {
                    id
                    username
                }
            }`
        });
        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });

    it("should not be able to update user data", async () => {
        const response = await runGraphQlQuery({
            query: `mutation UpdateUser($updateUserInput: updateUserInput!) {
                updateUser(input: $updateUserInput) {
                    success
                }
            }`,
            variables: {
                updateUserInput: { username: "newUser" }
            }
        });
        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });
});

describe("an authorized user", () => {
    beforeAll(async () => {
        // Reset registered user
        await User.truncate();
        // Workaround for https://github.com/sequelize/sequelize/issues/11152
        if ((databaseConnection.getDialect() as Dialect) === "sqlite") {
            databaseConnection.query(
                "UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME=:tableName",
                {
                    replacements: { tableName: User.getTableName() }
                }
            );
        }

        await registerUser();
    });

    beforeEach(async () => {
        await login();
    });

    it("should logout successfully", async () => {
        const response = await runGraphQlQuery({
            query: `mutation logout {
                logout {
                    success
                }
            }`
        });
        expect(response.body.data?.logout.success).toBe(true);
        setAuthToken(undefined);
    });

    it("should be able to query all users in the system", async () => {
        const response = await runGraphQlQuery({
            query: `query Users {
                users {
                    id
                    username
                }
            }`
        });
        expect(response.body.data?.users[0].id).toBe("1");
        expect(response.body.data?.users[0].username).toBe("TestUser");
        expect(response.body.data?.users).toHaveLength(1);
    });

    it("should be able to query a single user in the system", async () => {
        const response = await runGraphQlQuery({
            query: `query User {
                user(id: 1) {
                    id
                    username
                }
            }`
        });
        expect(response.body.data?.user.id).toBe("1");
        expect(response.body.data?.user.username).toBe("TestUser");
    });

    it("should be able to query the currently logged in user", async () => {
        const response = await runGraphQlQuery({
            query: `query User {
                user {
                    id
                    username
                }
            }`
        });
        expect(response.body.data?.user.id).toBe("1");
        expect(response.body.data?.user.username).toBe("TestUser");
    });

    it("should receive null if user doesn't exist", async () => {
        const response = await runGraphQlQuery({
            query: `query User {
                user(id: 2) {
                    id
                    username
                }
            }`
        });
        expect(response.body.data?.user).toBeNull();
    });

    it("should be able to update the username", async () => {
        // Update username
        const response = await runGraphQlQuery({
            query: `mutation UpdateUser($updateUserInput: updateUserInput!) {
                updateUser(input: $updateUserInput) {
                    success
                }
            }`,
            variables: {
                updateUserInput: { username: "newUser" }
            }
        });
        expect(response.body.data?.errors).toBeUndefined();
        expect(response.body.data?.updateUser.success).toBe(true);

        // Verify that the user data is really updated
        const checkResponse = await runGraphQlQuery({
            query: `query User {
                user {
                    id
                    username
                }
            }`
        });
        expect(checkResponse.body.data?.user.id).toBe("1");
        expect(checkResponse.body.data?.user.username).toBe("newUser");
    });

    it("should not be able to login after password update", async () => {
        // Update the password
        const response = await runGraphQlQuery({
            query: `mutation UpdateUser($updateUserInput: updateUserInput!) {
                updateUser(input: $updateUserInput) {
                    success
                }
            }`,
            variables: {
                updateUserInput: {
                    username: userData[0].username,
                    password: "secureNewPassword"
                }
            }
        });
        expect(response.body.data?.errors).toBeUndefined();
        expect(response.body.data?.updateUser.success).toBe(true);

        // Login again - this should fail
        const loginResponse = await runGraphQlQuery({
            query: `mutation login($userData: userInput!) {
                login(input: $userData) {
                    token
                    failureMessage
                }
            }`,
            variables: { userData: userData[0] }
        });

        expect(loginResponse.body.data?.errors).toBeUndefined();
        expect(loginResponse.body.data?.login.token).toBeNull();
        expect(loginResponse.body.data?.login.failureMessage).toBe(
            "Invalid user or password."
        );
    });

    it("should return success while checking login status", async () => {
        const response = await runGraphQlQuery({
            query: `query IsLoggedIn {
                isLoggedIn {
                    success
                }
            }`
        });
        expect(response.body.data?.errors).toBeUndefined();
        expect(response.body.data?.isLoggedIn.success).toBe(true);
    });
});
