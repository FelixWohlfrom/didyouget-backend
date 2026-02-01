import { rule } from "graphql-shield";
import { Device } from "../../db/model/Device";
import { DidYouGetLoginData } from "../../utils/auth/model";
import { DataSource } from "typeorm";

export const isAuthorized = rule()(async (
    _parent: object,
    _args: object,
    context: { auth: DidYouGetLoginData | undefined; db: DataSource }
) => {
    if (!context.auth?.deviceToken) {
        return false;
    }

    const device = await context.db
        .getRepository(Device)
        .findOneBy([{ token: context.auth.deviceToken }, { loggedin: true }]);
    return !!device;
});
