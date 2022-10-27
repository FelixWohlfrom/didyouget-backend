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
    return request(`http://localhost:${(server.address() as AddressInfo).port}`)
        .post("/graphql")
        .send(queryData);
}

describe("user related graphql tests", () => {
    // before the tests we spin up a new Apollo Server
    beforeAll(async () => {
        server = await startApolloServer(0);
    });

    // after the tests we'll stop the server
    afterAll(() => {
        server?.close();
    });

    it("should be possible to register a new user", async () => {
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

    it("should be not possible to register the same user again", async () => {
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
});
