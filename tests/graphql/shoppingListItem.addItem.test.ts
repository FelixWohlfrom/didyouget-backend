import { Dialect } from "sequelize";
import { databaseConnection } from "../../src/db";
import { ListItem } from "../../src/db/model/ListItem";
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
    await login();
    await addShoppingList();
});

// after the tests we'll stop the server
afterAll(async () => {
    await stopServer();
});

describe("an unauthorized user", () => {
    beforeEach(() => {
        setAuthToken(undefined);
    });

    it("should not be able to add a new shopping list item", async () => {
        const response = await runGraphQlQuery({
            query: `mutation AddShoppingListItem($addShoppingListItemInput: addShoppingListItemInput!) {
                addShoppingListItem(input: $addShoppingListItemInput) {
                    id
                    value
                    bought
                }
            }`,
            variables: {
                addShoppingListItemInput: {
                    shoppingListId: 1,
                    value: "listItem"
                }
            }
        });

        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });
});

describe("an authorized user", () => {
    beforeEach(async () => {
        await login();

        // Reset shopping lists and list items
        await ShoppingList.truncate();
        await ListItem.truncate();
        // Workaround for https://github.com/sequelize/sequelize/issues/11152
        if ((databaseConnection.getDialect() as Dialect) === "sqlite") {
            databaseConnection.query(
                "UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME IN (:firstTable, :secondTable)",
                {
                    replacements: {
                        firstTable: ShoppingList.getTableName(),
                        secondTable: ListItem.getTableName()
                    }
                }
            );
        }

        // Add the shopping list again
        addShoppingList();

        // Add a shopping list item
        // Only check for absence of errors, more detailed checks are done in a separate testcase
        const response = await runGraphQlQuery({
            query: `mutation AddShoppingListItem($addShoppingListItemInput: addShoppingListItemInput!) {
                addShoppingListItem(input: $addShoppingListItemInput) {
                    id
                }
            }`,
            variables: {
                addShoppingListItemInput: {
                    shoppingListId: 1,
                    value: "listItem"
                }
            }
        });
        expect(response.body.errors).toBeUndefined();
    });

    it("should be able to query all shoppinglists items for a shopping list", async () => {
        const response = await runGraphQlQuery({
            query: `query ShoppingList {
                shoppingLists {
                    listItems {
                        id
                        value
                        bought
                    }
                }
            }`
        });

        const listItem = response.body.data?.shoppingLists[0].listItems[0];
        expect(listItem.id).toBe("1");
        expect(listItem.value).toBe("listItem");
        expect(listItem.bought).toBe(false);
    });

    it("should be able to add a new shopping list item", async () => {
        // Add a new shopping list item
        const response = await runGraphQlQuery({
            query: `mutation AddShoppingListItem($addShoppingListItemInput: addShoppingListItemInput!) {
                addShoppingListItem(input: $addShoppingListItemInput) {
                    id
                    value
                    bought
                }
            }`,
            variables: {
                addShoppingListItemInput: {
                    shoppingListId: 1,
                    value: "secondItem"
                }
            }
        });

        const newItem = response.body.data?.addShoppingListItem;
        expect(response.body.errors).toBeUndefined();
        expect(newItem.id).toBe("2");
        expect(newItem.value).toBe("secondItem");
        expect(newItem.bought).toBe(false);

        // Verify that all items are now returned
        const responseCheck = await runGraphQlQuery({
            query: `query ShoppingLists {
                shoppingLists {
                    listItems {
                        id
                        value
                        bought
                    }
                }
            }`
        });

        expect(responseCheck.body.data?.shoppingLists).toStrictEqual([
            {
                listItems: [
                    {
                        id: "1",
                        value: "listItem",
                        bought: false
                    },
                    {
                        id: "2",
                        value: "secondItem",
                        bought: false
                    }
                ]
            }
        ]);
    });

    it("should not be able to add items to non existing lists", async () => {
        // Add a new shopping list item to a non existing list
        const response = await runGraphQlQuery({
            query: `mutation AddShoppingListItem($addShoppingListItemInput: addShoppingListItemInput!) {
                addShoppingListItem(input: $addShoppingListItemInput) {
                    id
                    value
                    bought
                }
            }`,
            variables: {
                addShoppingListItemInput: {
                    shoppingListId: 2,
                    value: "secondItem"
                }
            }
        });

        const newItem = response.body.data?.addShoppingListItem;
        expect(response.body.errors).toBeUndefined();
        expect(newItem).toBeNull();
    });

    it("should be able to add a new shopping list item only to an own list", async () => {
        // Login as second user
        await registerUser(1);
        await login(1, true);

        // Add a new shopping list item to list of first user
        const response = await runGraphQlQuery({
            query: `mutation AddShoppingListItem($addShoppingListItemInput: addShoppingListItemInput!) {
                addShoppingListItem(input: $addShoppingListItemInput) {
                    id
                    value
                    bought
                }
            }`,
            variables: {
                addShoppingListItemInput: {
                    shoppingListId: 1,
                    value: "secondItem"
                }
            }
        });

        const newItem = response.body.data?.addShoppingListItem;
        expect(response.body.errors).toBeUndefined();
        expect(newItem).toBeNull();

        // Verify that all items are now not added for first user
        await login(0, true);
        const responseCheck = await runGraphQlQuery({
            query: `query ShoppingLists {
                shoppingLists {
                    listItems {
                        id
                        value
                        bought
                    }
                }
            }`
        });

        expect(responseCheck.body.data?.shoppingLists).toStrictEqual([
            {
                listItems: [
                    {
                        id: "1",
                        value: "listItem",
                        bought: false
                    }
                ]
            }
        ]);
    });
});
