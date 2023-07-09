import { Dialect } from "sequelize";
import { databaseConnection } from "../../src/db";
import { ShoppingList } from "../../src/db/model/Shoppinglist";
import {
    setAuthToken,
    initServer,
    stopServer,
    login,
    runGraphQlQuery,
    registerUser,
    addShoppingList
} from "./common";

// before the tests we spin up a new Apollo Server
beforeAll(async () => {
    await initServer();
    await registerUser();
    await registerUser(1);
});

// after the tests we'll stop the server
afterAll(async () => {
    await stopServer();
});

describe("an unauthorized user", () => {
    beforeEach(() => {
        setAuthToken(undefined);
    });

    it("should not be able to query for shopping lists", async () => {
        const response = await runGraphQlQuery({
            query: `query ShoppingList {
                shoppingLists {
                    id
                    owner
                    name
                }
            }`
        });
        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });

    it("should not be able to add a new shopping list", async () => {
        const response = await runGraphQlQuery({
            query: `mutation AddShoppingList($addShoppingListInput: addShoppingListInput!) {
                addShoppingList(input: $addShoppingListInput) {
                    id
                    owner
                    name
                }
            }`,
            variables: { addShoppingListInput: { name: "listName" } }
        });
        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });

    it("should not be able to rename a shopping list", async () => {
        const response = await runGraphQlQuery({
            query: `mutation RenameShoppingList($renameShoppingListInput: renameShoppingListInput!) {
                renameShoppingList(input: $renameShoppingListInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                renameShoppingListInput: { id: 1, name: "newListName" }
            }
        });
        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });

    it("should not be able to delete a shopping list", async () => {
        const response = await runGraphQlQuery({
            query: `mutation DeleteShoppingList($deleteShoppingListInput: deleteShoppingListInput!) {
                deleteShoppingList(input: $deleteShoppingListInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                deleteShoppingListInput: { id: 1 }
            }
        });
        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });
});

describe("an authorized user", () => {
    beforeEach(async () => {
        await login();

        // Reset shopping lists
        await ShoppingList.truncate();
        // Workaround for https://github.com/sequelize/sequelize/issues/11152
        if ((databaseConnection.getDialect() as Dialect) === "sqlite") {
            databaseConnection.query(
                "UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME=:tableName",
                {
                    replacements: { tableName: ShoppingList.getTableName() }
                }
            );
        }

        // Make sure we have our test list in the db
        // Only check for absence of errors, more detailed checks are done in a separate testcase
        await addShoppingList();
    });

    it("should be able to query all shoppinglists connected to the current user", async () => {
        const response = await runGraphQlQuery({
            query: `query ShoppingList {
                shoppingLists {
                    id
                    owner
                    name
                    listItems {
                        id
                    }
                }
            }`
        });
        expect(response.body.data?.shoppingLists[0].id).toBe("1");
        expect(response.body.data?.shoppingLists[0].owner).toBe("1");
        expect(response.body.data?.shoppingLists[0].name).toBe("testList");
        expect(response.body.data?.shoppingLists[0].listItems).toStrictEqual(
            []
        );
        expect(response.body.data?.shoppingLists).toHaveLength(1);
    });

    it("should be able to add a new shopping list", async () => {
        // Add a new shopping list
        const response = await runGraphQlQuery({
            query: `mutation AddShoppingList($addShoppingListInput: addShoppingListInput!) {
                addShoppingList(input: $addShoppingListInput) {
                    id
                    owner
                    name
                    listItems {
                        id
                    }
                }
            }`,
            variables: { addShoppingListInput: { name: "secondList" } }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.addShoppingList.id).toBe("2");
        expect(response.body.data?.addShoppingList.owner).toBe("1");
        expect(response.body.data?.addShoppingList.name).toBe("secondList");
        expect(response.body.data?.addShoppingList.listItems).toStrictEqual([]);

        // Verify that all items are now returned
        const responseCheck = await runGraphQlQuery({
            query: `query ShoppingList {
                shoppingLists {
                    id
                    owner
                    name
                    listItems {
                        id
                    }
                }
            }`
        });
        expect(responseCheck.body.data?.shoppingLists).toStrictEqual([
            {
                id: "1",
                owner: "1",
                name: "testList",
                listItems: []
            },
            {
                id: "2",
                owner: "1",
                name: "secondList",
                listItems: []
            }
        ]);
        expect(responseCheck.body.data?.shoppingLists).toHaveLength(2);
    });

    it("should be able to rename a shopping list", async () => {
        await addShoppingList("firstValue");

        // Rename the shopping list
        const response = await runGraphQlQuery({
            query: `mutation RenameShoppingList($renameShoppingListInput: renameShoppingListInput!) {
                renameShoppingList(input: $renameShoppingListInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                renameShoppingListInput: { id: 2, name: "updatedValue" }
            }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.renameShoppingList.success).toBe(true);
        expect(
            response.body.data?.renameShoppingList.failureMessage
        ).toBeNull();

        // Verify that all items are now returned
        const responseCheck = await runGraphQlQuery({
            query: `query ShoppingList {
                shoppingLists {
                    id
                    owner
                    name
                    listItems {
                        id
                    }
                }
            }`
        });

        expect(responseCheck.body.data?.shoppingLists).toStrictEqual([
            {
                id: "1",
                owner: "1",
                name: "testList",
                listItems: []
            },
            {
                id: "2",
                owner: "1",
                name: "updatedValue",
                listItems: []
            }
        ]);
    });

    it("should not be able to rename a non existing shopping list", async () => {
        const response = await runGraphQlQuery({
            query: `mutation RenameShoppingList($renameShoppingListInput: renameShoppingListInput!) {
                renameShoppingList(input: $renameShoppingListInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                renameShoppingListInput: { id: 3, name: "updatedValue" }
            }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.renameShoppingList.success).toBe(false);
        expect(response.body.data?.renameShoppingList.failureMessage).toBe(
            "Unknown list"
        );

        // Verify that lists are not touched
        const responseCheck = await runGraphQlQuery({
            query: `query ShoppingList {
                shoppingLists {
                    id
                    owner
                    name
                    listItems {
                        id
                    }
                }
            }`
        });

        expect(responseCheck.body.data?.shoppingLists).toStrictEqual([
            {
                id: "1",
                owner: "1",
                name: "testList",
                listItems: []
            }
        ]);
    });

    it("should not be able to rename a shopping list the user doesn't own", async () => {
        // First login with second user
        await login(1, true);

        // Try to rename the shopping list owned by first user
        const response = await runGraphQlQuery({
            query: `mutation RenameShoppingList($renameShoppingListInput: renameShoppingListInput!) {
                renameShoppingList(input: $renameShoppingListInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                renameShoppingListInput: { id: 1, name: "updatedValue" }
            }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.renameShoppingList.success).toBe(false);
        expect(response.body.data?.renameShoppingList.failureMessage).toBe(
            "Unknown list"
        );

        // Verify that lists are not touched
        await login(0, true);
        const responseCheck = await runGraphQlQuery({
            query: `query ShoppingList {
                shoppingLists {
                    id
                    owner
                    name
                    listItems {
                        id
                    }
                }
            }`
        });

        expect(responseCheck.body.data?.shoppingLists).toStrictEqual([
            {
                id: "1",
                owner: "1",
                name: "testList",
                listItems: []
            }
        ]);
    });

    it("should be able to delete a shopping list", async () => {
        await addShoppingList("secondList");

        // Delete the shopping list
        const response = await runGraphQlQuery({
            query: `mutation DeleteShoppingList($deleteShoppingListInput: deleteShoppingListInput!) {
                deleteShoppingList(input: $deleteShoppingListInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                deleteShoppingListInput: { id: 2 }
            }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.deleteShoppingList.success).toBe(true);
        expect(
            response.body.data?.deleteShoppingList.failureMessage
        ).toBeNull();

        // Verify that all items are now returned
        const responseCheck = await runGraphQlQuery({
            query: `query ShoppingList {
                shoppingLists {
                    id
                    owner
                    name
                    listItems {
                        id
                    }
                }
            }`
        });

        expect(responseCheck.body.data?.shoppingLists).toStrictEqual([
            {
                id: "1",
                owner: "1",
                name: "testList",
                listItems: []
            }
        ]);
    });

    it("should not be able to delete a shopping list the user doesn't own", async () => {
        // Login with second user
        await login(1, true);

        // Try to delete the shopping list owned by first user
        const response = await runGraphQlQuery({
            query: `mutation DeleteShoppingList($deleteShoppingListInput: deleteShoppingListInput!) {
                deleteShoppingList(input: $deleteShoppingListInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                deleteShoppingListInput: { id: 1 }
            }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.deleteShoppingList.success).toBe(false);
        expect(response.body.data?.deleteShoppingList.failureMessage).toBe(
            "Unknown list"
        );

        // Verify that lists are not touched
        await login(0, true);
        const responseCheck = await runGraphQlQuery({
            query: `query ShoppingList {
                shoppingLists {
                    id
                    owner
                    name
                    listItems {
                        id
                    }
                }
            }`
        });

        expect(responseCheck.body.data?.shoppingLists).toStrictEqual([
            {
                id: "1",
                owner: "1",
                name: "testList",
                listItems: []
            }
        ]);
    });

    it("should not be able to delete a non existing shopping list", async () => {
        const response = await runGraphQlQuery({
            query: `mutation DeleteShoppingList($deleteShoppingListInput: deleteShoppingListInput!) {
                deleteShoppingList(input: $deleteShoppingListInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                deleteShoppingListInput: { id: 3 }
            }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.deleteShoppingList.success).toBe(false);
        expect(response.body.data?.deleteShoppingList.failureMessage).toBe(
            "Unknown list"
        );

        // Verify that lists are not touched
        const responseCheck = await runGraphQlQuery({
            query: `query ShoppingList {
                shoppingLists {
                    id
                    owner
                    name
                    listItems {
                        id
                    }
                }
            }`
        });

        expect(responseCheck.body.data?.shoppingLists).toStrictEqual([
            {
                id: "1",
                owner: "1",
                name: "testList",
                listItems: []
            }
        ]);
    });
});
