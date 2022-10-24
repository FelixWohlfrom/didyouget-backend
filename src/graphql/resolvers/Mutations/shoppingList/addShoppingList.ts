import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const addShoppingList = async (
    _parent: object,
    args: { input: { name: string } },
    context: { auth: DidYouGetLoginData }
) => {
    const { name } = args.input;

    const result = await ShoppingList.create({
        name: name,
        owner: context.auth.userid
    });

    return result;
};
