import { ApolloServer } from "apollo-server-fastify";
import {
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageLocalDefault,
    ApolloServerPluginLandingPageDisabled
} from "apollo-server-core";

export const createApolloServer = (app: any, schema: any) => {
    return new ApolloServer({
        schema,
        cache: "bounded",
        csrfPrevention: true,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
            {
                serverWillStart: async () => {
                    return {
                        drainServer: async () => {
                            await app.close();
                        },
                    };
                },
            },
            process.env.NODE_ENV === "production"
                ? ApolloServerPluginLandingPageDisabled()
                : ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        ],
    });
};
