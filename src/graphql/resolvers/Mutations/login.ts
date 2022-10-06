import crypto from "crypto";
import { Device, User } from "../../../db/model/index";
import { CustomJwtPayload } from "../../../utils/auth/model";
import { signToken, verifyPassword } from "../../../utils/index";

export const login = async (
    _parent: object,
    args: { input: { username: string; password: string } },
    context: { auth: CustomJwtPayload }
) => {
    const { username, password } = args.input;

    const user = await User.findOne({ where: { username } });

    if (!user) {
        throw Error("Invalid user");
    }

    const isValidPassword = await verifyPassword(user.password, password);

    if (!isValidPassword) {
        throw new Error("Invalid password");
    }

    const [device, created] = await Device.findOrCreate({
        where: { userId: user.id, token: context.auth.deviceToken ?? null }
    });
    if (!created) {
        device.token = crypto.randomUUID();
    }
    device.loggedin = true;
    await device.save();

    return {
        token: signToken({ userid: user.id, deviceToken: device.token })
    };
};
