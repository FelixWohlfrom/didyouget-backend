import {
    userData,
    authToken,
    setAuthToken,
    initServer,
    stopServer,
    login,
    runGraphQlQuery
} from "./common";

// before the tests we spin up a new Apollo Server
beforeAll(async () => {
    await initServer();
});

// after the tests we'll stop the server
afterAll(() => {
    stopServer();
});

describe("an unauthorized user", () => {
    beforeEach(() => {
        setAuthToken(undefined);
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
});
