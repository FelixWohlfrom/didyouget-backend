import { User } from "../../../../db/model/User";
import { envHandler } from "../../../../utils/envHandler";
import { hashPassword } from "../../../../utils/auth/hashPassword";
import { DataSource, TypeORMError } from "typeorm";

export const register = async (
    _parent: object,
    args: { input: { username: string; password: string } },
    context: { db: DataSource }
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
        await context.db.getRepository(User).insert({
            username: username,
            password: hashedPassword
        });
    } catch (exception) {
        let failureDetails = exception;
        if (
            exception instanceof TypeORMError &&
            exception.message.toLowerCase().includes("unique")
        ) {
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
