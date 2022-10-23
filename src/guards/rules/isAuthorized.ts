import { rule } from "graphql-shield";
import { Device } from "../../db/model";
import { DidYouGetLoginData } from "../../utils/auth/model";

export const isAuthorized = rule()(
    async (
        _parent: object,
        _args: object,
        context: { auth: DidYouGetLoginData | undefined }
    ) => {
        if (!(context.auth && context.auth.deviceToken)) {
            return false;
        }

        const device = await Device.findOne({
            where: { token: context.auth.deviceToken, loggedin: true }
        });
        return !!device;
    }
);
