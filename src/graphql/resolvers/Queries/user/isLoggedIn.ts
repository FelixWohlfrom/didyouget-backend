import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const isLoggedIn = (
    _parent: object,
    _args: object,
    context: { auth: DidYouGetLoginData }
) => {
    // If we already got this far, we can expect
    // to be logged in successfully.
    if (context.auth.userid) {
        return { success: true };
    }
};
