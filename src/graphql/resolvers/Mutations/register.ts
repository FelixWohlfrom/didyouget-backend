import { User } from "../../../db/model";
import { hashPassword } from "../../../utils/index";

export const register = async (
    _parent: object,
    args: { input: { username: string; password: string } }
) => {
    const { username, password } = args.input;

    const hashedPassword = await hashPassword(password);

    await User.create({
        username: username,
        password: hashedPassword
    });

    return {
        success: true
    };
};
