import crypto from "crypto";
import { Device } from "../../../../db/model/Device";
import { User } from "../../../../db/model/User";
import { DidYouGetLoginData } from "../../../../utils/auth/model";
import { signToken } from "../../../../utils/auth/signToken";
import { verifyPassword } from "../../../../utils/auth/verifyPassword";

export const login = async (
    _parent: object,
    args: { input: { username: string; password: string } },
    context: { auth: DidYouGetLoginData | undefined }
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

    const [device] = await Device.findOrCreate({
        where: {
            userId: user.id,
            token: context.auth?.deviceToken ? context.auth.deviceToken : ""
        }
    });
    device.token = crypto.randomUUID();
    device.loggedin = true;
    await device.save();

    return {
        token: signToken({ userid: user.id, deviceToken: device.token })
    };
};
