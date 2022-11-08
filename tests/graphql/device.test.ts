import {
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
    await registerUser();
});

// after the tests we'll stop the server
afterAll(async () => {
    stopServer();
});

describe("an unauthorized user", () => {
    beforeEach(() => {
        setAuthToken(undefined);
    });

    it("should not be able to query devices", async () => {
        const response = await runGraphQlQuery({
            query: `query Devices {
                devices {
                    name
                    loggedin
                    firstSeen
                    lastSeen
                }
            }`
        });
        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });

    it("should not be able to update the device name", async () => {
        const response = await runGraphQlQuery({
            query: `mutation UpdateDeviceName($deviceInput: DeviceInput!) {
                updateDeviceName(input: $deviceInput) {
                    success
                }
            }`,
            variables: { deviceInput: { newDeviceName: "testDevice" } }
        });
        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });
});

describe("an authorized user", () => {
    beforeEach(async () => {
        await login();
    });

    it("should be able to query all devices connected to to the current user", async () => {
        const response = await runGraphQlQuery({
            query: `query Devices {
                devices {
                    name
                    loggedin
                    firstSeen
                    lastSeen
                }
            }`
        });
        expect(response.body.data?.devices[0].name).toBe("");
        expect(response.body.data?.devices[0].loggedin).toBe(true);
        expect(response.body.data?.devices[0].firstSeen).toBeTruthy();
        expect(response.body.data?.devices[0].lastSeen).toBeTruthy();
        expect(response.body.data?.devices).toHaveLength(1);
    });

    it("should be able to update the device name", async () => {
        // First update the device name
        const responseUpdate = await runGraphQlQuery({
            query: `mutation UpdateDeviceName($deviceInput: DeviceInput!) {
                updateDeviceName(input: $deviceInput) {
                    success
                }
            }`,
            variables: { deviceInput: { newDeviceName: "testDevice" } }
        });
        expect(responseUpdate.body.data?.updateDeviceName.success).toBe(true);

        // Verify that the update was successful
        const responseCheck = await runGraphQlQuery({
            query: `query Devices {
                devices {
                    name
                    loggedin
                }
            }`
        });
        expect(responseCheck.body.data?.devices[0].name).toBe("testDevice");
        expect(responseCheck.body.data?.devices[0].loggedin).toBe(true);
        expect(responseCheck.body.data?.devices).toHaveLength(1);
    });
});
