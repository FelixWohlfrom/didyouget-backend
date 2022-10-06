import jwt from "jsonwebtoken";
import { envReader } from "../envReader";
import { CustomJwtPayload } from "./model";

export const signToken = (data: CustomJwtPayload) => {
    return jwt.sign(data, envReader.get("JWT_SECRET"));
};
