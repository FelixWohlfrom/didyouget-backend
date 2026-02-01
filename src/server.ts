import { makeExecutableSchema } from "@graphql-tools/schema";
import fastify from "fastify";

import { typeDefs, resolvers } from "./graphql/index";
import { permissions } from "./guards/index";
import { createApolloServer } from "./apollo/index";
import { getDatabase } from "./db/index";
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

    const db = await getDatabase();

    const contextLoader: ApolloFastifyContextFunction<AppContext> = async (
        request
    ) => ({
        auth: getAuthData(request.headers),
        db: db
    });

    await app.register(fastifyApollo(server), { context: contextLoader });
    await app.listen({ host: host, port: port });

    return app.server;
};
