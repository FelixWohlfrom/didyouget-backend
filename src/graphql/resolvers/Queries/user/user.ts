import { DataSource } from "typeorm";
import { User } from "../../../../db/model/User";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const user = async (
    _parent: object,
    args: { id: number | undefined },
    context: { auth: DidYouGetLoginData; db: DataSource }
) => {
    let id = args.id;
    if (!id) {
        id = context.auth.userid;
    }
    return context.db.getRepository(User).findOne({ where: [{ id: id }] });
};
