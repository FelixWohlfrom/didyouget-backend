import * as dotenv from "dotenv";
import "reflect-metadata"; // This is required for typeorm

dotenv.config();

import { startApolloServer } from "./server";
import { envHandler } from "./utils/envHandler";

const boostrap = async () => {
    const port = Number.parseInt(envHandler.get("PORT", "4000"));
    const host = envHandler.get(
        "HOST",
        envHandler.isDevelopmentInstance() ? "localhost" : undefined
    );

    try {
        await startApolloServer(host, port);
        console.log(
            `[Apollo Server]: Up and Running at http://localhost:${port}/graphql 🚀`
        );
    } catch (error) {
        console.log("[Apollo Server]: Process exiting ...");
        console.log(`[Apollo Server]: ${error}`);
        process.exit(1);
    }
};

boostrap();
