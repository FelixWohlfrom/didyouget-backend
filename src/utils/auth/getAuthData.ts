import { IncomingHttpHeaders } from "http";
import { verifyToken } from "./verifyToken";

export const getAuthData = (headers: IncomingHttpHeaders) => {
    const { authorization } = headers;
    if (!authorization) {
        return undefined;
    }

    const token = authorization.replace("Bearer", "").trim();
    return verifyToken(token);
};
