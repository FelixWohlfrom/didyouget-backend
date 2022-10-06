import { shield } from "graphql-shield";

import { isAuthorized } from "./rules/index";

export const permissions = shield(
    {
        Query: {
            getUsers: isAuthorized,
            getUser: isAuthorized
        },
        Mutation: {
            updateUser: isAuthorized,
            logout: isAuthorized
        }
    },
    {
        allowExternalErrors:
            !process.env.NODE_ENV || process.env.NODE_ENV == "development"
    }
);
