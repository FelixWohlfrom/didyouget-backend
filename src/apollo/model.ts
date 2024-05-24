import { DidYouGetLoginData } from "../utils/auth/model";

export interface AppContext {
    auth: DidYouGetLoginData | undefined;
}
