import { ListItem } from "../../../../db/model/ListItem";
import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const markShoppingListItemBought = async (
    _parent: object,
    args: { input: { shoppingListItemId: number; bought: boolean } },
    context: { auth: DidYouGetLoginData }
) => {
    let { shoppingListItemId, bought } = args.input;

    if (bought === undefined) {
        bought = true;
    }

    const listItem = await ListItem.findByPk(shoppingListItemId);
    const list = await ShoppingList.findByPk(listItem?.listId);

    if (list?.owner !== context.auth.userid) {
        return { success: false };
    }

    await ListItem.update(
        { bought: bought },
        { where: { id: shoppingListItemId } }
    );
    return { success: true };
};
