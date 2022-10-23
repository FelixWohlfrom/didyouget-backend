import { User } from "../../../db/model/index";
import { hashPassword } from "../../../utils/auth/hashPassword";
import { DidYouGetLoginData } from "../../../utils/auth/model";

type UpdateValues = {
    username: string;
    password?: string;
};

export const updateUser = async (
    _parent: object,
    args: { input: { username: string; password: string | undefined } },
    context: { auth: DidYouGetLoginData }
) => {
    const { username, password } = args.input;

    const data = <UpdateValues>{ username: username };
    if (password) {
        const hashedPassword = await hashPassword(password);
        data.password = hashedPassword;
    }

    await User.update(data, { where: { id: context.auth.userid } });
    const user = await User.findByPk(context.auth.userid);

    return {
        success: Boolean(user)
    };
};
