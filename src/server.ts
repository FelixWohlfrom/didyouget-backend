import { makeExecutableSchema } from "@graphql-tools/schema";
import fastify from "fastify";

import { typeDefs, resolvers } from "./graphql/index";
import { permissions } from "./guards/index";
import { createApolloServer } from "./apollo/index";
import { databaseConnection } from "./db/index";
import { envHandler } from "./utils/envHandler";
import { Dialect } from "sequelize";
import fastifyApollo, {
    ApolloFastifyContextFunction
} from "@as-integrations/fastify";
import { AppContext } from "./apollo/model";
import { getAuthData } from "./utils/auth/getAuthData";

export const startApolloServer = async (host: string, port: number) => {
    const app = fastify();

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers
    });

    const server = createApolloServer([permissions], app, schema);
    await server.start();

    if (
        envHandler.isDevelopmentInstance() &&
        // sqlite dialect currently "forgets" foreign keys while altering,
        // so we can't do this on every startup.
        (databaseConnection.getDialect() as Dialect) !== "sqlite"
    ) {
        await databaseConnection.sync({ alter: true });
    } else {
        await databaseConnection.sync();
    }

    const contextLoader: ApolloFastifyContextFunction<AppContext> = async (
        request
    ) => ({
        auth: getAuthData(request.headers)
    });

    await app.register(fastifyApollo(server), { context: contextLoader });
    await app.listen({ host: host, port: port });

    return app.server;
};
