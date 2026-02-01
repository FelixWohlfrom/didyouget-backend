import crypto from "node:crypto";
import { Device } from "../../../../db/model/Device";
import { User } from "../../../../db/model/User";
import { DidYouGetLoginData } from "../../../../utils/auth/model";
import { signToken } from "../../../../utils/auth/signToken";
import { verifyPassword } from "../../../../utils/auth/verifyPassword";
import { DataSource } from "typeorm";

export const login = async (
    _parent: object,
    args: { input: { username: string; password: string } },
    context: { auth: DidYouGetLoginData | undefined; db: DataSource }
) => {
    const { username, password } = args.input;

    const user = await context.db
        .getRepository(User)
        .findOne({ where: { username } });

    // Use same message for invalid user or password to give potential
    // attackers no hint if the user or password is valid.
    const failureMesage = "Invalid user or password.";

    if (!user) {
        return {
            failureMessage: failureMesage
        };
    }

    const isValidPassword = await verifyPassword(user.password, password);

    if (!isValidPassword) {
        return {
            failureMessage: failureMesage
        };
    }

    let device = await context.db.getRepository(Device).findOneBy({
        userId: user.id,
        token: context.auth?.deviceToken ?? ""
    });
    device ??= new Device(); // Only create new device if load failed
    device.user = user;
    device.token = crypto.randomUUID();
    device.loggedin = true;
    await context.db.getRepository(Device).save(device);

    return {
        token: signToken({ userid: user.id, deviceToken: device.token })
    };
};
