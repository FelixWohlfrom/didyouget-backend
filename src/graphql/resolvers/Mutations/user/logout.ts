import { Device } from "../../../../db/model/Device";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const logout = async (
    _parent: object,
    _args: object,
    context: { auth: DidYouGetLoginData }
) => {
    if (context.auth.deviceToken) {
        await Device.update(
            { loggedin: false },
            {
                where: {
                    token: context.auth.deviceToken,
                    userId: context.auth.userid
                }
            }
        );
    }
    return {
        success: true
    };
};
