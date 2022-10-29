import { Server, IncomingMessage, ServerResponse } from "http";
import { AddressInfo } from "net";
import request from "supertest";

import { startApolloServer } from "../src/server";

// The user data for our testuser. Will be used in most of the testcases
const userData = {
    username: "TestUser",
    password: "1234"
};

// The test server instance
let server: Server<typeof IncomingMessage, typeof ServerResponse>;

// The authentication token
let authToken: string | undefined;

/**
 * Will login using the predefined user authentication.
 *
 * @param {boolean} force Force login, even if we are already logged in
 */
async function login(force = false) {
    if (!authToken || force) {
        const response = await runGraphQlQuery({
            query: `mutation login($userData: userInput!) {
                login(input: $userData) {
                    token
                }
            }`,
            variables: { userData: userData }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.login.token).not.toBe("");

        authToken = response.body.data.login.token;
    }
}

/**
 * Executes a query on the test server.
 * Returns the result.
 *
 * @param {object} queryData The data to pass in the graphql request
 * @return {request.Test} A promise containing the result
 */
function runGraphQlQuery(queryData: object): request.Test {
    // send our request to the url of the test server
    const req = request(
        `http://localhost:${(server.address() as AddressInfo).port}`
    ).post("/graphql");
    if (authToken !== undefined) {
        req.set("Authorization", `Bearer ${authToken}`);
    }
    return req.send(queryData);
}

// before the tests we spin up a new Apollo Server
beforeAll(async () => {
    server = await startApolloServer(0);
});

// after the tests we'll stop the server
afterAll(() => {
    server?.close();
});

describe("an unauthorized user", () => {
    beforeEach(() => {
        authToken = undefined;
    });

    it("should be able to register a new user", async () => {
        const response = await runGraphQlQuery({
            query: `mutation registerUser($userData: userInput!) {
                register(input: $userData) {
                    success
                }
            }`,
            variables: { userData: userData }
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
            variables: { userData: userData }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.register.success).toBe(false);
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
});

describe("an authorized user", () => {
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
        authToken = undefined;
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
});
