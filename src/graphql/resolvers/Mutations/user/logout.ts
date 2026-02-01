import { DataSource } from "typeorm";
import { Device } from "../../../../db/model/Device";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const logout = async (
    _parent: object,
    _args: object,
    context: { auth: DidYouGetLoginData; db: DataSource }
) => {
    if (context.auth.deviceToken) {
        await context.db
            .getRepository(Device)
            .update(
                [
                    { token: context.auth.deviceToken },
                    { userId: context.auth.userid }
                ],
                { loggedin: false }
            );
    }
    return {
        success: true
    };
};
