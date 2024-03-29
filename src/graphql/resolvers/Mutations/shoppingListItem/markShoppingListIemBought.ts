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

    // we know that we only have valid links in our db, so either we have both
    // list item and list, or none
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!listItem || list!.owner !== context.auth.userid) {
        return {
            success: false,
            failureMessage: "Unknown list item"
        };
    }

    listItem.bought = bought;
    await listItem.save();

    return { success: true };
};
