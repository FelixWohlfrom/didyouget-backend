import * as jwt from "jsonwebtoken";

export interface CustomJwtPayload extends jwt.JwtPayload {
    userid: number;
    deviceToken: string;
}
