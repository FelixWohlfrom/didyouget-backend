import { shield } from "graphql-shield";
import { envHandler } from "../utils/envHandler";

import { isAuthorized } from "./rules/index";

export const permissions = shield(
    {
        Query: {
            // User
            user: isAuthorized,
            users: isAuthorized
        },
        Mutation: {
            // Device
            updateDeviceName: isAuthorized,
            // ShoppingList
            addShoppingList: isAuthorized,
            // ShoppingListItem
            addShoppingListItem: isAuthorized,
            // User
            updateUser: isAuthorized,
            logout: isAuthorized
        }
    },
    {
        allowExternalErrors: envHandler.isDevelopmentInstance()
    }
);
