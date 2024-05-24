import { JwtPayload } from "jsonwebtoken";

export interface DidYouGetLoginData extends JwtPayload {
    userid: number;
    deviceToken: string;
}
