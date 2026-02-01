import { DataSource } from "typeorm";
import { User } from "../../../../db/model/User";

export const users = async (
    _parent: object,
    _args: object,
    context: { db: DataSource }
) => {
    return context.db.getRepository(User).find();
};
