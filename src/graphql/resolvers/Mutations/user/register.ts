import { User } from "../../../../db/model/User";
import { envHandler } from "../../../../utils/envHandler";
import { hashPassword } from "../../../../utils/auth/hashPassword";
import { UniqueConstraintError } from "sequelize";

export const register = async (
    _parent: object,
    args: { input: { username: string; password: string } }
) => {
    const { username, password } = args.input;

    const hashedPassword = await hashPassword(password);

    if (envHandler.get("ALLOW_REGISTRATION", "true") === "false") {
        return {
            success: false,
            failureMessage: "User registration is disabled by administrator."
        };
    }

    try {
        await User.create({
            username: username,
            password: hashedPassword
        });
    } catch (exception) {
        let failureDetails = exception;
        if (exception instanceof UniqueConstraintError) {
            failureDetails = "User already exists.";
        }

        return {
            success: false,
            failureMessage: "Failed to create the user. " + failureDetails
        };
    }

    return {
        success: true
    };
};
