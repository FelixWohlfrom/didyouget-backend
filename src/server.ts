import { makeExecutableSchema } from "@graphql-tools/schema";
import fastify from "fastify";

import { typeDefs, resolvers } from "./graphql/index";
import { permissions } from "./guards/index";
import { createApolloServer } from "./apollo/index";
import { databaseConnection } from "./db/index";
import { envHandler } from "./utils/envHandler";

export const startApolloServer = async () => {
    const app = fastify();

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers
    });

    const server = createApolloServer([permissions], app, schema);
    await server.start();

    if (envHandler.isDevelopmentInstance()) {
        await databaseConnection.sync({ alter: true });
    } else {
        await databaseConnection.sync();
    }

    app.register(server.createHandler());

    await app.listen(4000);
};
