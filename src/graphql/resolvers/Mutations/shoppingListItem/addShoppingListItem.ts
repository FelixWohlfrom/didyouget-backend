import { ListItem } from "../../../../db/model/ListItem";

export const addShoppingListItem = async (
    _parent: object,
    args: { input: { shoppingListId: number; value: string } }
) => {
    const { shoppingListId, value } = args.input;

    // TODO: Check if current user can access the shopping list (owner or shared)
    const result = await ListItem.create({
        listId: shoppingListId,
        value: value
    });

    return result;
};
