import { Identifier } from "sequelize";
import { User } from "../../../db/model/User";

export const getUser = async (_parent: object, args: { id: Identifier }) => {
    const result = await User.findByPk(args.id);
    return result;
};
