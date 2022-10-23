import jwt from "jsonwebtoken";
import { envHandler } from "../envHandler";
import { CustomJwtPayload } from "./model";

export const verifyToken = (token: string) => {
    return <CustomJwtPayload>jwt.verify(token, envHandler.get("JWT_SECRET"));
};
