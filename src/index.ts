import * as dotenv from "dotenv";

dotenv.config();

import { startApolloServer } from "./server";

const boostrap = async () => {
    try {
        await startApolloServer();
        console.log(
            "[Apollo Server]: Up and Running at http://localhost:4000/graphql 🚀"
        );
    } catch (error) {
        console.log("[Apollo Server]: Process exiting ...");
        console.log(`[Apollo Server]: ${error}`);
        process.exit(1);
    }
};

boostrap();
