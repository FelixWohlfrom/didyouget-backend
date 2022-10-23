import jwt from "jsonwebtoken";
import { envHandler } from "../envHandler";
import { DidYouGetLoginData } from "./model";

export const verifyToken = (token: string) => {
    return <DidYouGetLoginData>jwt.verify(token, envHandler.get("JWT_SECRET"));
};
