import { User } from "../../../../db/model/User";

export const users = async () => {
    const result = await User.findAll();
    return result;
};
