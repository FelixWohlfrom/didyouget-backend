import jwt from "jsonwebtoken";
import { envHandler } from "../envHandler";
import { DidYouGetLoginData } from "./model";

export const signToken = (data: DidYouGetLoginData) => {
    return jwt.sign(data, envHandler.get("JWT_SECRET"));
};
