import { User } from "../../../db/model/index";
import { CustomJwtPayload } from "../../../utils/auth/model";
import { hashPassword } from "../../../utils/hashPassword";

type UpdateValues = {
    username: string;
    password?: string;
};

export const updateUser = async (
    _parent: object,
    args: { input: { username: string; password: string | undefined } },
    context: { auth: CustomJwtPayload }
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
