import { Device } from "../../../../db/model/Device";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const devices = async (
    _parent: object,
    _args: object,
    context: { auth: DidYouGetLoginData }
) => {
    const result = await Device.findAll({
        where: { userId: context.auth.userid }
    });
    return result;
};
