import * as jwt from "jsonwebtoken";

export interface DidYouGetLoginData extends jwt.JwtPayload {
    userid: number;
    deviceToken: string;
}
