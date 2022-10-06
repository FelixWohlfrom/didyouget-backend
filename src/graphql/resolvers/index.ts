import * as Queries from "./Queries/index";
import * as Mutations from "./Mutations/index";

export const resolvers = {
    Query: {
        ...Queries
    },
    Mutation: {
        ...Mutations
    }
};
