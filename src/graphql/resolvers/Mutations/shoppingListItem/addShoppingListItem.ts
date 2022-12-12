import { ListItem } from "../../../../db/model/ListItem";
import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const addShoppingListItem = async (
    _parent: object,
    args: { input: { shoppingListId: number; value: string } },
    context: { auth: DidYouGetLoginData }
) => {
    const { shoppingListId, value } = args.input;

    const list = await ShoppingList.findByPk(shoppingListId);

    if (list?.owner !== context.auth.userid) {
        return null;
    }

    const result = await ListItem.create({
        listId: shoppingListId,
        value: value
    });

    return result;
};
