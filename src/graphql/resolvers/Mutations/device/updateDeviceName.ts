import { Device } from "../../../../db/model/Device";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const updateDeviceName = async (
    _parent: object,
    args: { input: { newDeviceName: string } },
    context: { auth: DidYouGetLoginData }
) => {
    const { newDeviceName } = args.input;

    await Device.update(
        { name: newDeviceName },
        { where: { token: context.auth.deviceToken } }
    );

    return {
        success: true
    };
};
