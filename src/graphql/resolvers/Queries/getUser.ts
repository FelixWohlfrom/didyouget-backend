import { Identifier } from "sequelize";
import { User } from "../../../db/model/index";

export const getUser = async (_parent: object, args: { id: Identifier }) => {
    const result = await User.findByPk(args.id);
    return result;
};
