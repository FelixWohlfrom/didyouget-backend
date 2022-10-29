import { Identifier } from "sequelize";
import { User } from "../../../../db/model/User";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const user = async (
    _parent: object,
    args: { id: Identifier | undefined },
    context: { auth: DidYouGetLoginData }
) => {
    let id = args.id;
    if (!id) {
        id = context.auth.userid;
    }
    const result = await User.findByPk(id);
    return result;
};
