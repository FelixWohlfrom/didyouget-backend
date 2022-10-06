import { Device } from "../../../db/model";
import { CustomJwtPayload } from "../../../utils/auth/model";

export const logout = async (
    _parent: object,
    _args: object,
    context: { auth: CustomJwtPayload }
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
