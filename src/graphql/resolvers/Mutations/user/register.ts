import { User } from "../../../../db/model/User";
import { hashPassword } from "../../../../utils/auth/hashPassword";

export const register = async (
    _parent: object,
    args: { input: { username: string; password: string } }
) => {
    const { username, password } = args.input;

    const hashedPassword = await hashPassword(password);

    let success = true;
    try {
        await User.create({
            username: username,
            password: hashedPassword
        });
    } catch {
        success = false;
    }

    return {
        success: success
    };
};
