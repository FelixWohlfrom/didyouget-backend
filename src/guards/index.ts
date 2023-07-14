import { shield } from "graphql-shield";
import { envHandler } from "../utils/envHandler";

import { isAuthorized } from "./rules/isAuthorized";

export const permissions = shield(
    {
        Query: {
            // Device
            devices: isAuthorized,
            // ShoppingList
            shoppingLists: isAuthorized,
            // User
            isLoggedin: isAuthorized,
            user: isAuthorized,
            users: isAuthorized
        },
        Mutation: {
            // Device
            updateDeviceName: isAuthorized,
            // ShoppingList
            addShoppingList: isAuthorized,
            renameShoppingList: isAuthorized,
            deleteShoppingList: isAuthorized,
            // ShoppingListItem
            addShoppingListItem: isAuthorized,
            deleteShoppingListItem: isAuthorized,
            markShoppingListItemBought: isAuthorized,
            updateShoppingListItem: isAuthorized,
            // User
            updateUser: isAuthorized,
            logout: isAuthorized
        }
    },
    {
        allowExternalErrors: envHandler.isDevelopmentInstance()
    }
);
