import { ApolloServer } from "apollo-server-fastify";
import {
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault
} from "apollo-server-core";
import { applyMiddleware } from "graphql-middleware";
import { GraphQLSchema } from "graphql";
import { FastifyInstance } from "fastify";
import { getAuthData } from "../utils/auth/getAuthData";
import { envHandler } from "../utils/envHandler";

export const createApolloServer = (
    midlewares: [object],
    app: FastifyInstance,
    schema: GraphQLSchema
) => {
    const schemaWithPermissions = applyMiddleware(schema, ...midlewares);

    let landingPage = undefined;
    if (envHandler.isDevelopmentInstance()) {
        // eslint-disable-next-line new-cap
        landingPage = ApolloServerPluginLandingPageLocalDefault({
            embed: true
        });
    } else {
        // eslint-disable-next-line new-cap
        landingPage = ApolloServerPluginLandingPageProductionDefault({
            footer: false
        });
    }

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
            landingPage
        ]
    });
};
