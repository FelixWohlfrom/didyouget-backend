import { User } from "../../../../db/model/User";
import { DidYouGetLoginData } from "../../../../utils/auth/model";
import { hashPassword } from "../../../../utils/auth/hashPassword";
import { DataSource } from "typeorm";

type UpdateValues = {
    username: string;
    password?: string;
};

export const updateUser = async (
    _parent: object,
    args: { input: { username: string; password: string | undefined } },
    context: { auth: DidYouGetLoginData; db: DataSource }
) => {
    const { username, password } = args.input;

    const data = <UpdateValues>{ username: username };
    if (password) {
        const hashedPassword = await hashPassword(password);
        data.password = hashedPassword;

        // TODO: Logout all other devices on password change
    }

    const repo = context.db.getRepository(User);
    await repo.update([{ id: context.auth.userid }], data);
    const user = await repo.findOneBy([{ id: context.auth.userid }]);

    return {
        success: Boolean(user)
    };
};
