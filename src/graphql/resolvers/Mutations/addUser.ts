import { Optional } from "sequelize";
import { UserModel } from "../../../db/model/index";

export const addUser = async (_parent: any, args: { input: Optional<any, string> | undefined; }, _context: any) => {
    const result = await UserModel.create({ ...args.input });
    return result;
};
