import { Server, IncomingMessage, ServerResponse } from "http";
import { AddressInfo } from "net";
import request from "supertest";

import { startApolloServer } from "../src/server";

let server: Server<typeof IncomingMessage, typeof ServerResponse>;

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
            variables: {
                userData: {
                    username: "TestUser",
                    password: "1234"
                }
            }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.register.success).toBeTruthy();
    });
});
