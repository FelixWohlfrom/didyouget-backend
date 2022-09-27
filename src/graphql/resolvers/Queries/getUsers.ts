import { UserModel } from "../../../db/model/index";

export const getUsers = async (_parent: any, args: any, _context: any) => {
    const result = await UserModel.findAll();
    return result;
};
