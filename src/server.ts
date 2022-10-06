import { makeExecutableSchema } from "@graphql-tools/schema";
import fastify from "fastify";

import { typeDefs, resolvers } from "./graphql/index";
import { permissions } from "./guards/index";
import { createApolloServer } from "./apollo/index";
import { databaseConnection } from "./db/index";

export const startApolloServer = async () => {
    const app = fastify();

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers
    });

    const server = createApolloServer([permissions], app, schema);
    await server.start();

    if ((process.env.NODE_ENV || "development") === "development") {
        await databaseConnection.sync({ alter: true });
    } else {
        await databaseConnection.sync();
    }

    app.register(server.createHandler());

    await app.listen(4000);
};
