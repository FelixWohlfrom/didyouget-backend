import { User } from "../../../db/model/index";

export const getUsers = async () => {
    const result = await User.findAll();
    return result;
};
