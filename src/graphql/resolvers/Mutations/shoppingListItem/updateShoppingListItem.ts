import { ListItem } from "../../../../db/model/ListItem";
import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const updateShoppingListItem = async (
    _parent: object,
    args: {
        input: {
            shoppingListItemId: number;
            newValue: string;
            bought: boolean;
        };
    },
    context: { auth: DidYouGetLoginData }
) => {
    const { shoppingListItemId, newValue, bought } = args.input;

    const listItem = await ListItem.findByPk(shoppingListItemId);
    const list = await ShoppingList.findByPk(listItem?.listId);

    // we know that we only have valid links in our db, so either we have both
    // list item and list, or none
    if (!listItem || list!.owner !== context.auth.userid) {
        return {
            success: false,
            failureMessage: "Unknown list item"
        };
    }

    listItem.value = newValue;
    if (bought !== undefined) {
        listItem.bought = bought;
    }
    await listItem.save();

    return { success: true };
};
