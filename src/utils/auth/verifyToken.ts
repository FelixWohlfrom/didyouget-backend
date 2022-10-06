import jwt from "jsonwebtoken";
import { envReader } from "../envReader";
import { CustomJwtPayload } from "./model";

export const verifyToken = (token: string) => {
    return <CustomJwtPayload>jwt.verify(token, envReader.get("JWT_SECRET"));
};
