import jwt from "jsonwebtoken";
import { envHandler } from "../envHandler";
import { CustomJwtPayload } from "./model";

export const signToken = (data: CustomJwtPayload) => {
    return jwt.sign(data, envHandler.get("JWT_SECRET"));
};
