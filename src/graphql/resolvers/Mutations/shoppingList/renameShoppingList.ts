import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const renameShoppingList = async (
    _parent: object,
    args: { input: { id: number; name: string } },
    context: { auth: DidYouGetLoginData }
) => {
    const { id, name } = args.input;

    const list = await ShoppingList.findByPk(id);

    if (list?.owner !== context.auth.userid) {
        return {
            success: false,
            failureMessage: "Unknown list"
        };
    }

    list.name = name;
    await list.save();

    return {
        success: true
    };
};
