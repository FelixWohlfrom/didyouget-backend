import { Dialect } from "sequelize";
import { databaseConnection } from "../../src/db";
import { ShoppingList } from "../../src/db/model/Shoppinglist";
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
        const response = await runGraphQlQuery({
            query: `mutation AddShoppingList($addShoppingListInput: addShoppingListInput!) {
                addShoppingList(input: $addShoppingListInput) {
                    id
                }
            }`,
            variables: { addShoppingListInput: { name: "testList" } }
        });

        expect(response.body.errors).toBeUndefined();
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
});
