import { verify } from "argon2";

export const verifyPassword = async (hash: string, password: string) => {
    return verify(hash, password);
};
