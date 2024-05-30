import { Device } from "../../../../db/model/Device";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const updateDeviceName = async (
    _parent: object,
    args: { input: { device: string } },
    context: { auth: DidYouGetLoginData }
) => {
    const { device } = args.input;

    await Device.update(
        { name: device },
        { where: { token: context.auth.deviceToken } }
    );

    return {
        success: true
    };
};
