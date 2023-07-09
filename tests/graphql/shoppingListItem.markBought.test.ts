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

    expect(response.body.errors).toBeUndefined();
});

// after the tests we'll stop the server
afterAll(async () => {
    await stopServer();
});

describe("an unauthorized user", () => {
    beforeEach(() => {
        setAuthToken(undefined);
    });

    it("should not be able to mark a shopping list item as bought", async () => {
        const response = await runGraphQlQuery({
            query: `mutation MarkShoppingListItemBought($boughtShoppingListItemInput: boughtShoppingListItemInput!) {
                markShoppingListItemBought(input: $boughtShoppingListItemInput) {
                    success
                }
            }`,
            variables: {
                boughtShoppingListItemInput: {
                    shoppingListItemId: 1
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
            await databaseConnection.query(
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
        await addShoppingList();

        // Add a shopping list item
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

    it("should be able to mark a shopping list item as bought using default parameter", async () => {
        // Mark item as bought
        const response = await runGraphQlQuery({
            query: `mutation MarkShoppingListItemBought($boughtShoppingListItemInput: boughtShoppingListItemInput!) {
                markShoppingListItemBought(input: $boughtShoppingListItemInput) {
                    success
                }
            }`,
            variables: {
                boughtShoppingListItemInput: {
                    shoppingListItemId: 1
                }
            }
        });

        const result = response.body.data?.markShoppingListItemBought;
        expect(response.body.errors).toBeUndefined();
        expect(result.success).toBe(true);

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
                        bought: true
                    }
                ]
            }
        ]);
    });

    it.each([true, false])(
        "should be able to mark a shopping list item as bought using explicit value %s",
        async (explicitParameter) => {
            // Mark item as bought
            const response = await runGraphQlQuery({
                query: `mutation MarkShoppingListItemBought($boughtShoppingListItemInput: boughtShoppingListItemInput!) {
                    markShoppingListItemBought(input: $boughtShoppingListItemInput) {
                        success
                    }
                }`,
                variables: {
                    boughtShoppingListItemInput: {
                        shoppingListItemId: 1,
                        bought: explicitParameter
                    }
                }
            });

            const result = response.body.data?.markShoppingListItemBought;
            expect(response.body.errors).toBeUndefined();
            expect(result.success).toBe(true);

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
                            bought: explicitParameter
                        }
                    ]
                }
            ]);
        }
    );

    it("should not be able to mark non existing items as bought", async () => {
        // Add a new shopping list item to a non existing list
        const response = await runGraphQlQuery({
            query: `mutation MarkShoppingListItemBought($boughtShoppingListItemInput: boughtShoppingListItemInput!) {
                markShoppingListItemBought(input: $boughtShoppingListItemInput) {
                    success
                }
            }`,
            variables: {
                boughtShoppingListItemInput: {
                    shoppingListItemId: 2
                }
            }
        });

        const result = response.body.data?.markShoppingListItemBought;
        expect(response.body.errors).toBeUndefined();
        expect(result.success).toBe(false);
    });

    it("should be able to update item status only to an own item", async () => {
        // Login as second user
        await registerUser(1);
        await login(1, true);

        // Update item of first user as bought
        const response = await runGraphQlQuery({
            query: `mutation MarkShoppingListItemBought($boughtShoppingListItemInput: boughtShoppingListItemInput!) {
                markShoppingListItemBought(input: $boughtShoppingListItemInput) {
                    success
                }
            }`,
            variables: {
                boughtShoppingListItemInput: {
                    shoppingListItemId: 1
                }
            }
        });

        const result = response.body.data?.markShoppingListItemBought;
        expect(response.body.errors).toBeUndefined();
        expect(result.success).toBe(false);

        // Verify that status for first user is still same
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
