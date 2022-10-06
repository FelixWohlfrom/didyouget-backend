import { rule } from "graphql-shield";
import { Device } from "../../db/model";
import { CustomJwtPayload } from "../../utils/auth/model";

export const isAuthorized = rule()(
    async (
        _parent: object,
        _args: object,
        context: { auth: CustomJwtPayload }
    ) => {
        if (!context.auth.deviceToken) {
            return false;
        }

        const device = await Device.findOne({
            where: { token: context.auth.deviceToken, loggedin: true }
        });
        return !!device;
    }
);
