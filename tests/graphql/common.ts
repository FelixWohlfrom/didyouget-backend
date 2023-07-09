/**
 * This file contains some commonly used variables,
 * functions and testdata.
 */
import { Server, IncomingMessage, ServerResponse } from "http";
import { AddressInfo } from "net";
import request from "supertest";

import { startApolloServer } from "../../src/server";

// The user data for our testusers. Will be used in most of the testcases
const userData = [
    {
        username: "TestUser",
        password: "1234"
    },
    {
        username: "TestUser2",
        password: "5678"
    }
];

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
 *
 * @param {int} credentialsId The credentials to use for log in. Default 0.
 */
async function registerUser(credentialsId = 0) {
    // Make sure we have our test user in the db
    const response = await runGraphQlQuery({
        query: `mutation registerUser($userData: userInput!) {
            register(input: $userData) {
                success
            }
        }`,
        variables: { userData: userData[credentialsId] }
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.register.success).toBeTruthy();
}

/**
 * Will add a predefined shopping list.
 *
 * @param {string} name An optional name for the list.
 */
async function addShoppingList(name = "testList") {
    // Make sure we have our test list in the db
    const response = await runGraphQlQuery({
        query: `mutation AddShoppingList($addShoppingListInput: addShoppingListInput!) {
            addShoppingList(input: $addShoppingListInput) {
                id
            }
        }`,
        variables: { addShoppingListInput: { name: name } }
    });

    expect(response.body.errors).toBeUndefined();
}

/**
 * Will login using the predefined user authentication.
 *
 * @param {int} credentialsId The credentials to use for log in. Default 0.
 * @param {boolean} force Force login, even if we are already logged in.
 */
async function login(credentialsId = 0, force = false) {
    if (!authToken || force) {
        const response = await runGraphQlQuery({
            query: `mutation login($userData: userInput!) {
                login(input: $userData) {
                    token
                }
            }`,
            variables: { userData: userData[credentialsId] }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.login.token).not.toBeNull();
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
    server = await startApolloServer("localhost", 0);
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
