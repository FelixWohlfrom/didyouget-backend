/**
 * This file contains some commonly used variables,
 * functions and testdata.
 */
import { Server, IncomingMessage, ServerResponse } from "http";
import { AddressInfo } from "net";
import request from "supertest";

import { startApolloServer } from "../../src/server";

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
 * Let's you set the auth token to a given value.
 *
 * @param {string | undefined} newToken The new value of the authToken.
 */
function setAuthToken(newToken: string | undefined) {
    authToken = newToken;
}

/**
 * Will register the predefined user.
 */
async function registerUser() {
    // Make sure we have our test user in the db
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
}

/**
 * Will add a predefined shopping list.
 */
async function addShoppingList() {
    // Make sure we have our test list in the db
    const response = await runGraphQlQuery({
        query: `mutation AddShoppingList($addShoppingListInput: addShoppingListInput!) {
            addShoppingList(input: $addShoppingListInput) {
                id
            }
        }`,
        variables: { addShoppingListInput: { name: "testList" } }
    });

    expect(response.body.errors).toBeUndefined();
}

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

/**
 * Function to spin up an apollo server. Used in all graphql related tests.
 */
async function initServer() {
    server = await startApolloServer(0);
}

/**
 * After the tests we'll stop the server
 */
function stopServer() {
    server?.close();
}

export {
    userData,
    authToken,
    setAuthToken,
    initServer,
    stopServer,
    registerUser,
    login,
    addShoppingList,
    runGraphQlQuery
};
