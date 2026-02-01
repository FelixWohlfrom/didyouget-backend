import { DataSource } from "typeorm";
import { Device } from "../../../../db/model/Device";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const updateDeviceName = async (
    _parent: object,
    args: { input: { device: string } },
    context: { auth: DidYouGetLoginData; db: DataSource }
) => {
    const { device } = args.input;

    await context.db
        .getRepository(Device)
        .update({ token: context.auth.deviceToken }, { name: device });

    return {
        success: true
    };
};
