import { DataSource } from "typeorm";
import { Device } from "../../../../db/model/Device";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const devices = async (
    _parent: object,
    _args: object,
    context: { auth: DidYouGetLoginData; db: DataSource }
) => {
    const result = await context.db.getRepository(Device).find({
        where: { userId: context.auth.userid }
    });
    return result;
};
