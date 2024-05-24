import { ApolloServer } from "@apollo/server";
import {
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageProductionDefault
} from "@apollo/server/plugin/landingPage/default";
import { applyMiddleware } from "graphql-middleware";
import { GraphQLSchema } from "graphql";
import { FastifyInstance } from "fastify";
import { envHandler } from "../utils/envHandler";
import { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
import { AppContext } from "./model";

export const createApolloServer = (
    midlewares: [object],
    app: FastifyInstance,
    schema: GraphQLSchema
) => {
    const schemaWithPermissions = applyMiddleware(schema, ...midlewares);

    let landingPage = undefined;
    if (envHandler.isDevelopmentInstance()) {
        /* istanbul ignore next */ // eslint-disable-next-line new-cap
        landingPage = ApolloServerPluginLandingPageLocalDefault({
            embed: true
        });
    } else {
        // eslint-disable-next-line new-cap
        landingPage = ApolloServerPluginLandingPageProductionDefault({
            footer: false
        });
    }

    return new ApolloServer<AppContext>({
        schema: schemaWithPermissions,
        cache: "bounded",
        csrfPrevention: true,
        plugins: [fastifyApolloDrainPlugin(app), landingPage]
    });
};
