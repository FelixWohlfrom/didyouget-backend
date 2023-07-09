import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const deleteShoppingList = async (
    _parent: object,
    args: { input: { id: number } },
    context: { auth: DidYouGetLoginData }
) => {
    const { id } = args.input;

    const list = await ShoppingList.findByPk(id);

    if (list?.owner !== context.auth.userid) {
        return {
            success: false,
            failureMessage: "Unknown list"
        };
    }

    await list.destroy();
    return {
        success: true
    };
};
