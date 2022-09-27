import { Identifier } from "sequelize";
import { UserModel } from "../../../db/model/index";

export const getUser = async (_parent: any, args: { id: Identifier }, _context: any) => {
    const result = await UserModel.findByPk(args.id);
    return result;
};
