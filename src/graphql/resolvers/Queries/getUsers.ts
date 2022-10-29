import { User } from "../../../db/model/User";

export const getUsers = async () => {
    const result = await User.findAll();
    return result;
};
