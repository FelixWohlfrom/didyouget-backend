import { hash } from "argon2";

export const hashPassword = async (password: string) => {
    return hash(password);
};
