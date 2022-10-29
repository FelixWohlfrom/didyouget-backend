import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { DateTimeTypeDefinition } from "graphql-scalars";

export const typeDefs = loadSchemaSync(["./**/*.gql", DateTimeTypeDefinition], {
    loaders: [new GraphQLFileLoader()]
});
