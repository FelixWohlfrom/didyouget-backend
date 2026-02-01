import { DataSource } from "typeorm";
import { getDatabase } from "../../src/db";
import { ListItem } from "../../src/db/model/ListItem";
import { ShoppingList } from "../../src/db/model/Shoppinglist";
import {
    setAuthToken,
    initServer,
    stopServer,
    login,
    runGraphQlQuery,
    registerUser,
    addShoppingList,
    addShoppingListItem
} from "./common";

let db: DataSource | null = null;

// before the tests we spin up a new Apollo Server
beforeAll(async () => {
    await initServer();
    await registerUser();
    await login();
    await addShoppingList();

    db = await getDatabase();
});

// after the tests we'll stop the server
afterAll(async () => {
    await stopServer();
});

describe("an unauthorized user", () => {
    beforeEach(() => {
        setAuthToken(undefined);
    });

    it("should not be able to delete a shopping list item", async () => {
        const response = await runGraphQlQuery({
            query: `mutation AddShoppingListItem($deleteShoppingListItemInput: deleteShoppingListItemInput!) {
                deleteShoppingListItem(input: $deleteShoppingListItemInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                deleteShoppingListItemInput: {
                    shoppingListItemId: 1
                }
            }
        });

        expect(response.body.errors[0].message).toBe("Not Authorised!");
    });
});

describe("an authorized user", () => {
    beforeEach(async () => {
        if (!db) return;

        await login();

        // Reset shopping lists and list items
        await db.getRepository(ShoppingList).clear();
        await db.getRepository(ListItem).clear();
        // Workaround for https://github.com/typeorm/typeorm/issues/4533
        if (db.options.type.includes("sqlite")) {
            await db
                .createQueryRunner()
                .query(
                    "UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME IN (:firstTable, :secondTable)",
                    [
                        {
                            firstTable:
                                db.getRepository(ShoppingList).metadata
                                    .tableName,
                            secondTable:
                                db.getRepository(ListItem).metadata.tableName
                        }
                    ]
                );
        }

        // Add the shopping list again
        await addShoppingList();

        // Add two shopping list items
        // Only check for absence of errors, more detailed checks are done in a separate testcase
        await addShoppingListItem();
        await addShoppingListItem(1, "secondItem");
    });

    it("should be able to delete a list item", async () => {
        const response = await runGraphQlQuery({
            query: `mutation DeleteShoppingListItem($deleteShoppingListItemInput: deleteShoppingListItemInput!) {
                deleteShoppingListItem(input: $deleteShoppingListItemInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                deleteShoppingListItemInput: {
                    shoppingListItemId: 1
                }
            }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.deleteShoppingListItem.success).toBe(true);
        expect(
            response.body.data?.deleteShoppingListItem.failureMessage
        ).toBeNull();

        // Verify that only remaining items are returned
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
                        id: "2",
                        value: "secondItem",
                        bought: false
                    }
                ]
            }
        ]);
    });

    it("should not be able to delete items of non existing item", async () => {
        const response = await runGraphQlQuery({
            query: `mutation DeleteShoppingListItem($deleteShoppingListItemInput: deleteShoppingListItemInput!) {
                deleteShoppingListItem(input: $deleteShoppingListItemInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                deleteShoppingListItemInput: {
                    shoppingListItemId: -1
                }
            }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.deleteShoppingListItem.success).toBe(false);
        expect(response.body.data?.deleteShoppingListItem.failureMessage).toBe(
            "Unknown list item"
        );

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

    it("should be able to delete a shopping list item only from an own list", async () => {
        // Login as second user
        await registerUser(1);
        await login(1, true);
        await addShoppingList("secondList");
        await addShoppingListItem(2);

        // Add a new shopping list item to list of first user
        const response = await runGraphQlQuery({
            query: `mutation DeleteShoppingListItem($deleteShoppingListItemInput: deleteShoppingListItemInput!) {
                deleteShoppingListItem(input: $deleteShoppingListItemInput) {
                    success
                    failureMessage
                }
            }`,
            variables: {
                deleteShoppingListItemInput: {
                    shoppingListItemId: 1
                }
            }
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data?.deleteShoppingListItem.success).toBe(false);
        expect(response.body.data?.deleteShoppingListItem.failureMessage).toBe(
            "Unknown list item"
        );

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
});
