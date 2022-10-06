import { ApolloServer } from "apollo-server-fastify";
import {
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageDisabled
} from "apollo-server-core";
import { applyMiddleware } from "graphql-middleware";
import { GraphQLSchema } from "graphql";
import { FastifyInstance } from "fastify";
import { getAuthData } from "../utils";

export const createApolloServer = (
    midlewares: [object],
    app: FastifyInstance,
    schema: GraphQLSchema
) => {
    const schemaWithPermissions = applyMiddleware(schema, ...midlewares);

    return new ApolloServer({
        schema: schemaWithPermissions,
        cache: "bounded",
        csrfPrevention: true,
        context: ({ request }) => ({
            auth: getAuthData(request.headers)
        }),
        plugins: [
            // eslint-disable-next-line new-cap
            ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
            {
                serverWillStart: async () => {
                    return {
                        drainServer: async () => {
                            await app.close();
                        }
                    };
                }
            },
            process.env.NODE_ENV === "production"
                ? ApolloServerPluginLandingPageDisabled() // eslint-disable-line new-cap
                : ApolloServerPluginLandingPageLocalDefault({ embed: true }) // eslint-disable-line new-cap
        ]
    });
};
